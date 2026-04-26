import { config } from 'dotenv';
import { Between } from 'typeorm';
import { Request, Response } from "express";
import database from '../../../../config/db';
import { db } from '../../../../firebase/firebase.config';
import { EmployeesRepository } from '../../../domain/repository/employees.repository';
import { EmployeeEntity } from '../../entity/employees.entity';
import { LaborEventEntity } from '../../entity/labor-event.entity';
import { JobDescriptionEntity } from '../../entity/job-description.entity';
import { EmployeeDocumentEntity } from '../../entity/employee-documents.entity';


config();

export class EmployeesController {
  constructor(private employeesRepository: EmployeesRepository<EmployeeEntity>) { }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body;
      console.log('[CREATE] Body recibido:', JSON.stringify(body, null, 2));
      const material = await this.employeesRepository.create(body);
      console.log('[CREATE] Empleado guardado en BD:', material?.id_employee);

      // Create Labor Event for initial position if exists
      if (body.position) {
        try {
          const laborEventRepo = database.getRepository(LaborEventEntity);
          const newEvent = new LaborEventEntity();
          newEvent.id_employee = body.id_employee;
          newEvent.event_date = new Date().toISOString().split('T')[0]; // Current date YYYY-MM-DD
          newEvent.event_name = 'Asignación de Puesto Inicial';
          newEvent.observation = `Se asignó el puesto: ${body.position}`;
          await laborEventRepo.save(newEvent);
        } catch (eventError) {
          console.error('Error creating labor event:', eventError);
        }

        // Sync Job Documents for initial position
        await this.syncJobDocuments(body.id_employee, body.position);
      }

      res.status(200).json({ message: 'Agregado correctamente' });
    } catch (error: any) {
      console.error('[CREATE] ERROR:', error?.message);
      console.error('[CREATE] Detalle:', error?.detail || error?.sqlMessage || error?.code || '');
      console.error('[CREATE] Stack:', error?.stack);
      res.status(500).json({ message: 'Error', error: error?.message, detail: error?.detail || error?.sqlMessage });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const materials = await this.employeesRepository.list();
      res.status(200).json(materials);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar a los colaboradores', error });
    }
  }

  async get(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const material = await this.employeesRepository.get(id);
      res.status(200).json(material);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener al colaborador', error });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const body = req.body;

      // Get existing employee to check for position change
      const existingEmployee = await this.employeesRepository.get(String(id));

      // Check for Rehire to update status
      if (body.rehire_date && existingEmployee && body.rehire_date !== existingEmployee.rehire_date) {
        body.status = true;
      }

      // Extract non-entity fields to prevent SQL errors during update
      const { rehire_document_path, rehire_document_name, ...updateData } = body;

      const material = await this.employeesRepository.update(String(id), updateData);

      // Check if position changed
      if (existingEmployee && body.position && existingEmployee.position !== body.position) {
        try {
          const laborEventRepo = database.getRepository(LaborEventEntity);
          const newEvent = new LaborEventEntity();
          newEvent.id_employee = String(id);
          newEvent.event_date = new Date().toISOString().split('T')[0];
          newEvent.event_name = 'Cambio de Puesto';
          newEvent.observation = `Cambio de puesto de ${existingEmployee.position || 'Sin puesto'} a ${body.position}`;
          await laborEventRepo.save(newEvent);
        } catch (eventError) {
          console.error('Error creating labor event for position change:', eventError);
        }

        // Sync Job Documents for new position
        if (body.position) {
          await this.syncJobDocuments(String(id), body.position);
        }
      }

      // Check for Rehire (Reingreso)
      if (body.rehire_date && body.rehire_date !== existingEmployee?.rehire_date) {
        try {
          const laborEventRepo = database.getRepository(LaborEventEntity);
          const newEvent = new LaborEventEntity();
          newEvent.id_employee = String(id);
          newEvent.event_date = body.rehire_date;
          newEvent.event_name = 'Reingreso';
          newEvent.observation = 'Reingreso de colaborador';
          newEvent.document_path = body.rehire_document_path || '';
          await laborEventRepo.save(newEvent);

          // Save document to repository if provided
          if (body.rehire_document_path && body.rehire_document_name) {
            const docRepo = database.getRepository(EmployeeDocumentEntity);
            const newDoc = new EmployeeDocumentEntity();
            newDoc.id_employee = String(id);
            newDoc.document_type = body.rehire_document_name;
            newDoc.document_path = body.rehire_document_path;
            newDoc.upload_date = new Date();
            await docRepo.save(newDoc);
          }

          // Ensure status is active on rehire
          // We can optionally force status=true here if not already set in body

        } catch (eventError) {
          console.error('Error creating rehire event:', eventError);
        }
      }

      res.status(200).json({ message: 'Actualizado correctamente' });
    } catch (error: any) {
      console.error('Error al actualizar colaborador:', error);
      const errorMessage = error?.message || 'Error desconocido';
      const errorDetail = error?.detail || error?.sqlMessage || '';
      res.status(500).json({
        message: `Error al actualizar al colaborador: ${errorMessage}`,
        detail: errorDetail,
        error: error?.toString()
      });
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const material = await this.employeesRepository.remove(String(id));
      res.status(200).json({ message: 'Eliminado correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al eliminar', error });
    }
  }

  async syncToFirebase(req: Request, res: Response): Promise<void> {
    try {
      try {
        await db.ref().child('test').once('value');
      } catch {
        res.status(500).json({ message: 'Error al conectar con Firebase' });
        return;
      }

      await this.employeesRepository.syncToFirebase();

      const repository = database.getRepository(EmployeeEntity);
      const count = await repository.count();

      res.status(200).json({
        message: 'Sincronización desde Firebase completada correctamente.',
      });
    } catch {
      res.status(500).json({ message: 'Error al sincronizar desde Firebase' });
    }
  }


  async getExpiringContracts(req: Request, res: Response): Promise<void> {
    try {
      const today = new Date();
      // Format today
      const yearToday = today.getFullYear();
      const monthToday = String(today.getMonth() + 1).padStart(2, '0');
      const dayToday = String(today.getDate()).padStart(2, '0');
      const formattedToday = `${yearToday}-${monthToday}-${dayToday}`;

      // Calculate date 8 days from now
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + 8);
      const yearTarget = targetDate.getFullYear();
      const monthTarget = String(targetDate.getMonth() + 1).padStart(2, '0');
      const dayTarget = String(targetDate.getDate()).padStart(2, '0');
      const formattedTarget = `${yearTarget}-${monthTarget}-${dayTarget}`;

      console.log('--- Expiring Contracts Debug ---');
      console.log('Checking range:', formattedToday, 'to', formattedTarget);

      const repository = database.getRepository(EmployeeEntity);

      const employees = await repository.find({
        where: {
          contract_expiration: Between(formattedToday, formattedTarget),
          status: true
        }
      });

      res.status(200).json(employees);
    } catch (error) {
      console.error('Error fetching expiring contracts:', error);
      res.status(500).json({ message: 'Error seeking expiring contracts', error });
    }
  }

  private async syncJobDocuments(employeeId: string, position: string) {
    try {
      console.log(`[syncJobDocuments] START: Employee=${employeeId}, Position='${position}'`);
      // Note: required_documents field was removed in the job description restructure.
      // This function is now a placeholder for future document sync logic.
      console.log('[syncJobDocuments] Document sync skipped - restructured job descriptions no longer use required_documents field.');
    } catch (error) {
      console.error('[syncJobDocuments] FATAL ERROR:', error);
    }
  }

}
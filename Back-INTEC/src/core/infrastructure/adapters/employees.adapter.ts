import { Query, Id } from "../../domain/repository/users.repository";
import database from "../../../config/db";
import { NotFound } from "http-errors";
import { error } from "console";
import { EmployeesRepository } from "../../domain/repository/employees.repository";
import { EmployeeEntity } from "../entity/employees.entity";
import { db } from "../../../firebase/firebase.config";
import { LaborEventEntity } from "../entity/labor-event.entity";
import { EmployeeDocumentEntity } from "../entity/employee-documents.entity";

export class EmployeesAdapterRepository implements EmployeesRepository<EmployeeEntity> {

  async create(data: Partial<EmployeeEntity>, query?: Query): Promise<EmployeeEntity> {
    const repository = database.getRepository(EmployeeEntity);

    console.log('[ADAPTER CREATE] id_employee:', data.id_employee);
    console.log('[ADAPTER CREATE] name_employee:', data.name_employee);
    console.log('[ADAPTER CREATE] email:', data.email);
    console.log('[ADAPTER CREATE] phone:', data.phone);
    console.log('[ADAPTER CREATE] role:', data.role);

    const material = repository.create({ ...data });

    try {
      console.log('[ADAPTER CREATE] Intentando repository.save...');
      await repository.save(material);
      console.log('[ADAPTER CREATE] repository.save OK');
    } catch (dbError: any) {
      console.error('[ADAPTER CREATE] ERROR en repository.save:', dbError?.message);
      console.error('[ADAPTER CREATE] sqlMessage:', dbError?.sqlMessage);
      console.error('[ADAPTER CREATE] code:', dbError?.code);
      console.error('[ADAPTER CREATE] detail:', dbError?.detail);
      throw dbError;
    }

    try {
      console.log('[ADAPTER CREATE] Intentando createOnRTDB...');
      await this.createOnRTDB(material);
      console.log('[ADAPTER CREATE] createOnRTDB OK');
    } catch (fbError: any) {
      console.error('[ADAPTER CREATE] ERROR en createOnRTDB:', fbError?.message);
      throw fbError;
    }

    return repository.findOneOrFail({
      where: { id_employee: data.id_employee },
    });
  }

  async list(query?: Query): Promise<EmployeeEntity[]> {
    const repository = database.getRepository(EmployeeEntity);
    return repository.find({
      where: { is_dev: false },
    });
  }

  async get(id: Id, query?: Query): Promise<EmployeeEntity> {
    const repository = database.getRepository(EmployeeEntity);
    const data = await repository.findOne({
      where: { id_employee: id as string },
    });
    if (!data) {
      throw new NotFound("No existe el material con el id proporcionado");
    }

    // Fetch latest Rehire info
    const laborRepo = database.getRepository(LaborEventEntity);
    const rehireEvent = await laborRepo.findOne({
      where: { id_employee: id as string, event_name: 'Reingreso' },
      order: { event_date: 'DESC' }
    });

    console.log('[EmployeesAdapter] Get ID:', id);
    console.log('[EmployeesAdapter] Rehire Event:', rehireEvent ? 'Found' : 'Not Found');
    if (rehireEvent) console.log('[EmployeesAdapter] Path:', rehireEvent.document_path);

    const result: any = { ...data };
    if (rehireEvent) {
      result.rehire_document_path = rehireEvent.document_path;
      // Force assignment if undefined?
      if (!result.rehire_document_path) result.rehire_document_path = null;

      if (rehireEvent.document_path) {
        const docRepo = database.getRepository(EmployeeDocumentEntity);
        const doc = await docRepo.findOne({
          where: { id_employee: id.toString(), document_path: rehireEvent.document_path }
        });
        if (doc) {
          result.rehire_document_name = doc.document_type;
        }
      }
    }

    return result;
  }

  async update(id: Id, data: Partial<EmployeeEntity>, query?: Query): Promise<EmployeeEntity> {
    const repository = database.getRepository(EmployeeEntity);
    await repository.update(id, data);
    const updated = await this.get(id);

    // Verificar si existe en Firebase RTDB
    const existsInRTDB = await this.existsInRTDB(id.toString());

    if (existsInRTDB) {
      await this.updateOnRTDB(updated);
    } else {
      await this.createOnRTDB(updated);
    }

    return this.get(id);
  }

  async remove(id: Id, query?: Query): Promise<EmployeeEntity> {
    const repository = database.getRepository(EmployeeEntity);

    const data = await this.get(id, query);
    await repository.update({ id_employee: id.toString() }, { status: false });
    await this.deleteFromRTDB(id.toString());
    return data;
  }

  async syncToFirebase(): Promise<{}> {
    const repository = database.getRepository(EmployeeEntity);
    try {
      const snapshot = await db.ref('Perfiles').once('value');
      const data = snapshot.val();

      if (!data || Object.keys(data).length === 0) {
        console.log('No se encontraron perfiles en Firebase.');
      }

      const operaciones = [];

      for (const key in data) {
        const item = data[key];

        if (!item || !item.uuid) {
          continue;
        }

        const newData = {
          name_employee: item.nombre || '',
          email: item.correo || '',
          pAut1: item.pAut1 || '0',
          pAut2: item.pAut2 || '0',
          pAut3: item.pAut3 || '0',
          pCapSol: item.pCapSol || '0',
          pComSol: item.pComSol || '0',
          pControlSol: item.pControlSol || '0',
          pEdCats: item.pEdCats || '0',
          pEdSol: item.pEdSol || '0',
          pEstadisticas: item.pEstadisticas || '0',
          pHistorial: item.pHistorial || '0',
          pUsuarios: item.pUsuarios || '0',
          pVerCats: item.pVerCats || '0',

          pDescripcionesPuestos: item.pDescripcionesPuestos || '0',
          pPermisosVacaciones: item.pPermisosVacaciones || '0',
          pAlertaContratos: item.pAlertaContratos || '0',
          phone: item.telefono || '',
          role: item.rol || '',
          // New fields
          admission_date: item.admission_date || '',
          position: item.position || '',
          location: item.location || '',
          gender: item.gender || '',
          age: item.age || 0,
          marital_status: item.marital_status || '',
          education_level: item.education_level || '',
          ine_code: item.ine_code || '',
          address: item.address || '',
          birth_place: item.birth_place || '',
          birth_date: item.birth_date || '',
          nss: item.nss || '',
          rfc: item.rfc || '',
          curp: item.curp || '',
          children_count: item.children_count || 0,
          child1_name: item.child1_name || '',
          child1_birth_date: item.child1_birth_date || '',
          child2_name: item.child2_name || '',
          child2_birth_date: item.child2_birth_date || '',
          child3_name: item.child3_name || '',
          child3_birth_date: item.child3_birth_date || '',
          child4_name: item.child4_name || '',
          child4_birth_date: item.child4_birth_date || '',
          child5_name: item.child5_name || '',
          child5_birth_date: item.child5_birth_date || '',
          beneficiary: item.beneficiary || '',
          beneficiary_relationship: item.beneficiary_relationship || '',
          beneficiary_percentage: item.beneficiary_percentage || '',
          infonavit_credit_number: item.infonavit_credit_number || '',
          infonavit_factor: item.infonavit_factor || '',
          blood_type: item.blood_type || '',
          weight: item.weight || '',
          height: item.height || '',
          emergency_phone: item.emergency_phone || '',
          emergency_contact_name: item.emergency_contact_name || '',
          emergency_contact_relationship: item.emergency_contact_relationship || '',
          allergies: item.allergies || '',
          contract_expiration: item.contract_expiration || ''
        };

        operaciones.push(
          (async () => {
            try {
              const existing = await repository.findOne({ where: { id_employee: item.uuid } });

              if (!existing) {
                const entity = repository.create({
                  id_employee: item.uuid,
                  ...newData,
                  status: true
                });

                await repository.save(entity);

              } else {
                // Simply merge new data
                Object.assign(existing, newData);
                await repository.save(existing);
              }
            } catch (error) {
              console.error(`Error procesando empleado ${item.uuid}:`, error);
            }
          })()
        );
      }

      await Promise.all(operaciones);

      return {
        success: true,
      };
    } catch (error) {
      console.error('Error en sincronización de perfiles:', error);
      throw error;
    }
  }


  private async createOnRTDB(employee: EmployeeEntity): Promise<void> {
    const admin = require('firebase-admin');
    const db = admin.database();

    const ref = db.ref('Perfiles/' + employee.id_employee);

    const snapshot = await ref.once('value');
    if (snapshot.exists()) {
      return;
    }

    await ref.set({
      uuid: employee.id_employee,
      nombre: employee.name_employee,
      correo: employee.email,
      telefono: employee.phone,
      rol: employee.role,
      status: employee.status,
      // Permissions
      pAut1: employee.pAut1 || '0',
      pAut2: employee.pAut2 || '0',
      pAut3: employee.pAut3 || '0',
      pCapSol: employee.pCapSol || '0',
      pComSol: employee.pComSol || '0',
      pControlSol: employee.pControlSol || '0',
      pEdCats: employee.pEdCats || '0',
      pEdSol: employee.pEdSol || '0',
      pEstadisticas: employee.pEstadisticas || '0',
      pHistorial: employee.pHistorial || '0',
      pUsuarios: employee.pUsuarios || '0',
      pVerCats: employee.pVerCats || '0',

      pDescripcionesPuestos: employee.pDescripcionesPuestos || '0',
      pPermisosVacaciones: employee.pPermisosVacaciones || '0',
      pAlertaContratos: employee.pAlertaContratos || '0',
      // New fields
      admission_date: employee.admission_date || '',
      position: employee.position || '',
      location: employee.location || '',
      gender: employee.gender || '',
      age: employee.age || 0,
      marital_status: employee.marital_status || '',
      education_level: employee.education_level || '',
      ine_code: employee.ine_code || '',
      address: employee.address || '',
      birth_place: employee.birth_place || '',
      birth_date: employee.birth_date || '',
      nss: employee.nss || '',
      rfc: employee.rfc || '',
      curp: employee.curp || '',
      children_count: employee.children_count || 0,
      child1_name: employee.child1_name || '',
      child1_birth_date: employee.child1_birth_date || '',
      child2_name: employee.child2_name || '',
      child2_birth_date: employee.child2_birth_date || '',
      child3_name: employee.child3_name || '',
      child3_birth_date: employee.child3_birth_date || '',
      child4_name: employee.child4_name || '',
      child4_birth_date: employee.child4_birth_date || '',
      child5_name: employee.child5_name || '',
      child5_birth_date: employee.child5_birth_date || '',
      beneficiary: employee.beneficiary || '',
      beneficiary_relationship: employee.beneficiary_relationship || '',
      beneficiary_percentage: employee.beneficiary_percentage || '',
      infonavit_credit_number: employee.infonavit_credit_number || '',
      infonavit_factor: employee.infonavit_factor || '',
      blood_type: employee.blood_type || '',
      weight: employee.weight || '',
      height: employee.height || '',
      emergency_phone: employee.emergency_phone || '',
      emergency_contact_name: employee.emergency_contact_name || '',
      emergency_contact_relationship: employee.emergency_contact_relationship || '',
      allergies: employee.allergies || '',
      contract_expiration: employee.contract_expiration || ''
    });
  }

  private async updateOnRTDB(employee: EmployeeEntity): Promise<void> {
    const admin = require('firebase-admin');
    const db = admin.database();

    const ref = db.ref('Perfiles/' + employee.id_employee);

    const snapshot = await ref.once('value');
    if (!snapshot.exists()) {
      throw new Error('El empleado no existe en Firebase');
    }

    await ref.update({
      nombre: employee.name_employee,
      correo: employee.email,
      telefono: employee.phone,
      rol: employee.role,
      status: employee.status,
      // Permissions
      pAut1: employee.pAut1 || '0',
      pAut2: employee.pAut2 || '0',
      pAut3: employee.pAut3 || '0',
      pCapSol: employee.pCapSol || '0',
      pComSol: employee.pComSol || '0',
      pControlSol: employee.pControlSol || '0',
      pEdCats: employee.pEdCats || '0',
      pEdSol: employee.pEdSol || '0',
      pEstadisticas: employee.pEstadisticas || '0',
      pHistorial: employee.pHistorial || '0',
      pUsuarios: employee.pUsuarios || '0',
      pVerCats: employee.pVerCats || '0',

      pDescripcionesPuestos: employee.pDescripcionesPuestos || '0',
      pPermisosVacaciones: employee.pPermisosVacaciones || '0',
      pAlertaContratos: employee.pAlertaContratos || '0',
      // New fields
      admission_date: employee.admission_date || '',
      position: employee.position || '',
      location: employee.location || '',
      gender: employee.gender || '',
      age: employee.age || 0,
      marital_status: employee.marital_status || '',
      education_level: employee.education_level || '',
      ine_code: employee.ine_code || '',
      address: employee.address || '',
      birth_place: employee.birth_place || '',
      birth_date: employee.birth_date || '',
      nss: employee.nss || '',
      rfc: employee.rfc || '',
      curp: employee.curp || '',
      children_count: employee.children_count || 0,
      child1_name: employee.child1_name || '',
      child1_birth_date: employee.child1_birth_date || '',
      child2_name: employee.child2_name || '',
      child2_birth_date: employee.child2_birth_date || '',
      child3_name: employee.child3_name || '',
      child3_birth_date: employee.child3_birth_date || '',
      child4_name: employee.child4_name || '',
      child4_birth_date: employee.child4_birth_date || '',
      child5_name: employee.child5_name || '',
      child5_birth_date: employee.child5_birth_date || '',
      beneficiary: employee.beneficiary || '',
      beneficiary_relationship: employee.beneficiary_relationship || '',
      beneficiary_percentage: employee.beneficiary_percentage || '',
      infonavit_credit_number: employee.infonavit_credit_number || '',
      infonavit_factor: employee.infonavit_factor || '',
      blood_type: employee.blood_type || '',
      weight: employee.weight || '',
      height: employee.height || '',
      emergency_phone: employee.emergency_phone || '',
      emergency_contact_name: employee.emergency_contact_name || '',
      emergency_contact_relationship: employee.emergency_contact_relationship || '',
      allergies: employee.allergies || '',
      contract_expiration: employee.contract_expiration || ''
    });
  }




  private async existsInRTDB(id: string): Promise<boolean> {
    try {
      const admin = require('firebase-admin');
      const db = admin.database();
      const ref = db.ref('Perfiles/' + id);
      const snapshot = await ref.once('value');
      return snapshot.exists();
    } catch (error) {
      console.error('Error al verificar existencia en Firebase RTDB:', error);
      return false;
    }
  }

  private async deleteFromRTDB(id: string): Promise<void> {
    const admin = require('firebase-admin');
    const db = admin.database();

    const ref = db.ref('Perfiles/' + id);
    await ref.remove();
  }




}
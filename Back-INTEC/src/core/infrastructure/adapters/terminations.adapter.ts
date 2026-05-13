import { TerminationRepository, Query, Id } from "../../domain/repository/terminations.repository";
import { TerminationEntity } from "../entity/terminations.entity";
import { LaborEventEntity } from "../entity/labor-event.entity";
import database from "../../../config/db";
import { NotFound } from "http-errors";

import { EmployeeDocumentEntity } from "../entity/employee-documents.entity";
import { EmployeeEntity } from "../entity/employees.entity";

export class TerminationAdapterRepository implements TerminationRepository<TerminationEntity> {

    async create(data: Partial<TerminationEntity>, query?: Query): Promise<TerminationEntity> {
        const repository = database.getRepository(TerminationEntity);
        const laborEventRepository = database.getRepository(LaborEventEntity);
        const documentRepository = database.getRepository(EmployeeDocumentEntity);
        const employeeRepository = database.getRepository(EmployeeEntity);

        // 1. Create Termination Record
        const termination = repository.create(data);
        await repository.save(termination);

        // 2. Sync to Labor Relations (Create Event)
        try {
            const laborEvent = laborEventRepository.create({
                id_employee: termination.id_employee,
                event_date: termination.last_work_day,
                event_name: 'Baja de Personal',
                observation: `Motivo: ${termination.reason}. Observación: ${termination.observation || ''}. Documento: ${termination.document_name || 'Sin nombre'}. ID Baja: ${termination.id}`,
                document_path: termination.document_path
            });
            await laborEventRepository.save(laborEvent);

            // 3. Update Termination with Labor Event ID
            termination.labor_event_id = laborEvent.id;
            await repository.save(termination);
        } catch (error) {
            console.error("[CRITICAL ERROR] Error creating synced Labor Event:", error);
        }

        // 4. Update Employee Status to Inactive (False)
        try {
            const employee = await employeeRepository.findOne({ where: { id_employee: termination.id_employee } });
            if (employee) {
                employee.status = false;
                await employeeRepository.save(employee);
            }
        } catch (error) {
            console.error("[CRITICAL ERROR] Error updating employee status:", error);
        }

        // 5. Sync to Document Repository (if files exist)
        const pathsToSync: string[] = [];
        if (termination.document_paths && termination.document_paths.length > 0) {
            pathsToSync.push(...termination.document_paths);
        } else if (termination.document_path) {
            pathsToSync.push(termination.document_path);
        }

        for (const path of pathsToSync) {
            try {
                const doc = documentRepository.create({
                    id_employee: termination.id_employee,
                    document_type: (termination.document_name || 'Baja').substring(0, 50),
                    document_path: path
                });
                await documentRepository.save(doc);
            } catch (error) {
                console.error("Error creating synced Document:", error);
            }
        }

        return termination;
    }

    async list(query?: Query): Promise<TerminationEntity[]> {
        const repository = database.getRepository(TerminationEntity);
        return repository.find({
            relations: ['employee'],
            order: { created_at: 'DESC' }
        });
    }

    async get(id: Id, query?: Query): Promise<TerminationEntity> {
        const repository = database.getRepository(TerminationEntity);
        const termination = await repository.findOne({ where: { id: Number(id) } });

        if (!termination) {
            throw new NotFound("No existe la baja con el id proporcionado");
        }
        return termination;
    }

    async update(id: Id, data: Partial<TerminationEntity>, query?: Query): Promise<TerminationEntity> {
        const repository = database.getRepository(TerminationEntity);
        const laborEventRepository = database.getRepository(LaborEventEntity);

        // 1. Update Termination Record
        await repository.update(id, data);
        const updatedTermination = await this.get(id);

        // 2. Sync to Labor Relations (Update Event)
        if (updatedTermination.labor_event_id) {
            try {
                await laborEventRepository.update(updatedTermination.labor_event_id, {
                    event_date: updatedTermination.last_work_day,
                    observation: `Motivo: ${updatedTermination.reason}. Observación: ${updatedTermination.observation || ''}. Documento: ${updatedTermination.document_name || 'Sin nombre'}. ID Baja: ${updatedTermination.id}`,
                    document_path: updatedTermination.document_path
                });
            } catch (error) {
                console.error("Error updating synced Labor Event:", error);
            }
        }

        // 3. Sync to Document Repository (if new files exist in update)
        const newPaths: string[] = [];
        if (data.document_paths && data.document_paths.length > 0) {
            newPaths.push(...data.document_paths);
        } else if (data.document_path) {
            newPaths.push(data.document_path);
        }

        if (newPaths.length > 0) {
            const documentRepository = database.getRepository(EmployeeDocumentEntity);
            for (const path of newPaths) {
                try {
                    const doc = documentRepository.create({
                        id_employee: updatedTermination.id_employee,
                        document_type: (updatedTermination.document_name || 'Baja (Actualización)').substring(0, 50),
                        document_path: path
                    });
                    await documentRepository.save(doc);
                } catch (error) {
                    console.error("Error creating synced Document on update:", error);
                }
            }
        }

        return updatedTermination;
    }

    async remove(id: Id, query?: Query): Promise<TerminationEntity> {
        const repository = database.getRepository(TerminationEntity);
        const laborEventRepository = database.getRepository(LaborEventEntity);

        const terminationToDelete = await this.get(id);

        // 1. Delete Synced Labor Event
        if (terminationToDelete.labor_event_id) {
            try {
                await laborEventRepository.delete(terminationToDelete.labor_event_id);
            } catch (error) {
                console.error("Error deleting synced Labor Event:", error);
            }
        }

        // 2. Delete Termination Record
        await repository.delete(id);

        return terminationToDelete;
    }
}

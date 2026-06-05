import { Request, Response } from "express";
import { AbsenceRequestRepository } from "../../../domain/repository/absence-request.repository";
import { AbsenceRequestEntity } from "../../entity/absence-request.entity";

export class AbsenceRequestController {
    constructor(private absenceRequestRepository: AbsenceRequestRepository<AbsenceRequestEntity>) { }

    async create(req: Request, res: Response): Promise<void> {
        try {
            const body = req.body;
            const absenceRequest = await this.absenceRequestRepository.create(body);
            res.status(200).json(absenceRequest);
        } catch (error: any) {
            console.error('[ABSENCE CREATE ERROR]', error?.sqlMessage || error?.message || error);
            res.status(500).json({ message: 'Error al crear la solicitud', error: error?.sqlMessage || error?.message });
        }
    }

    async list(req: Request, res: Response): Promise<void> {
        try {
            const absenceRequests = await this.absenceRequestRepository.list();
            res.status(200).json(absenceRequests);
        } catch (error) {
            res.status(500).json({ message: 'Error al listar solicitudes', error });
        }
    }

    async get(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const absenceRequest = await this.absenceRequestRepository.get(id);
            res.status(200).json(absenceRequest);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener la solicitud', error });
        }
    }

    async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const body = req.body;
            const absenceRequest = await this.absenceRequestRepository.update(id, body);
            res.status(200).json(absenceRequest);
        } catch (error: any) {
            console.error('[ABSENCE UPDATE ERROR]', error?.sqlMessage || error?.message || error);
            res.status(500).json({ message: 'Error al actualizar la solicitud', error: error?.sqlMessage || error?.message });
        }
    }

    async remove(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            await this.absenceRequestRepository.remove(id);
            res.status(200).json({ message: 'Solicitud eliminada correctamente' });
        } catch (error) {
            res.status(500).json({ message: 'Error al eliminar la solicitud', error });
        }
    }
}

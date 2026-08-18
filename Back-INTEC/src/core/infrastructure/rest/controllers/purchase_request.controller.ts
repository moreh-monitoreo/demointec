import { config } from 'dotenv';
import { Request, Response } from "express";
import { PurchaseRequestRepository } from '../../../domain/repository/purchase_request.repository';

config();

const statusFromError = (error: unknown): number => {
  const status = (error as { status?: number })?.status;
  return typeof status === 'number' ? status : 500;
};

const messageFromError = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export class PurchaseRequestController {
  constructor(private purchaseRequestRepository: PurchaseRequestRepository) {}

  async listProjects(req: Request, res: Response): Promise<void> {
    try {
      const projects = await this.purchaseRequestRepository.listProjects(req.query);
      res.status(200).json(projects);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al listar las obras con solicitudes' });
    }
  }

  async listByProject(req: Request, res: Response): Promise<void> {
    try {
      const { project } = req.params;
      const requests = await this.purchaseRequestRepository.listByProject(project, req.query);
      res.status(200).json(requests);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al listar las solicitudes de la obra' });
    }
  }

  async get(req: Request, res: Response): Promise<void> {
    try {
      const { folio } = req.params;
      const request = await this.purchaseRequestRepository.get(folio);
      res.status(200).json(request);
    } catch (error) {
      console.error(error);
      res.status(statusFromError(error)).json({ message: messageFromError(error) });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const request = await this.purchaseRequestRepository.create(req.body);
      res.status(201).json(request);
    } catch (error) {
      console.error(error);
      res.status(statusFromError(error)).json({ message: messageFromError(error) });
    }
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { folio } = req.params;
      const header = await this.purchaseRequestRepository.updateStatus(folio, req.body?.status_header);
      res.status(200).json(header);
    } catch (error) {
      console.error(error);
      res.status(statusFromError(error)).json({ message: messageFromError(error) });
    }
  }

  async updateAuthorization(req: Request, res: Response): Promise<void> {
    try {
      const { folio } = req.params;
      const header = await this.purchaseRequestRepository.updateAuthorization(folio, req.body);
      res.status(200).json(header);
    } catch (error) {
      console.error(error);
      res.status(statusFromError(error)).json({ message: messageFromError(error) });
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      const { folio } = req.params;
      await this.purchaseRequestRepository.remove(folio);
      res.status(200).json({ message: 'Solicitud eliminada correctamente' });
    } catch (error) {
      console.error(error);
      res.status(statusFromError(error)).json({ message: messageFromError(error) });
    }
  }

  async exportRequests(req: Request, res: Response): Promise<void> {
    try {
      const buffer = await this.purchaseRequestRepository.exportToBuffer(req.query);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="solicitudes.xlsx"');
      res.status(200).send(buffer);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al exportar las solicitudes' });
    }
  }
}

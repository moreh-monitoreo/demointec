import { Router, Request, Response, NextFunction } from "express";
import { SyncController } from "../controllers/sync.controller";
import { verifyToken } from "../../../middleware/auth.middleware";

const ADMIN_EMAIL = 'admin@admin.com';

const requireSyncAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const email = (req as any).user?.email;
  if (email !== ADMIN_EMAIL) {
    res.status(403).json({ msg: 'No autorizado para esta acción.' });
    return;
  }
  next();
};

const syncRouter = Router();

const controller = new SyncController();
syncRouter.post('/sincronizar-railway', verifyToken, requireSyncAdmin, controller.syncRailway.bind(controller));

export default syncRouter;

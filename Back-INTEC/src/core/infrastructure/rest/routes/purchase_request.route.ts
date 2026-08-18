import { Router } from "express";
import { verifyToken } from "../../../middleware/auth.middleware";
import { PurchaseRequestController } from "../controllers/purchase_request.controller";
import { PurchaseRequestAdapterRepository } from "../../adapters/purchase_request.adapter";


const purchaseRequestRouter = Router();

const controller = new PurchaseRequestController(new PurchaseRequestAdapterRepository);

purchaseRequestRouter.get("/solicitudes/por-obra", verifyToken, controller.listProjects.bind(controller));
purchaseRequestRouter.get("/solicitudes/por-obra/:project", verifyToken, controller.listByProject.bind(controller));
purchaseRequestRouter.get("/solicitudes/exportar", verifyToken, controller.exportRequests.bind(controller));
purchaseRequestRouter.get("/solicitudes/:folio", verifyToken, controller.get.bind(controller));
purchaseRequestRouter.post("/solicitudes", verifyToken, controller.create.bind(controller));
purchaseRequestRouter.patch("/solicitudes/:folio/estatus", verifyToken, controller.updateStatus.bind(controller));
purchaseRequestRouter.patch("/solicitudes/:folio/autorizacion", verifyToken, controller.updateAuthorization.bind(controller));
purchaseRequestRouter.delete("/solicitudes/:folio", verifyToken, controller.remove.bind(controller));


export default purchaseRequestRouter;

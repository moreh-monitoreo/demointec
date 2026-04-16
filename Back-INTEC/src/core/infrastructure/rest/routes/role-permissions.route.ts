import { Router } from "express";
import { RolePermissionsController } from "../controllers/role-permissions.controller";
import { RolePermissionsAdapterRepository } from "../../adapters/role-permissions.adapter";

const rolePermissionsRouter = Router();

const controller = new RolePermissionsController(new RolePermissionsAdapterRepository());

rolePermissionsRouter.get("/modules", controller.getModules.bind(controller));
rolePermissionsRouter.get("/sections", controller.getSections.bind(controller));
rolePermissionsRouter.get("/role-permissions/:roleId", controller.getPermissionsByRole.bind(controller));
rolePermissionsRouter.post("/role-permissions/:roleId", controller.savePermissions.bind(controller));

export default rolePermissionsRouter;

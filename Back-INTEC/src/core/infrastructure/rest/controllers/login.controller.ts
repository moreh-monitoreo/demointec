import { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import { LoginRepository } from "../../../domain/repository/login.repository";
import { UserEntity } from "../../entity/users.entity";
import database from "../../../../config/db";
import { EmployeeEntity } from "../../entity/employees.entity";
import { ModulePermissionEntity } from "../../entity/module-permission.entity";
import { ModuleEntity } from "../../entity/module.entity";
import { SectionEntity } from "../../entity/section.entity";

config();

export class LoginController {
  constructor(private loginRepository: LoginRepository<UserEntity>) { }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const user = await this.loginRepository.login(email, password);

      const token = jwt.sign(
        { id: user.id_user, email: user.email },
        process.env.SECRET_KEY!,
        { expiresIn: '8h' }
      );

      const responseUser: any = {
        name: user.name_user,
        email: user.email,
        role_id: user.role_id.name_role,
        role_id_num: user.role_id.id_role,
        photo: user.photo ? `data:image/png;base64,${user.photo.toString('base64')}` : null,
        pAut1: '0', pAut2: '0', pAut3: '0',
        pCapSol: '0', pComSol: '0', pControlSol: '0',
        pEdCats: '0', pEdSol: '0', pEstadisticas: '0',
        pHistorial: '0', pUsuarios: '0', pVerCats: '0',
        pEliminarDocsRH: '0', pDescripcionesPuestos: '0',
        pPermisosVacaciones: '0', pAlertaContratos: '0',
        permissions: []
      };

      // Fetch Employee Permissions
      try {
        const isAdmin = user.role_id.name_role === 'Admin';
        if (isAdmin) {
          responseUser.pAut1 = '1'; responseUser.pAut2 = '1'; responseUser.pAut3 = '1';
          responseUser.pCapSol = '1'; responseUser.pComSol = '1'; responseUser.pControlSol = '1';
          responseUser.pEdCats = '1'; responseUser.pEdSol = '1'; responseUser.pEstadisticas = '1';
          responseUser.pHistorial = '1'; responseUser.pUsuarios = '1'; responseUser.pVerCats = '1';
          responseUser.pEliminarDocsRH = '1'; responseUser.pDescripcionesPuestos = '1';
          responseUser.pPermisosVacaciones = '1'; responseUser.pAlertaContratos = '1';
        } else {
          const employeeRepo = database.getRepository(EmployeeEntity);
          const employee = await employeeRepo.findOne({ where: { email: user.email } });
          if (employee) {
            responseUser.pAut1 = employee.pAut1;
            responseUser.pAut2 = employee.pAut2;
            responseUser.pAut3 = employee.pAut3;
            responseUser.pCapSol = employee.pCapSol;
            responseUser.pComSol = employee.pComSol;
            responseUser.pControlSol = employee.pControlSol;
            responseUser.pEdCats = employee.pEdCats;
            responseUser.pEdSol = employee.pEdSol;
            responseUser.pEstadisticas = employee.pEstadisticas;
            responseUser.pHistorial = employee.pHistorial;
            responseUser.pUsuarios = employee.pUsuarios;
            responseUser.pVerCats = employee.pVerCats;
            responseUser.pEliminarDocsRH = employee.pEliminarDocsRH;
            responseUser.pDescripcionesPuestos = employee.pDescripcionesPuestos;
            responseUser.pPermisosVacaciones = employee.pPermisosVacaciones;
            responseUser.pAlertaContratos = employee.pAlertaContratos;
            responseUser.id_employee = employee.id_employee;
          }
        }
      } catch (err) {
        console.error('Error fetching linked employee for permissions', err);
      }

      // Fetch Role Module Permissions
      try {
        const roleId = user.role_id.id_role;
        const permRepo = database.getRepository(ModulePermissionEntity);
        const moduleRepo = database.getRepository(ModuleEntity);
        const sectionRepo = database.getRepository(SectionEntity);

        const [rawPerms, modules, sections] = await Promise.all([
          permRepo.createQueryBuilder('mp')
            .where('mp.role_id = :roleId', { roleId })
            .getMany(),
          moduleRepo.find({ where: { status: true } }),
          sectionRepo.find({ where: { status: true } }),
        ]);


        // Build structured permissions: [{ module, sections[] }]
        const structured = modules.map(mod => {
          const modPerm = rawPerms.find(p => p.module_id === mod.id_module && p.section_id == null);
          const modSections = sections.filter(s => s.module_id === mod.id_module);

          const sectionPerms = modSections.map(sec => {
            const secPerm = rawPerms.find(p => p.module_id === mod.id_module && p.section_id === sec.id_section);
            return {
              id_section: sec.id_section,
              name_section: sec.name_section,
              route_section: sec.route_section,
              can_access: secPerm ? secPerm.can_access : false
            };
          });

          return {
            id_module: mod.id_module,
            name_module: mod.name_module,
            can_access: modPerm ? modPerm.can_access : false,
            sections: sectionPerms
          };
        });

        responseUser.permissions = structured;
      } catch (err) {
        console.error('Error fetching role permissions', err);
      }

      res.status(200).json({
        msg: 'Login exitoso',
        token,
        user: responseUser
      });

    } catch (error: any) {
      console.error('Error en login:', error);
      res.status(error.status || 500).json({ message: error.message });
    }
  }
}

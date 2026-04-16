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
        pPermisosVacaciones: '0',
        permissions: []
      };

      // Fetch Employee Permissions
      try {
        const employeeRepo = database.getRepository(EmployeeEntity);
        const employee = await employeeRepo.findOne({ where: { email: user.email } });
        if (employee) {
          responseUser.pPermisosVacaciones = employee.pPermisosVacaciones;
          responseUser.pAlertaContratos = employee.pAlertaContratos;
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
          permRepo.find({ where: { role_id: roleId } }),
          moduleRepo.find({ where: { status: true } }),
          sectionRepo.find({ where: { status: true } }),
        ]);

        // Build structured permissions: [{ module, sections[] }]
        const structured = modules.map(mod => {
          const modPerm = rawPerms.find(p => p.module_id === mod.id_module && p.section_id === null);
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

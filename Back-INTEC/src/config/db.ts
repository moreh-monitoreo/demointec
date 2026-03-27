
import { DataSource } from 'typeorm';
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { UserEntity } from '../core/infrastructure/entity/users.entity';
import { RoleEntity } from '../core/infrastructure/entity/roles.entity';
import { AttendanceEntity } from '../core/infrastructure/entity/attendances.entity';
import { ToolsEntity } from '../core/infrastructure/entity/tools_catalog.entity';
import { MaterialEntity } from '../core/infrastructure/entity/materials_catalog.entity';
import { ProjectEntity } from '../core/infrastructure/entity/projects_catalog.entity';
import { CategoriesEntity } from '../core/infrastructure/entity/categories.entity';
import { SubcategoriesEntity } from '../core/infrastructure/entity/subCategories.entity';
import { EmployeeEntity } from '../core/infrastructure/entity/employees.entity';
import { RequestDetailsEntity } from '../core/infrastructure/entity/request_details.entity';
import { RequestHeadersEntity } from '../core/infrastructure/entity/request_headers.entity';
import { RequestsAdditionalEntity } from '../core/infrastructure/entity/requests_additional.entity';
import { LaborEventEntity } from '../core/infrastructure/entity/labor-event.entity';
import { EmployeeUniformEntity } from '../core/infrastructure/entity/employee-uniform.entity';
import { EmployeeDocumentEntity } from '../core/infrastructure/entity/employee-documents.entity';

import { JobDescriptionEntity } from '../core/infrastructure/entity/job-description.entity';
import { TerminationEntity } from '../core/infrastructure/entity/terminations.entity';
import { CommitteeDocumentEntity } from '../core/infrastructure/entity/committee-documents.entity';
import { AbsenceRequestEntity } from '../core/infrastructure/entity/absence-request.entity';
import { DisabilityEntity } from '../core/infrastructure/entity/disability.entity';
import { SalaryTabulatorEntity } from '../core/infrastructure/entity/salary-tabulator.entity';
import { InventoryEntity } from '../core/infrastructure/entity/inventory.entity';
import { InventoryUniformEntity } from '../core/infrastructure/entity/inventory-uniform.entity';
import { InventoryExtintorEntity } from '../core/infrastructure/entity/inventory-extintor.entity';
import { InventoryMovementEntity } from '../core/infrastructure/entity/inventory-movement.entity';
import { InventoryAssignmentEntity } from '../core/infrastructure/entity/inventory-assignment.entity';
import { TrainingInstructionEntity } from '../core/infrastructure/entity/training-instruction.entity';
import { TrainingInstructionFolderEntity } from '../core/infrastructure/entity/training-instruction-folder.entity';
import { InventoryCategoryEntity } from '../core/infrastructure/entity/inventory-category.entity';
import { LoanRequestEntity } from '../core/infrastructure/entity/loan_request.entity';
import { LoanPaymentEntity } from '../core/infrastructure/entity/loan_payment.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  },
  synchronize: false,
  logging: false,
  entities: [UserEntity, RoleEntity, AttendanceEntity, ToolsEntity, MaterialEntity, ProjectEntity,
    CategoriesEntity, SubcategoriesEntity, EmployeeEntity, RequestDetailsEntity, RequestHeadersEntity, RequestsAdditionalEntity,
    LaborEventEntity, EmployeeUniformEntity, EmployeeDocumentEntity, JobDescriptionEntity, TerminationEntity,
    CommitteeDocumentEntity, AbsenceRequestEntity, DisabilityEntity, SalaryTabulatorEntity,
    InventoryEntity, InventoryUniformEntity, InventoryExtintorEntity, InventoryMovementEntity, InventoryAssignmentEntity,
    TrainingInstructionEntity, TrainingInstructionFolderEntity, InventoryCategoryEntity,
    LoanRequestEntity, LoanPaymentEntity],
});


export default AppDataSource;

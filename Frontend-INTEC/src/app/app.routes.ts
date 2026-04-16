import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { NavbarMainComponent } from './components/navbar-main/navbar-main.component';
import { permissionsGuard } from './guards/permissions.guard';
import { UserComponent } from './components/user/user.component';
import { ToolsCatalogComponent } from './components/tools_catalog/tools-catalog.component';
import { MaterialsCatalogComponent } from './components/materials_catalog/materials-catalog.component';
import { ProjectsCatalogComponent } from './components/projects_catalog/projects-catalog.component';
import { EmployeesComponent } from './components/employees/employees.component';
import { AttendancesComponent } from './components/attendances/attendances.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { SubcategoriesComponent } from './components/subcategories/subcategories.component';
import { PurchaseRequestsComponent } from './components/purchase-requests/purchase-requests.component';

import { LaborRelationsComponent } from './components/labor-relations/labor-relations.component';
import { DocumentRepositoryComponent } from './components/document-repository/document-repository.component';
import { JobDescriptionComponent } from './components/job-description/job-description.component';
import { TerminationsComponent } from './components/terminations/terminations.component';
import { PrenominaComponent } from './components/prenomina/prenomina.component';
import { EmployeeProjectComponent } from './components/employee-project/employee-project.component';
import { JointCommitteesComponent } from './components/joint-committees/joint-committees.component';
import { SalaryTabuladorComponent } from './components/salary-tabulador/salary-tabulador.component';
import { SalaryReportComponent } from './components/salary-report/salary-report.component';
import { TemplateAnalysisComponent } from './components/template-analysis/template-analysis.component';
import { InventoryComponent } from './components/inventory/inventory.component';
import { InventoryAssignmentComponent } from './components/inventory-assignment/inventory-assignment.component';
import { TrainingInstructionsComponent } from './components/training-instructions/training-instructions.component';
import { FormatsComponent } from './components/formats/formats.component';
import { RoleManagementComponent } from './components/role-management/role-management.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: NavbarMainComponent,
    children: [
      { path: '', redirectTo: 'dashborad', pathMatch: 'full' },
      { path: 'usuarios',              component: UserComponent,              canActivate: [permissionsGuard] },
      { path: 'herramientas',          component: ToolsCatalogComponent,      canActivate: [permissionsGuard] },
      { path: 'materiales',            component: MaterialsCatalogComponent,  canActivate: [permissionsGuard] },
      { path: 'obras',                 component: ProjectsCatalogComponent,   canActivate: [permissionsGuard] },
      { path: 'colaboradores',         component: EmployeesComponent,         canActivate: [permissionsGuard] },
      { path: 'asistencias',           component: AttendancesComponent,       canActivate: [permissionsGuard] },
      { path: 'partidas',              component: CategoriesComponent,        canActivate: [permissionsGuard] },
      { path: 'subpartidas',           component: SubcategoriesComponent,     canActivate: [permissionsGuard] },
      { path: 'solicitudes',           component: PurchaseRequestsComponent,  canActivate: [permissionsGuard] },
      { path: 'relaciones-laborales',  component: LaborRelationsComponent,    canActivate: [permissionsGuard] },
      { path: 'repositorio-documental',component: DocumentRepositoryComponent,canActivate: [permissionsGuard] },
      { path: 'descripciones-puestos', component: JobDescriptionComponent,    canActivate: [permissionsGuard] },
      { path: 'control-bajas',         component: TerminationsComponent,      canActivate: [permissionsGuard] },
      { path: 'prenomina',             component: PrenominaComponent,         canActivate: [permissionsGuard] },
      { path: 'asignar-obras',         component: EmployeeProjectComponent,   canActivate: [permissionsGuard] },
      { path: 'comisiones-mixtas',     component: JointCommitteesComponent,   canActivate: [permissionsGuard] },
      { path: 'tabulador-salarios',    component: SalaryTabuladorComponent,   canActivate: [permissionsGuard] },
      { path: 'reporte-salarios',      component: SalaryReportComponent,      canActivate: [permissionsGuard] },
      { path: 'analisis-plantillas',   component: TemplateAnalysisComponent,  canActivate: [permissionsGuard] },
      { path: 'inventario-rh',         component: InventoryComponent,         canActivate: [permissionsGuard] },
      { path: 'asignacion-inventario', component: InventoryAssignmentComponent,canActivate: [permissionsGuard] },
      { path: 'capacitaciones',        component: TrainingInstructionsComponent,canActivate: [permissionsGuard] },
      { path: 'formatos',              component: FormatsComponent,           canActivate: [permissionsGuard] },
      { path: 'administrar-roles',     component: RoleManagementComponent,    canActivate: [permissionsGuard] },

      { path: 'permisos-vacaciones', canActivate: [permissionsGuard], loadComponent: () => import('./components/permissions-vacations/permissions-vacations.component').then(m => m.PermissionsVacationsComponent) },
    ]
  },

  // (Opcional) Ruta comodín para “Page Not Found”
  { path: '**', redirectTo: 'login', pathMatch: 'full' }


];

import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { NavbarMainComponent } from './components/navbar-main/navbar-main.component';
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

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: NavbarMainComponent,
    children: [
      { path: '', redirectTo: 'dashborad', pathMatch: 'full' }, // Ruta por defecto
      { path: 'usuarios', component: UserComponent },
      { path: 'herramientas', component: ToolsCatalogComponent },
      { path: 'materiales', component: MaterialsCatalogComponent },
      { path: 'obras', component: ProjectsCatalogComponent },
      { path: 'colaboradores', component: EmployeesComponent },
      { path: 'asistencias', component: AttendancesComponent },
      { path: 'partidas', component: CategoriesComponent },
      { path: 'subpartidas', component: SubcategoriesComponent },
      { path: 'solicitudes', component: PurchaseRequestsComponent },
      { path: 'relaciones-laborales', component: LaborRelationsComponent },
      { path: 'repositorio-documental', component: DocumentRepositoryComponent },
      { path: 'descripciones-puestos', component: JobDescriptionComponent },
      { path: 'control-bajas', component: TerminationsComponent },
      { path: 'prenomina', component: PrenominaComponent },
      { path: 'asignar-obras', component: EmployeeProjectComponent },
      { path: 'comisiones-mixtas', component: JointCommitteesComponent },
      { path: 'tabulador-salarios', component: SalaryTabuladorComponent },
      { path: 'reporte-salarios', component: SalaryReportComponent },
      { path: 'analisis-plantillas', component: TemplateAnalysisComponent },
      { path: 'inventario-rh', component: InventoryComponent },
      { path: 'asignacion-inventario', component: InventoryAssignmentComponent },
      { path: 'capacitaciones', component: TrainingInstructionsComponent },

      { path: 'permisos-vacaciones', loadComponent: () => import('./components/permissions-vacations/permissions-vacations.component').then(m => m.PermissionsVacationsComponent) },
    ]
  },

  // (Opcional) Ruta comodín para “Page Not Found”
  { path: '**', redirectTo: 'login', pathMatch: 'full' }


];

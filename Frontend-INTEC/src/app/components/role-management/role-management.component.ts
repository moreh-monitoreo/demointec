import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Role } from '../../models/roles';
import { Module, Section, ModulePermission, RolePermissionPayload } from '../../models/role-permissions';
import { RoleAdapterService } from '../../adapters/roles.adapter';
import { RolePermissionsAdapterService } from '../../adapters/role-permissions.adapter';
import { ErrorService } from '../../services/errror.services';
import { ToastrService } from 'ngx-toastr';

interface ModuleWithSections {
  module: Module;
  sections: Section[];
  moduleEnabled: boolean;
  sectionStates: { [sectionId: number]: boolean };
}

@Component({
  selector: 'app-role-management',
  templateUrl: './role-management.component.html',
  styleUrl: './role-management.component.css',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule]
})
export class RoleManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  roles: Role[] = [];
  allRoles: Role[] = [];
  filteredRoles: Role[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  pages: number[] = [];
  maxPagesToShow: number = 5;
  searchTerm: string = '';

  roleForm: FormGroup;
  isEditMode: boolean = false;
  selectedRole: Role | null = null;

  modules: Module[] = [];
  sections: Section[] = [];
  moduleTree: ModuleWithSections[] = [];
  selectedRoleForPermissions: Role | null = null;
  isSavingPermissions: boolean = false;

  constructor(
    private fb: FormBuilder,
    private roleAdapter: RoleAdapterService,
    private permissionsAdapter: RolePermissionsAdapterService,
    private errorService: ErrorService,
    private toastr: ToastrService
  ) {
    this.roleForm = this.fb.group({
      name_role: ['', [Validators.required, Validators.minLength(2)]],
      status: [true]
    });
  }

  ngOnInit(): void {
    this.loadRoles();
    this.loadModulesAndSections();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRoles(): void {
    this.roleAdapter.getList().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.allRoles = data;
        this.filteredRoles = [...this.allRoles];
        this.setPage(1);
      },
      error: (err) => this.errorService.handleError(err, 'Error al cargar roles')
    });
  }

  loadModulesAndSections(): void {
    forkJoin({
      modules: this.permissionsAdapter.getModules(),
      sections: this.permissionsAdapter.getSections()
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ modules, sections }) => {
        this.modules = modules;
        this.sections = sections;
      },
      error: (err) => this.errorService.handleError(err, 'Error al cargar módulos')
    });
  }

  setPage(page: number): void {
    if (page < 1) page = 1;
    this.totalPages = Math.ceil(this.filteredRoles.length / this.itemsPerPage);
    if (this.totalPages > 0 && page > this.totalPages) page = this.totalPages;
    this.currentPage = page;
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = Math.min(start + this.itemsPerPage, this.filteredRoles.length);
    this.roles = this.filteredRoles.slice(start, end);
    this.updatePaginationButtons();
  }

  updatePaginationButtons(): void {
    if (this.totalPages === 0) { this.pages = []; return; }
    const group = Math.ceil(this.currentPage / this.maxPagesToShow);
    const startPage = (group - 1) * this.maxPagesToShow + 1;
    const endPage = Math.min(startPage + this.maxPagesToShow - 1, this.totalPages);
    this.pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }

  applyFilters(): void {
    this.filteredRoles = this.allRoles.filter(role =>
      !this.searchTerm || role.name_role.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.setPage(1);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filteredRoles = [...this.allRoles];
    this.setPage(1);
  }

  setCreateMode(): void {
    this.isEditMode = false;
    this.selectedRole = null;
    this.roleForm.reset({ name_role: '', status: true });
  }

  openEditModal(role: Role): void {
    this.isEditMode = true;
    this.selectedRole = role;
    this.roleForm.patchValue({ name_role: role.name_role, status: role.status });
    const modal = document.getElementById('editarRolModal');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  createRole(): void {
    if (this.roleForm.invalid) {
      this.toastr.error('Completa todos los campos requeridos', 'Advertencia');
      this.markFormGroupTouched(this.roleForm);
      return;
    }
    const payload: Role = {
      id_role: 0,
      name_role: this.roleForm.value.name_role.trim(),
      status: this.roleForm.value.status
    };
    this.roleAdapter.post(payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.toastr.success('Rol creado correctamente', 'Éxito');
        this.setCreateMode();
        this.loadRoles();
        this.closeModal('agregarRolModal');
      },
      error: (err) => this.errorService.handleError(err, 'Error al crear el rol')
    });
  }

  updateRole(): void {
    if (!this.selectedRole?.id_role || this.roleForm.invalid) {
      this.toastr.error('Completa todos los campos requeridos', 'Advertencia');
      this.markFormGroupTouched(this.roleForm);
      return;
    }
    const payload: Role = {
      id_role: this.selectedRole.id_role,
      name_role: this.roleForm.value.name_role.trim(),
      status: this.roleForm.value.status
    };
    this.roleAdapter.put(this.selectedRole.id_role, payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.toastr.success('Rol actualizado correctamente', 'Éxito');
        this.loadRoles();
        this.closeModal('editarRolModal');
        this.setCreateMode();
      },
      error: (err) => this.errorService.handleError(err, 'Error al actualizar el rol')
    });
  }

  deleteRole(role: Role): void {
    if (!role.id_role) return;
    if (confirm(`¿Está seguro que desea eliminar el rol "${role.name_role}"?`)) {
      this.roleAdapter.delete(role.id_role).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.toastr.success('Rol eliminado correctamente', 'Éxito');
          this.loadRoles();
        },
        error: (err) => this.errorService.handleError(err, 'Error al eliminar el rol')
      });
    }
  }

  openPermissionsModal(role: Role): void {
    this.selectedRoleForPermissions = role;
    this.buildModuleTree([]);

    this.permissionsAdapter.getPermissionsByRole(role.id_role).pipe(takeUntil(this.destroy$)).subscribe({
      next: (permissions) => {
        this.buildModuleTree(permissions);
        const modal = document.getElementById('permisosRolModal');
        if (modal) {
          const bootstrapModal = new (window as any).bootstrap.Modal(modal);
          bootstrapModal.show();
        }
      },
      error: (err) => this.errorService.handleError(err, 'Error al cargar permisos')
    });
  }

  buildModuleTree(permissions: ModulePermission[]): void {
    // Normaliza section_id: TypeORM puede devolver el objeto relación en lugar del ID plano
    const normalizedPerms = permissions.map(p => ({
      ...p,
      module_id: (p as any).module?.id_module ?? p.module_id,
      section_id: (p as any).section?.id_section ?? p.section_id ?? null,
    }));

    this.moduleTree = this.modules.map(mod => {
      const sectionsForModule = this.sections.filter(s => s.module_id === mod.id_module);

      const modulePermission = normalizedPerms.find(
        p => p.module_id === mod.id_module && (p.section_id === null || p.section_id === undefined)
      );
      const moduleEnabled = modulePermission ? modulePermission.can_access : false;

      const sectionStates: { [sectionId: number]: boolean } = {};
      sectionsForModule.forEach(sec => {
        const secPerm = normalizedPerms.find(
          p => p.module_id === mod.id_module && p.section_id === sec.id_section
        );
        sectionStates[sec.id_section] = secPerm ? secPerm.can_access : false;
      });

      return { module: mod, sections: sectionsForModule, moduleEnabled, sectionStates };
    });
  }

  onModuleToggle(item: ModuleWithSections): void {
    if (!item.moduleEnabled) {
      item.sections.forEach(sec => { item.sectionStates[sec.id_section] = false; });
    }
  }

  onSectionToggle(item: ModuleWithSections, sectionId: number): void {
    if (item.sectionStates[sectionId]) {
      item.moduleEnabled = true;
    }
    const anyEnabled = item.sections.some(sec => item.sectionStates[sec.id_section]);
    if (!anyEnabled) {
      item.moduleEnabled = false;
    }
  }

  savePermissions(): void {
    if (!this.selectedRoleForPermissions) return;
    this.isSavingPermissions = true;

    const permissions: RolePermissionPayload[] = [];

    this.moduleTree.forEach(item => {
      permissions.push({
        module_id: item.module.id_module,
        can_access: item.moduleEnabled
      });
      item.sections.forEach(sec => {
        permissions.push({
          module_id: item.module.id_module,
          section_id: sec.id_section,
          can_access: item.sectionStates[sec.id_section] ?? false
        });
      });
    });

    this.permissionsAdapter.savePermissions(this.selectedRoleForPermissions.id_role, permissions)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success('Permisos guardados correctamente', 'Éxito');
          this.isSavingPermissions = false;
          this.closeModal('permisosRolModal');
        },
        error: (err) => {
          this.errorService.handleError(err, 'Error al guardar permisos');
          this.isSavingPermissions = false;
        }
      });
  }

  getEnabledSectionsCount(item: ModuleWithSections): number {
    return item.sections.filter(sec => item.sectionStates[sec.id_section]).length;
  }

  getTotalEnabledSections(): number {
    return this.moduleTree.reduce((total, item) =>
      total + item.sections.filter(sec => item.sectionStates[sec.id_section]).length, 0);
  }

  getTotalSections(): number {
    return this.moduleTree.reduce((total, item) => total + item.sections.length, 0);
  }

  toggleAllSections(item: ModuleWithSections, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    item.sections.forEach(sec => { item.sectionStates[sec.id_section] = checked; });
    if (checked) item.moduleEnabled = true;
    else {
      const anyEnabled = item.sections.some(sec => item.sectionStates[sec.id_section]);
      if (!anyEnabled) item.moduleEnabled = false;
    }
  }

  closeModal(modalId: string): void {
    const modal = document.getElementById(modalId);
    if (modal) {
      const instance = (window as any).bootstrap.Modal.getInstance(modal);
      if (instance) {
        (document.activeElement as HTMLElement)?.blur();
        instance.hide();
      }
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => control.markAsTouched());
  }
}

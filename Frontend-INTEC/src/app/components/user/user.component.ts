import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Role } from '../../models/roles';
import { RoleAdapterService } from '../../adapters/roles.adapter';
import { User } from '../../models/users';
import { UserAdapterService } from '../../adapters/users.adapter';
import { ErrorService } from '../../services/errror.services';
import { ToastrService } from 'ngx-toastr';
import { ReportsUsersService } from '../../services/reports/reports_users.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrl: './user.component.css',
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule, FormsModule 
  ]

})
export class UserComponent implements OnInit{
  usuarioForm: FormGroup;
  isEditMode: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  roles: Role[] = [];
  users: User[] = [];
  allUsers: User[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  pages: number[] = [];
  maxPagesToShow: number = 5;
  selectedRole: string = '';
  imagenUsuario: string | null = null;
  selectedImageFile: File | null = null;
  selectedUser: User | null = null;
  searchTerm: string = '';
  selectedStatus: string = '';
  filteredUsers: User[] = [];




  constructor(private fb: FormBuilder, private roleAdapterService:RoleAdapterService, private userAdapterService: UserAdapterService, private errorService: ErrorService,  private toastr: ToastrService, private reportsUsersService: ReportsUsersService) {
    this.usuarioForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      password: [''],
      confirmPassword: [''],
      status: [true]
    }, {
      validators: this.passwordsMatchValidator
    });
  }

  ngOnInit(): void {
    this.loadRoles();
    this.loadUsers();
    this.setCreateMode();
  }

  passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (password || confirmPassword) {
    return password === confirmPassword ? null : { passwordsMismatch: true };
    }
    return null;
  }


  loadUsers(): void {
    this.userAdapterService.getList().subscribe({
      next: (data) => {
        this.allUsers = data.map(u => ({
          ...u,
          createdAt: new Date(u.createdAt)
        }));
        this.filteredUsers = this.allUsers.filter(user => user.status === true);
        this.setPage(1);
      },
      error: (err) => {
        console.error('Error al cargar usuarios', err);
      }
    });
  }

  setPage(page: number): void {
    if (page < 1) page = 1;
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    if (this.totalPages > 0 && page > this.totalPages) page = this.totalPages;
    
    this.currentPage = page;

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredUsers.length);
    this.users = this.filteredUsers.slice(startIndex, endIndex);
    
    this.updatePaginationButtons();
  }

  updatePaginationButtons(): void {
    if (this.totalPages === 0) {
        this.pages = [];
        return;
    }
    const currentPageGroup = Math.ceil(this.currentPage / this.maxPagesToShow);

    let startPage = (currentPageGroup - 1) * this.maxPagesToShow + 1;
    let endPage = Math.min(startPage + this.maxPagesToShow - 1, this.totalPages);
    
    this.pages = Array.from({ length: (endPage - startPage) + 1 }, (_, i) => startPage + i);
  }


  loadRoles(): void {
    this.roleAdapterService.getList().subscribe({
      next: (data) => {
        this.roles = data.filter(r => r.status == true); 
      },
      error: (err) => {
        console.error('Error cargando roles', err);
      }
    });
  }

  getRoleName(roleId: number): string {
    const role = this.roles.find(role => role.id_role === roleId);
    return role ? role.name_role : 'Sin rol';
    
  }

  viewUser(user: User): void {
    this.selectedUser = user;
    setTimeout(() => {
      const modal = document.getElementById('visualizarUsuario');
      if (modal) {
        const closeButton = modal.querySelector('.btn-close') as HTMLElement;
        if (closeButton) {
          closeButton.focus();
        }
      }
    }, 300);
  }

  setCreateMode(): void {
    this.isEditMode = false;
    this.usuarioForm.reset({ 
      name: '',
      phone: '',
      email: '',
      role: '',
      password: '',
      confirmPassword: '',
      status: true 
    }); 
    this.imagenUsuario = null;
    this.selectedImageFile = null;
    this.selectedUser = null;
    
    this.usuarioForm.get('password')?.setValidators([Validators.required]);
    this.usuarioForm.get('confirmPassword')?.setValidators([Validators.required]);
    this.usuarioForm.updateValueAndValidity();
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImageFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagenUsuario = reader.result as string;
      };
      reader.readAsDataURL(file); 
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  createUser(): void {
    if (this.usuarioForm.invalid) {
      this.toastr.error('Llenar todos los campos requeridos','Advertencia');
      this.markFormGroupTouched(this.usuarioForm);
      return;
    }

    const formData = new FormData();
    formData.append('name_user', this.usuarioForm.value.name);
    formData.append('phone', this.usuarioForm.value.phone);
    formData.append('email', this.usuarioForm.value.email);
    formData.append('password', this.usuarioForm.value.password);
    formData.append('rol', this.usuarioForm.value.role);
    if (this.selectedImageFile) {
      formData.append('imagen', this.selectedImageFile);
    }

    this.userAdapterService.post(formData).subscribe({
      next: () => {
        this.toastr.success('Usuario creado correctamente', 'Éxito');
        this.setCreateMode();
        this.loadUsers();
        this.closeAddModal();
      },
      error: err => {
        console.error('Error al guardar usuario', err);
         this.errorService.handleError(err, 'Error al crear el usuario');
      }
    });
  }


  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  openEditModal(user: User): void {
    console.log('openEditModal llamado con usuario:', user);
    this.isEditMode = true;
    this.selectedUser = user;
    this.imagenUsuario = user.photo as unknown as string;
    this.selectedImageFile = null;

    this.usuarioForm.get('password')?.clearValidators();
  
    this.usuarioForm.patchValue({
      name: user.name_user,
      phone: user.phone,
      email: user.email,
      role: user.role_id,
      status: user.status,
      photo: user.photo,
      password: '',
    });

    this.usuarioForm.updateValueAndValidity();

    console.log('Formulario válido:', this.usuarioForm.valid);
  }

  handleEditClick(user: User): void {
    this.openEditModal(user);
    const modal = document.getElementById('editarUsuarioModal');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
      
      setTimeout(() => {
        const firstInput = modal.querySelector('input[formControlName="name"]') as HTMLElement;
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
    }
  }

  updateUser(): void {
    console.log('updateUser() llamado');

    console.log('selectedUser:', this.selectedUser);
    console.log('selectedUser?.id_user:', this.selectedUser?.id_user);
    
    if (!this.selectedUser?.id_user) {
      console.log('No hay usuario seleccionado');
      this.toastr.error('No hay usuario seleccionado para editar', 'Error');
      return;
    }

   
    const nameControl = this.usuarioForm.get('name');
    const phoneControl = this.usuarioForm.get('phone');
    const emailControl = this.usuarioForm.get('email');
    const roleControl = this.usuarioForm.get('role');

    if (!nameControl?.value || !phoneControl?.value || !emailControl?.value || !roleControl?.value) {
      console.log('Campos requeridos faltantes');
      this.toastr.error('Llenar todos los campos requeridos', 'Advertencia');
      this.markFormGroupTouched(this.usuarioForm);
      return;
    }

    const userId = this.selectedUser.id_user;
    
    const userData: any = {
      name_user: this.usuarioForm.value.name,
      phone: this.usuarioForm.value.phone,
      email: this.usuarioForm.value.email,
      role_id: this.usuarioForm.value.role,
      status: this.usuarioForm.value.status
    };

  
    const password = this.usuarioForm.value.password;
    if (password && password.trim() !== '') {
      userData.password = password;
    } else {
      userData.password = '';
    }

    console.log('Datos del formulario:', this.usuarioForm.value);
    console.log('Objeto a enviar al API:', userData);
    console.log('Contraseña a enviar:', password && password.trim() !== '' ? 'Nueva contraseña (se encriptará)' : 'Contraseña actual (ya encriptada)');

    if (this.selectedImageFile) {
      const formData = new FormData();
      formData.append('name_user', userData.name_user);
      formData.append('phone', userData.phone);
      formData.append('email', userData.email);
      formData.append('password', userData.password);
      formData.append('role_id', userData.role_id);
      formData.append('status', String(userData.status));
      formData.append('imagen', this.selectedImageFile);

      this.userAdapterService.put(userId, formData).subscribe({
        next: () => {
          this.toastr.success('Usuario actualizado correctamente', 'Éxito');
          this.loadUsers();
          this.closeEditModal();
          this.setCreateMode();
        },
        error: err => {
          console.error('Error al actualizar usuario:', err);
          this.errorService.handleError(err, 'Error al actualizar el usuario');
        }
      });
    } else {
      this.userAdapterService.put(userId, userData).subscribe({
        next: () => {
          this.toastr.success('Usuario actualizado correctamente', 'Éxito');
          this.loadUsers();
          this.closeEditModal();
          this.setCreateMode();
        },
        error: err => {
          console.error('Error al actualizar usuario:', err);
          this.errorService.handleError(err, 'Error al actualizar el usuario');
        }
      });
    }
  }

  closeModal(modalId: string): void {
    const modal = document.getElementById(modalId);
    if (modal) {
      const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modal);
      if (bootstrapModal) {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement) {
          activeElement.blur();
        }
        bootstrapModal.hide();
      }
    }
  }

  closeAddModal(): void {
    this.closeModal('agregarUsuarioModal');
  }

  closeEditModal(): void {
    this.closeModal('editarUsuarioModal');
  }
  closeViewModal(): void {
    this.closeModal('visualizarUsuario');
  }


  openAddModal(): void {
    this.setCreateMode();
    setTimeout(() => {
      const modal = document.getElementById('agregarUsuarioModal');
      if (modal) {
        const firstInput = modal.querySelector('input[formControlName="name"]') as HTMLElement;
        if (firstInput) {
          firstInput.focus();
        }
      }
    }, 300);
  }

  deleteUser(user: User): void {
    if (!user.id_user) {
      this.toastr.error('No se puede eliminar el usuario: ID no válido', 'Error');
      return;
    }

    if (confirm(`¿Está seguro que desea eliminar al usuario "${user.name_user}"?`)) {
      this.userAdapterService.delete(user.id_user).subscribe({
        next: () => {
          this.toastr.success('Usuario eliminado correctamente', 'Éxito');
          this.loadUsers(); 
        },
        error: err => {
          console.error('Error al eliminar usuario:', err);
          this.errorService.handleError(err, 'Error al eliminar el usuario');
        }
      });
    }
  }

  applyFilters(): void {
    this.filteredUsers = this.allUsers.filter(user => {
      const searchMatch = !this.searchTerm || 
        user.name_user.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.phone.includes(this.searchTerm);

      const roleMatch = !this.selectedRole || user.role_id.toString() === this.selectedRole;
      let statusMatch = true;
      if (this.selectedStatus === 'true') {
        statusMatch = user.status === true;
      } else if (this.selectedStatus === 'false') {
        statusMatch = user.status === false;
      } else {

        statusMatch = user.status === true;
      }

      return searchMatch && roleMatch && statusMatch;
    });

    this.setPage(1);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.selectedStatus = '';
    this.filteredUsers = this.allUsers.filter(user => user.status === true);
    this.setPage(1);
  }

  hasActiveFilters(): boolean {
    return this.searchTerm !== '' || this.selectedRole !== '' || this.selectedStatus !== '';
  }

  async exportUsers(): Promise<void> {
    try {
      this.toastr.info('Generando reporte PDF...', 'Procesando');
      // Exporta solo los usuarios filtrados y visibles
      const usersToExport = this.filteredUsers;
      await this.reportsUsersService.generateUsersReport(usersToExport, this.roles, 'REPORTE DE USUARIOS');
      this.toastr.success('Reporte PDF generado correctamente', 'Éxito');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      this.toastr.error('Error al generar el reporte PDF', 'Error');
    }
  }

}

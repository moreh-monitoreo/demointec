import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';
import { EmployeesAdapterService } from '../../adapters/employees.adapter';
import { ToastrService } from 'ngx-toastr';
import { PermissionsService } from '../../services/permissions.service';


@Component({
  selector: 'app-navbar-main',
  templateUrl: './navbar-main.component.html',
  styleUrl: './navbar-main.component.css',
  standalone: true,
  imports: [RouterModule, CommonModule],
})
export class NavbarMainComponent implements OnInit {
  userName: string = 'Usuario';
  userImage: string | null = null;
  @ViewChild('sidebar', { static: true }) sidebarRef!: ElementRef;
  @ViewChild('logo', { static: true }) logoRef!: ElementRef;
  isSubmenuOpen: { [key: string]: boolean } = {};
  isSidebarCollapsed: boolean = false;


  constructor(
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object,
    private employeesAdapter: EmployeesAdapterService,
    private toastr: ToastrService,
    private router: Router,
    private permissionsService: PermissionsService
  ) { }
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const userObj = JSON.parse(user);
          this.userName = userObj.name_user || userObj.name || userObj.nombre || 'Usuario';
          this.userImage = userObj.photo || null;

          // Check for expiring contracts permission
          console.log('[Navbar] User loaded:', userObj);
          console.log('[Navbar] Email:', userObj.email);
          console.log('[Navbar] Permission pAlertaContratos:', userObj.pAlertaContratos);

          if (userObj.pAlertaContratos === '1') {
            console.log('[Navbar] Permission granted. Checking contracts...');
            this.checkExpiringContracts();
          } else {
            console.log('[Navbar] Permission denied or not found.');
          }
        } catch (e) {
          console.error('Error al parsear usuario:', e);
        }
      }
    }
  }

  checkExpiringContracts(): void {
    console.log('[Navbar] Calling getExpiringContracts service...');
    this.employeesAdapter.getExpiringContracts().subscribe({
      next: (employees) => {
        console.log('[Navbar] API Response:', employees);
        if (employees && employees.length > 0) {
          console.log('[Navbar] Found employees:', employees.length);
          const count = employees.length;
          // Format list: Name - YYYY-MM-DD
          const list = employees
            .map(e => `<li>${e.name_employee} (${e.contract_expiration})</li>`)
            .join('');

          const message = `
            <strong>Hay ${count} contratos por vencer en los próximos 8 días:</strong>
            <ul style="padding-left: 20px; margin-top: 5px; margin-bottom: 0;">${list}</ul>
          `;

          this.toastr.warning(
            message,
            'Alerta de Contratos',
            {
              disableTimeOut: true,
              closeButton: true,
              enableHtml: true,
              tapToDismiss: false,
              toastClass: 'ngx-toastr toast-warning width-auto'
            }
          );
        } else {
          console.log('[Navbar] No employees found with expiring contracts.');
        }
      },
      error: (err) => console.error('[Navbar] Error checking expiring contracts', err)
    });
  }



  toggleSidebar(): void {
    const sidebar = this.sidebarRef.nativeElement;
    const logo = this.logoRef.nativeElement;

    const isCollapsed = sidebar.classList.contains('collapsed');

    if (isCollapsed) {
      this.renderer.removeClass(sidebar, 'collapsed');
      this.renderer.setStyle(logo, 'display', 'flex');
      this.isSidebarCollapsed = false;
    } else {
      this.renderer.addClass(sidebar, 'collapsed');
      this.renderer.setStyle(logo, 'display', 'none');
      this.isSubmenuOpen = {};
      this.isSidebarCollapsed = true;
    }

    const texts = sidebar.querySelectorAll('.menu-text') as NodeListOf<HTMLElement>;
    texts.forEach(el => {
      el.style.display = isCollapsed ? 'inline' : 'none';
    });
  }




  toggleSubmenu(menu: string): void {
    const sidebar = this.sidebarRef.nativeElement;
    if (sidebar.classList.contains('collapsed')) {
      return;
    }

    // Cerrar todos los otros submenús
    Object.keys(this.isSubmenuOpen).forEach(key => {
      if (key !== menu) {
        this.isSubmenuOpen[key] = false;
      }
    });

    // Alternar el estado del submenú actual
    this.isSubmenuOpen[menu] = !this.isSubmenuOpen[menu];
  }


  expandSidebarIfCollapsed(): void {
    const sidebar = this.sidebarRef.nativeElement;
    const logo = this.logoRef.nativeElement;

    if (sidebar.classList.contains('collapsed')) {
      this.renderer.removeClass(sidebar, 'collapsed');
      this.renderer.setStyle(logo, 'display', 'flex');

      const texts = sidebar.querySelectorAll('.menu-text') as NodeListOf<HTMLElement>;
      texts.forEach(el => {
        el.style.display = 'inline';
      });
    }
  }

  canModule(moduleName: string): boolean {
    return this.permissionsService.canAccessModule(moduleName);
  }

  canRoute(route: string): boolean {
    return this.permissionsService.canAccessRoute(route);
  }

  handleModuleClick(menu: string, moduleName: string): void {
    this.expandSidebarIfCollapsed();
    if (!this.permissionsService.canAccessModule(moduleName)) {
      // Abre el submenú solo para mostrar el mensaje de sin acceso
      this.isSubmenuOpen[menu] = !this.isSubmenuOpen[menu];
      return;
    }
    this.toggleSubmenu(menu);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.toastr.info('Has cerrado sesión correctamente');
    this.router.navigate(['/login']);
  }

}

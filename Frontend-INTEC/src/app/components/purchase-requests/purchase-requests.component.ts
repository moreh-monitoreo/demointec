import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PurchaseRequestAdapterService } from '../../adapters/purchase_request.adapter';
import { MaterialsCatalogAdapterService } from '../../adapters/materials_catalog.adapter';
import { ToolsCatalogAdapterService } from '../../adapters/tools_catalog.adapter';
import { ProjectsCatalogAdapterService } from '../../adapters/projects_catalog.adapter';
import { MaterialsCatalog } from '../../models/materials_catalog';
import { ToolsCatalog } from '../../models/tools_catalog';
import { Project } from '../../models/projects_catalog';
import {
  CreateRequestItem,
  FullRequest,
  ProjectSummary,
  REQUEST_STATUS_PENDING,
  REQUEST_STATUS_SUPPLIED,
  RequestKind,
  RequestSummary,
} from '../../models/purchase_request';

@Component({
  selector: 'app-purchase-requests',
  templateUrl: './purchase-requests.component.html',
  styleUrl: './purchase-requests.component.css',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule]
})
export class PurchaseRequestsComponent implements OnInit {
  readonly statusPending = REQUEST_STATUS_PENDING;
  readonly statusSupplied = REQUEST_STATUS_SUPPLIED;
  readonly authLevels = [1, 2, 3];

  view: 'projects' | 'requests' = 'projects';
  projects: ProjectSummary[] = [];
  selectedProject: string = '';
  requests: RequestSummary[] = [];

  searchTerm: string = '';
  statusFilter: string = REQUEST_STATUS_PENDING;
  private readonly order: string = 'folio';
  private readonly direction: string = 'DESC';

  currentPage: number = 1;
  itemsPerPage: number = 20;
  totalRequests: number = 0;
  totalPages: number = 0;
  pages: number[] = [];
  maxPagesToShow: number = 5;

  isLoading: boolean = false;
  hasConsulted: boolean = false;

  requestForm: FormGroup;
  itemForm: FormGroup;
  kind: RequestKind | null = null;
  items: CreateRequestItem[] = [];
  isSaving: boolean = false;

  catalogProjects: Project[] = [];
  materials: MaterialsCatalog[] = [];
  tools: ToolsCatalog[] = [];
  selectedToolDescription: string = '';

  selectedRequest: FullRequest | null = null;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private purchaseRequestAdapterService: PurchaseRequestAdapterService,
    private materialsCatalogAdapterService: MaterialsCatalogAdapterService,
    private toolsCatalogAdapterService: ToolsCatalogAdapterService,
    private projectsCatalogAdapterService: ProjectsCatalogAdapterService
  ) {
    this.requestForm = this.fb.group({
      project: ['', Validators.required],
      locationType: ['local', Validators.required],
      official: ['', Validators.required],
      requester: ['', Validators.required],
      locality: ['', Validators.required],
      work: ['', Validators.required],
      date: ['', Validators.required],
      hour: [''],
      notes: ['']
    });

    this.itemForm = this.fb.group({
      article: ['', Validators.required],
      name: [''],
      amount: [null, [Validators.required, Validators.min(1)]],
      unit_cost: [0],
      unit: [''],
      code: [''],
      c1: [''],
      c2: [''],
      category: [''],
      subcategory: [''],
      description: [''],
      observation: ['']
    });
  }

  ngOnInit(): void {
    this.loadCatalogs();
    this.loadProjects();
  }

  loadCatalogs(): void {
    this.materialsCatalogAdapterService.getList().subscribe({
      next: (data) => this.materials = data.filter(material => material.status === true),
      error: (err) => console.error('Error al cargar materiales', err)
    });

    this.toolsCatalogAdapterService.getList().subscribe({
      next: (data) => this.tools = data.filter(tool => tool.status === true),
      error: (err) => console.error('Error al cargar herramientas', err)
    });

    this.projectsCatalogAdapterService.getList().subscribe({
      next: (data) => this.catalogProjects = data.filter(project => project.status === true),
      error: (err) => console.error('Error al cargar obras', err)
    });
  }

  loadProjects(): void {
    this.isLoading = true;
    this.hasConsulted = true;

    this.purchaseRequestAdapterService.getProjects({
      estatus: this.statusFilter,
      buscar: this.searchTerm
    }).subscribe({
      next: (data) => {
        this.projects = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar las obras', err);
        this.toastr.error('Error al cargar las obras con solicitudes', 'Error');
        this.isLoading = false;
      }
    });
  }

  get projectsWithRequests(): number {
    return this.projects.length;
  }

  openProject(project: ProjectSummary): void {
    this.selectedProject = project.project;
    this.view = 'requests';
    this.currentPage = 1;
    this.searchTerm = '';
    this.loadRequests();
  }

  backToProjects(): void {
    this.view = 'projects';
    this.selectedProject = '';
    this.searchTerm = '';
    this.loadProjects();
  }

  loadRequests(): void {
    if (!this.selectedProject) return;

    this.isLoading = true;

    this.purchaseRequestAdapterService.getByProject(this.selectedProject, {
      estatus: this.statusFilter,
      buscar: this.searchTerm,
      orden: this.order,
      direccion: this.direction,
      page: String(this.currentPage),
      limit: String(this.itemsPerPage)
    }).subscribe({
      next: (response) => {
        this.requests = response.data;
        this.totalRequests = response.total;
        this.totalPages = Math.ceil(response.total / response.limit);
        this.updatePaginationButtons();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar las solicitudes', err);
        this.toastr.error('Error al cargar las solicitudes de la obra', 'Error');
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    if (this.view === 'projects') {
      this.loadProjects();
    } else {
      this.loadRequests();
    }
  }

  setStatusFilter(status: string): void {
    this.statusFilter = status;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return this.searchTerm !== '' || this.statusFilter !== '';
  }

  setPage(page: number): void {
    if (page < 1) page = 1;
    if (this.totalPages > 0 && page > this.totalPages) page = this.totalPages;
    this.currentPage = page;
    this.loadRequests();
  }

  updatePaginationButtons(): void {
    if (this.totalPages === 0) {
      this.pages = [];
      return;
    }
    const currentPageGroup = Math.ceil(this.currentPage / this.maxPagesToShow);
    const startPage = (currentPageGroup - 1) * this.maxPagesToShow + 1;
    const endPage = Math.min(startPage + this.maxPagesToShow - 1, this.totalPages);
    this.pages = Array.from({ length: (endPage - startPage) + 1 }, (_, i) => startPage + i);
  }

  openCaptureChooser(): void {
    this.openModal('capturaSolicitudModal');
  }

  startCapture(kind: RequestKind): void {
    this.kind = kind;
    this.items = [];
    this.selectedToolDescription = '';

    this.requestForm.reset({
      project: this.selectedProject || '',
      locationType: 'local',
      official: '',
      requester: '',
      locality: '',
      work: '',
      date: this.getCurrentDate(),
      hour: this.getCurrentTime(),
      notes: ''
    });

    this.resetItemForm();
    this.onProjectChange();

    this.closeModal('capturaSolicitudModal');
    this.openModal('nuevaSolicitudModal');
  }

  get captureTitle(): string {
    return this.kind === 'H' ? 'Solicitud de Herramientas' : 'Solicitud de Materiales';
  }

  onProjectChange(): void {
    const name = this.requestForm.value.project;
    const project = this.catalogProjects.find(item => item.name_project === name);

    if (project) {
      this.requestForm.patchValue({
        locality: project.locality || this.requestForm.value.locality,
        official: project.official || this.requestForm.value.official,
        locationType: project.locationType || this.requestForm.value.locationType
      });
    }
  }

  onArticleChange(): void {
    const id = this.itemForm.value.article;
    this.selectedToolDescription = '';

    if (!id) {
      this.resetArticleFields();
      return;
    }

    if (this.kind === 'M') {
      const material = this.materials.find(item => item.id_material === id);
      if (!material) return;

      this.itemForm.patchValue({
        name: material.name_material || '',
        code: material.code || '',
        c1: material.c1 || '',
        c2: material.c2 || '',
        unit: material.unit || '',
        category: material.category || '',
        subcategory: material.subcategory || '',
        description: ''
      });
      return;
    }

    const tool = this.tools.find(item => item.id_tool === id);
    if (!tool) return;

    this.selectedToolDescription = tool.description || '';
    this.itemForm.patchValue({
      name: tool.name_tool || '',
      code: tool.code || '',
      c1: '',
      c2: '',
      unit: 'PIEZA',
      category: 'HERRAMIENTAS',
      subcategory: 'HERRAMIENTAS',
      description: tool.description || ''
    });
  }

  addItem(): void {
    if (this.itemForm.invalid) {
      this.toastr.error('Seleccione el concepto y capture la cantidad', 'Advertencia');
      this.itemForm.markAllAsTouched();
      return;
    }

    const value = this.itemForm.value;

    this.items.push({
      name: value.name,
      amount: Number(value.amount) || 0,
      unit_cost: Number(value.unit_cost) || 0,
      unit: value.unit || '',
      code: value.code || '',
      c1: value.c1 || '',
      c2: value.c2 || '',
      category: value.category || '',
      subcategory: value.subcategory || '',
      description: value.description || '',
      observation: value.observation || ''
    });

    this.resetItemForm();
    this.selectedToolDescription = '';
  }

  removeItem(index: number): void {
    this.items.splice(index, 1);
  }

  get conceptsCount(): number {
    return this.items.length;
  }

  get unitsCount(): number {
    return this.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }

  get itemsAmount(): number {
    return this.items.reduce((sum, item) => sum + (Number(item.amount) || 0) * (Number(item.unit_cost) || 0), 0);
  }

  saveRequest(): void {
    if (this.requestForm.invalid) {
      this.toastr.error('Complete los datos de la solicitud', 'Advertencia');
      this.requestForm.markAllAsTouched();
      return;
    }

    if (this.items.length === 0) {
      this.toastr.error('Agregue al menos un concepto', 'Advertencia');
      return;
    }

    this.isSaving = true;

    this.purchaseRequestAdapterService.post({
      kind: this.kind || 'M',
      header: this.requestForm.value,
      items: this.items
    }).subscribe({
      next: (response) => {
        this.toastr.success(`Solicitud ${response.header.folio_request} registrada correctamente`, 'Éxito');
        this.isSaving = false;
        this.closeModal('nuevaSolicitudModal');
        this.refresh();
      },
      error: (err) => {
        console.error('Error al registrar la solicitud', err);
        this.toastr.error(err?.error?.message || 'Error al registrar la solicitud', 'Error');
        this.isSaving = false;
      }
    });
  }

  viewRequest(request: RequestSummary): void {
    this.purchaseRequestAdapterService.get(request.folio_request).subscribe({
      next: (data) => {
        this.selectedRequest = data;
        this.openModal('detalleSolicitudModal');
      },
      error: (err) => {
        console.error('Error al cargar la solicitud', err);
        this.toastr.error('Error al cargar la solicitud', 'Error');
      }
    });
  }

  toggleSupplied(request: RequestSummary): void {
    const status = request.status_header === this.statusSupplied ? this.statusPending : this.statusSupplied;

    this.purchaseRequestAdapterService.updateStatus(request.folio_request, status).subscribe({
      next: () => {
        this.toastr.success(`Solicitud marcada como ${status}`, 'Éxito');
        this.refresh();
      },
      error: (err) => {
        console.error('Error al cambiar el estatus', err);
        this.toastr.error('Error al cambiar el estatus de la solicitud', 'Error');
      }
    });
  }

  authorize(level: number): void {
    if (!this.selectedRequest) return;

    const folio = this.selectedRequest.header.folio_request;
    const authorized = this.getAuthLevel(level) !== '1';
    const reviewer = this.getCurrentUserName();

    this.purchaseRequestAdapterService.updateAuthorization(folio, { level, authorized, reviewer }).subscribe({
      next: (header) => {
        if (this.selectedRequest) {
          this.selectedRequest.header = header;
        }
        this.toastr.success(authorized ? `Autorización ${level} registrada` : `Autorización ${level} retirada`, 'Éxito');
        this.refresh();
      },
      error: (err) => {
        console.error('Error al autorizar la solicitud', err);
        this.toastr.error('Error al registrar la autorización', 'Error');
      }
    });
  }

  getAuthLevel(level: number): string {
    if (!this.selectedRequest) return '0';
    const header = this.selectedRequest.header as unknown as Record<string, string>;
    return header[`auth${level}`] || '0';
  }

  getReviewer(level: number): string {
    if (!this.selectedRequest) return '';
    const header = this.selectedRequest.header as unknown as Record<string, string>;
    return header[`revision${level}`] || '';
  }

  deleteRequest(request: RequestSummary): void {
    if (!confirm(`¿Eliminar la solicitud ${request.folio_request} y todos sus conceptos?`)) return;

    this.purchaseRequestAdapterService.delete(request.folio_request).subscribe({
      next: () => {
        this.toastr.success('Solicitud eliminada correctamente', 'Éxito');
        this.refresh();
      },
      error: (err) => {
        console.error('Error al eliminar la solicitud', err);
        this.toastr.error('Error al eliminar la solicitud', 'Error');
      }
    });
  }

  exportRequests(): void {
    this.purchaseRequestAdapterService.export({
      obra: this.view === 'requests' ? this.selectedProject : '',
      estatus: this.statusFilter
    }).subscribe({
      next: (blob) => this.downloadBlob(blob, this.buildExportName()),
      error: (err) => {
        console.error('Error al exportar', err);
        this.toastr.error('Error al exportar las solicitudes', 'Error');
      }
    });
  }

  private refresh(): void {
    if (this.view === 'requests') {
      this.loadRequests();
    } else {
      this.loadProjects();
    }
  }

  getCurrentDate(): string {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${today.getFullYear()}-${month}-${day}`;
  }

  getCurrentTime(): string {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  private getCurrentUserName(): string {
    if (typeof localStorage === 'undefined') return '';
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.name_user || '';
  }

  private buildExportName(): string {
    const scope = this.view === 'requests' ? this.selectedProject.replace(/\s+/g, '-') : 'todas';
    return `solicitudes-${scope}-${this.getCurrentDate()}.xlsx`;
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private resetItemForm(): void {
    this.itemForm.reset({
      article: '',
      name: '',
      amount: null,
      unit_cost: 0,
      unit: '',
      code: '',
      c1: '',
      c2: '',
      category: '',
      subcategory: '',
      description: '',
      observation: ''
    });
  }

  private resetArticleFields(): void {
    this.itemForm.patchValue({
      name: '',
      code: '',
      c1: '',
      c2: '',
      unit: '',
      category: '',
      subcategory: '',
      description: ''
    });
  }

  private openModal(modalId: string): void {
    const element = document.getElementById(modalId);
    if (!element) return;

    const modal = (window as any).bootstrap.Modal.getOrCreateInstance(element);
    modal.show();
  }

  private closeModal(modalId: string): void {
    const element = document.getElementById(modalId);
    if (!element) return;

    const active = document.activeElement as HTMLElement;
    if (active) active.blur();

    const modal = (window as any).bootstrap.Modal.getInstance(element);
    if (modal) modal.hide();
  }
}

import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { JobDescriptionAdapterService, JobDescription, Activity, Responsibility, ChangeLogEntry } from '../../adapters/job-description.adapter';
import { ToastrService } from 'ngx-toastr';
import { PermissionsService } from '../../services/permissions.service';

@Component({
    selector: 'app-job-description',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    templateUrl: './job-description.component.html',
    styleUrls: ['./job-description.component.css']
})
export class JobDescriptionComponent implements OnInit {
    jobDescriptions: JobDescription[] = [];
    jobForm: FormGroup;
    isModalOpen = false;
    isEditMode = false;
    selectedJobId: number | null = null;

    // Filters & Pagination
    searchTerm: string = '';
    filteredJobDescriptions: JobDescription[] = [];
    paginatedJobDescriptions: JobDescription[] = [];
    currentPage: number = 1;
    itemsPerPage: number = 10;
    totalPages: number = 1;
    pages: number[] = [];

    hasPermission: boolean = false;
    isViewMode: boolean = false;
    showOrgChart: boolean = false;

    // Dynamic arrays for matrices
    activities: Activity[] = [];
    responsibilities: Responsibility[] = [];
    internalRelations: string[] = [];
    externalRelations: string[] = [];
    changeLog: ChangeLogEntry[] = [];

    // Temp inputs for adding new items
    newActivity: Activity = { description: '', ejecuta: false, supervisa: false, autoriza: false, frecuencia: '' };
    newResponsibility: Responsibility = { description: '', individual: false, compartida: false, puestos_involucrados: '' };
    newInternalRelation: string = '';
    newExternalRelation: string = '';
    newChangeLog: ChangeLogEntry = { description: '', date: '', author: '' };

    // Dropdown options
    frecuenciaOptions = ['Diaria', 'Semanal', 'Mensual', 'Trimestral', 'Semestral', 'Anual', 'Cuando se requiera'];
    genderOptions = ['Masculino', 'Femenino', 'Indistinto'];
    travelOptions = ['Indispensable', 'No requerido', 'Ocasional'];

    private adapter = inject(JobDescriptionAdapterService);
    private fb = inject(FormBuilder);
    private toastr = inject(ToastrService);
    private cdr = inject(ChangeDetectorRef);
    private permissionsService = inject(PermissionsService);

    constructor() {
        this.jobForm = this.fb.group({
            // I. Información General
            job_title: ['', Validators.required],
            department: [''],
            // II. Razón de Ser
            objective: [''],
            // V. Estructura Organizacional
            org_manager: [''],
            org_supervisor: [''],
            // VI. Características del Perfil
            profile_gender: [''],
            profile_age: [''],
            profile_marital_status: [''],
            profile_schedule: [''],
            profile_travel_availability: [''],
            profile_languages: [''],
            profile_extra_requirements: [''],
            // VII. Conocimientos y Habilidades
            education: [''],
            specialty: [''],
            experience: [''],
            technical_knowledge: [''],
            software: [''],
            equipment: [''],
            // VIII. Autorización
            created_date: [''],
            created_by: [''],
            reviewed_by: [''],
            authorized_by: ['']
        });
    }

    ngOnInit(): void {
        this.hasPermission = !this.permissionsService.hasPermissionsConfigured() || this.permissionsService.canAccessRoute('/dashboard/descripciones-puestos');
        this.loadJobDescriptions();
    }

    loadJobDescriptions() {
        this.adapter.getAll().subscribe({
            next: (data) => {
                this.jobDescriptions = data;
                this.applyFilters();
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Error loading job descriptions', err)
        });
    }

    // Activities Matrix Methods
    addActivity() {
        if (!this.newActivity.description.trim()) {
            this.toastr.warning('Ingresa una descripción para la actividad');
            return;
        }
        this.activities.push({ ...this.newActivity });
        this.newActivity = { description: '', ejecuta: false, supervisa: false, autoriza: false, frecuencia: '' };
    }

    removeActivity(index: number) {
        this.activities.splice(index, 1);
    }

    // Responsibilities Matrix Methods
    addResponsibility() {
        if (!this.newResponsibility.description.trim()) {
            this.toastr.warning('Ingresa una descripción para la responsabilidad');
            return;
        }
        this.responsibilities.push({ ...this.newResponsibility });
        this.newResponsibility = { description: '', individual: false, compartida: false, puestos_involucrados: '' };
    }

    removeResponsibility(index: number) {
        this.responsibilities.splice(index, 1);
    }

    // Relations Methods
    addInternalRelation() {
        if (!this.newInternalRelation.trim()) return;
        this.internalRelations.push(this.newInternalRelation.trim());
        this.newInternalRelation = '';
    }

    removeInternalRelation(index: number) {
        this.internalRelations.splice(index, 1);
    }

    addExternalRelation() {
        if (!this.newExternalRelation.trim()) return;
        this.externalRelations.push(this.newExternalRelation.trim());
        this.newExternalRelation = '';
    }

    removeExternalRelation(index: number) {
        this.externalRelations.splice(index, 1);
    }

    toggleOrgChart() {
        this.showOrgChart = !this.showOrgChart;
    }

    // Change Log Methods
    addChangeLogEntry() {
        if (!this.newChangeLog.description.trim()) return;
        this.changeLog.push({ ...this.newChangeLog });
        this.newChangeLog = { description: '', date: '', author: '' };
    }

    removeChangeLogEntry(index: number) {
        this.changeLog.splice(index, 1);
    }

    openModal(job?: JobDescription) {
        this.isModalOpen = true;
        this.isViewMode = false;
        this.jobForm.enable();
        this.resetArrays();

        if (job) {
            this.isEditMode = true;
            this.selectedJobId = job.id!;
            this.jobForm.patchValue(job);
            this.parseArrays(job);
        } else {
            this.isEditMode = false;
            this.selectedJobId = null;
            this.jobForm.reset();
        }
    }

    viewJob(job: JobDescription) {
        this.isModalOpen = true;
        this.isViewMode = true;
        this.isEditMode = false;
        this.selectedJobId = job.id!;
        this.jobForm.patchValue(job);
        this.parseArrays(job);
        this.jobForm.disable();
    }

    private resetArrays() {
        this.activities = [];
        this.responsibilities = [];
        this.internalRelations = [];
        this.externalRelations = [];
        this.changeLog = [];
    }

    private parseArrays(job: JobDescription) {
        try {
            if (job.activities_matrix) this.activities = JSON.parse(job.activities_matrix);
            if (job.responsibilities_matrix) this.responsibilities = JSON.parse(job.responsibilities_matrix);
            if (job.internal_relations) this.internalRelations = JSON.parse(job.internal_relations);
            if (job.external_relations) this.externalRelations = JSON.parse(job.external_relations);
            if (job.change_log) this.changeLog = JSON.parse(job.change_log);
        } catch (e) {
            console.error('Error parsing arrays', e);
        }
    }

    closeModal() {
        this.isModalOpen = false;
        this.isViewMode = false;
        this.jobForm.enable();
    }

    saveJob() {
        if (this.isViewMode) return;

        if (this.jobForm.invalid) {
            this.toastr.error('Por favor completa los campos requeridos', 'Error');
            return;
        }

        const jobData: JobDescription = this.jobForm.value;

        // Serialize arrays
        jobData.activities_matrix = JSON.stringify(this.activities);
        jobData.responsibilities_matrix = JSON.stringify(this.responsibilities);
        jobData.internal_relations = JSON.stringify(this.internalRelations);
        jobData.external_relations = JSON.stringify(this.externalRelations);
        jobData.change_log = JSON.stringify(this.changeLog);

        if (this.isEditMode && this.selectedJobId) {
            this.adapter.update(this.selectedJobId, jobData).subscribe({
                next: () => {
                    this.toastr.success('La descripción de puesto ha sido actualizada', 'Actualizado');
                    this.loadJobDescriptions();
                    this.closeModal();
                },
                error: (err) => {
                    console.error(err);
                    this.toastr.error('No se pudo actualizar', 'Error');
                }
            });
        } else {
            this.adapter.create(jobData).subscribe({
                next: () => {
                    this.toastr.success('La descripción de puesto ha sido creada', 'Creado');
                    this.loadJobDescriptions();
                    this.closeModal();
                },
                error: (err) => {
                    console.error(err);
                    this.toastr.error('No se pudo crear', 'Error');
                }
            });
        }
    }

    deleteJob(id: number) {
        if (confirm('¿Estás seguro de que deseas eliminar este puesto?')) {
            this.adapter.delete(id).subscribe({
                next: () => {
                    this.toastr.success('El registro ha sido eliminado', 'Eliminado');
                    this.loadJobDescriptions();
                },
                error: (err) => this.toastr.error('No se pudo eliminar', 'Error')
            });
        }
    }

    // Filter & Pagination Logic
    applyFilters() {
        if (!this.searchTerm) {
            this.filteredJobDescriptions = [...this.jobDescriptions];
        } else {
            const term = this.searchTerm.toLowerCase();
            this.filteredJobDescriptions = this.jobDescriptions.filter(job =>
                job.job_title?.toLowerCase().includes(term) ||
                job.department?.toLowerCase().includes(term)
            );
        }
        this.totalPages = Math.ceil(this.filteredJobDescriptions.length / this.itemsPerPage);
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
        this.setPage(1);
    }

    setPage(page: number) {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this.paginatedJobDescriptions = this.filteredJobDescriptions.slice(startIndex, endIndex);
    }

    clearFilters() {
        this.searchTerm = '';
        this.applyFilters();
    }
}

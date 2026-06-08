import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx-js-style';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, firstValueFrom } from 'rxjs';
import { EmployeesAdapterService } from '../../adapters/employees.adapter';
import { EmployeeDocumentsAdapterService } from '../../adapters/employee-documents.adapter';
import { AbsenceRequestAdapterService } from '../../adapters/absence-request.adapter';
import { DisabilityAdapterService } from '../../adapters/disability.adapter';
import { Employee } from '../../models/employees';
import { AbsenceRequest } from '../../models/absence-request';
import { Disability } from '../../models/disability';
import { UploadAdapterService } from '../../adapters/upload.adapter';
import { ToastrService } from 'ngx-toastr';
import { PermissionsService } from '../../services/permissions.service';
import { ReportPermissionsVacationsService } from '../../services/reports/report_permissions_vacations.service';
import { ReportPermisoPdfService } from '../../services/reports/report_permiso_pdf.service';
import { ReportPermissionsHistoryService } from '../../services/reports/report_permissions_history.service';
import { ReportVacacionesPdfService } from '../../services/reports/report_vacaciones_pdf.service';

interface VacationRow {
    id: string; // Employee ID
    antiguedad: number;
    num: string;
    nombre: string;
    fechaIngreso: string;
    admissionDateRaw: string; // YYYY-MM-DD para edición
    position: string;
    location: string;
    diasPorTomarPrevious: number;
    aniversarioCurrent: string;
    totalVacaciones: number;
    diasTomados: number; // Current year taken
    diasPorTomarCurrent: number;
    saldoTotal: number;
    history: RequestRecord[];
}

interface RequestRecord {
    id: string;
    employeeId: string;
    type: 'Vacaciones' | 'Permiso' | 'Incapacidad';
    subtype?: string;
    startDate: string;
    endDate: string;
    daysCount: number;
    description: string;
    reason: string;
    withPay: boolean;
    vacationYear?: number;
    documentUrl?: string;
    requestDate: string;
    returnToWorkDate?: string;
}

@Component({
    selector: 'app-permissions-vacations',
    templateUrl: './permissions-vacations.component.html',
    styleUrls: ['./permissions-vacations.component.css'],
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule]
})
export class PermissionsVacationsComponent implements OnInit {
    allRows: VacationRow[] = [];
    allEmployeesMap: Map<string, Employee> = new Map();
    allRawRequests: AbsenceRequest[] = [];
    filteredData: VacationRow[] = [];
    searchTerm: string = '';
    loading: boolean = true;
    requestForm: FormGroup;
    requestType: 'Vacaciones' | 'Permiso' | 'Incapacidad' = 'Vacaciones';
    selectedFile: File | null = null;

    // Dynamic Years
    currentYear: number = new Date().getFullYear();
    previousYear: number = new Date().getFullYear() - 1;

    // Calendar State
    calendarCurrentDate: Date = new Date();
    weekDays: string[] = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    calendarDays: any[] = [];
    calendarMonthLabel: string = '';
    private isOpenedFromCalendar: boolean = false;
    private isOpenedFromHistory: boolean = false;

    // Tabs
    activeTab: 'vacaciones' | 'histVacaciones' | 'histPermisos' | 'histIncapacidades' = 'vacaciones';

    // History Modal State
    selectedEmployeeName: string = '';
    selectedEmployeeId: string = '';
    selectedEmployeeHistory: RequestRecord[] = [];

    // Inline edit state for días por tomar
    editingCell: { id: string; field: 'previous' | 'current' } | null = null;

    // Inline edit state para fecha de ingreso
    editingDateRow: string | null = null;

    // Disabilities cache
    disabilities: Disability[] = [];

    // ID de la incapacidad en edición (para hacer update y no duplicar)
    editingDisabilityId: number | null = null;

    // Permission State
    canManage: boolean = false;

    // State for Edit Mode
    editingRequestId: string | null = null;
    isReadOnly: boolean = false;
    currentDocumentUrl: string | null = null;

    // Vacation Years for dropdown
    availableVacationYears: number[] = [];

    // Incapacidad motivo state
    incapacidadMotivoBase: string = '';
    incapacidadTrayecto: string = '';
    incapacidadOtrosTexto: string = '';

    constructor(
        private employeesAdapter: EmployeesAdapterService,
        private docService: EmployeeDocumentsAdapterService,
        private absenceRequestAdapter: AbsenceRequestAdapterService,
        private disabilityAdapter: DisabilityAdapterService,
        private fb: FormBuilder,
        private uploadService: UploadAdapterService,
        private toastr: ToastrService,
        private reportService: ReportPermissionsVacationsService,
        private permisoPdfService: ReportPermisoPdfService,
        private vacacionesPdfService: ReportVacacionesPdfService,
        private permissionsService: PermissionsService,
        private historyExcelService: ReportPermissionsHistoryService
    ) {
        this.requestForm = this.fb.group({
            employeeId: ['', Validators.required],
            startDate: ['', Validators.required],
            endDate: ['', Validators.required],
            reason: ['', Validators.required],
            description: [''],
            withPay: [false],
            vacationYear: [null],
            // Campos exclusivos de Incapacidad
            position: [''],
            location: [''],
            folio: [''],
            incapacidadType: [''],
            insuranceBranch: [''],
            eg: [false],
            rt: [false],
            at_field: [false],
            st7: [false],
            st2: [false],
            returnToWorkDate: [''],
            disabilityDays: [null]
        });

        this.requestForm.get('startDate')!.valueChanges.subscribe(() => this.calcDisabilityEndDate());
        this.requestForm.get('disabilityDays')!.valueChanges.subscribe(() => this.calcDisabilityEndDate());

        // Generate available years: only current year and previous year
        const currentYear = new Date().getFullYear();
        this.availableVacationYears = Array.from({ length: 8 }, (_, i) => currentYear - 4 + i);
    }

    ngOnInit(): void {
        this.canManage = !this.permissionsService.hasPermissionsConfigured() || this.permissionsService.canAccessRoute('/dashboard/permisos-vacaciones');
        this.loadEmployees();
    }

    loadEmployees(): void {
        this.loading = true;
        this.employeesAdapter.getList().subscribe({
            next: (employees) => {
                // Guardar TODOS los empleados (activos e inactivos) para lookup en reportes
                this.allEmployeesMap = new Map(employees.map(e => [e.id_employee, e]));

                this.absenceRequestAdapter.getList().subscribe({
                    next: (requests) => {
                        this.allRawRequests = requests;
                        const mappedRequests = this.mapToRequestRecords(requests);
                        this.processEmployees(employees, mappedRequests);
                        this.loading = false;
                    },
                    error: (err) => {
                        console.error('Error loading absence requests', err);
                        this.processEmployees(employees, []);
                        this.loading = false;
                    }
                });
                this.disabilityAdapter.getList().subscribe({
                    next: (disabilities) => { this.disabilities = disabilities; },
                    error: (err) => { console.error('Error loading disabilities', err); }
                });
            },
            error: (err) => {
                console.error('Error loading employees for vacations', err);
                this.loading = false;
                this.toastr.error('Error al cargar empleados');
            }
        });
    }

    private mapToRequestRecords(requests: AbsenceRequest[]): RequestRecord[] {
        return requests.map(r => ({
            id: r.id || '',
            employeeId: r.id_employee,
            type: r.type,
            startDate: r.start_date,
            endDate: r.end_date,
            daysCount: r.days_count,
            description: r.description || '',
            reason: r.reason,
            withPay: r.with_pay,
            vacationYear: r.vacation_year || undefined,
            documentUrl: r.document_url || '',
            requestDate: r.request_date,
            returnToWorkDate: r.return_to_work_date || ''
        }));
    }

    processEmployees(employees: Employee[], savedRequests: RequestRecord[]): void {
        const currentYear = this.currentYear;
        const previousYear = this.previousYear;

        this.allRows = employees
            .filter(emp => emp.status)
            .map((emp, index) => {
                const admissionDateStr = emp.admission_date;
                if (!admissionDateStr) return null;

                const admissionDate = this.parseLocalDate(admissionDateStr);
                const admissionYear = admissionDate.getFullYear();

                // Calculate Seniority for Current Year
                let yearsOfServiceCurrent = currentYear - admissionYear;
                if (yearsOfServiceCurrent < 0) yearsOfServiceCurrent = 0;

                // Calculate Seniority for Previous Year
                let yearsOfServicePrev = previousYear - admissionYear;
                if (yearsOfServicePrev < 0) yearsOfServicePrev = 0;

                const entitlementCurrent = this.calculateVacationDays(yearsOfServiceCurrent);
                const entitlementPrevious = this.calculateVacationDays(yearsOfServicePrev);

                // Format dates
                const anniversaryDateCurrent = new Date(currentYear, admissionDate.getMonth(), admissionDate.getDate());
                const anniversaryStr = this.formatDate(anniversaryDateCurrent);
                const admissionStr = this.formatDate(admissionDate);

                const empHistory = savedRequests.filter((r: any) => r.employeeId === emp.id_employee);

                // Calculate Taken Days for Previous Year - using vacationYear field
                const takenPrevious = empHistory
                    .filter((r: any) => r.type === 'Vacaciones' && r.vacationYear === previousYear)
                    .reduce((sum: number, r: any) => sum + (r.daysCount || 0), 0);

                // Calculate Taken Days for Current Year - using vacationYear field
                const takenCurrent = empHistory
                    .filter((r: any) => r.type === 'Vacaciones' && r.vacationYear === currentYear)
                    .reduce((sum: number, r: any) => sum + (r.daysCount || 0), 0);

                let diasPorTomarPrevious = entitlementPrevious - takenPrevious;
                let diasPorTomarCurrent = entitlementCurrent - takenCurrent;

                // Si el año anterior se agota (queda negativo), el exceso se descuenta del año actual.
                // El año más antiguo se consume primero; no debe quedar en negativo.
                if (diasPorTomarPrevious < 0) {
                    diasPorTomarCurrent += diasPorTomarPrevious; // sumar un negativo = restar el exceso
                    diasPorTomarPrevious = 0;
                }

                const prevKey = `vac_override_${emp.id_employee}_${previousYear}`;
                const currKey = `vac_override_${emp.id_employee}_${currentYear}`;
                const prevOverride = localStorage.getItem(prevKey);
                const currOverride = localStorage.getItem(currKey);
                if (prevOverride !== null) diasPorTomarPrevious = Number(prevOverride);
                if (currOverride !== null) diasPorTomarCurrent = Number(currOverride);

                const saldoTotal = diasPorTomarPrevious + diasPorTomarCurrent;
                const num = emp.employee_code || (index + 1).toString().padStart(4, '0');

                return {
                    id: emp.id_employee,
                    antiguedad: yearsOfServiceCurrent,
                    num: num,
                    nombre: emp.name_employee,
                    fechaIngreso: admissionStr,
                    admissionDateRaw: (admissionDateStr || '').substring(0, 10),
                    position: emp.position || '',
                    location: emp.location || '',
                    diasPorTomarPrevious: diasPorTomarPrevious,
                    aniversarioCurrent: anniversaryStr,
                    totalVacaciones: entitlementCurrent, // Label is 'TOTAL DIAS LEY', usually refers to current entitlement
                    diasTomados: takenCurrent, // Showing Current Year Usage to match the 'Current' row logic visually
                    diasPorTomarCurrent: diasPorTomarCurrent,
                    saldoTotal: saldoTotal,
                    history: empHistory
                };
            })
            .filter(row => row !== null) as VacationRow[];

        // Ordenar por fecha de ingreso (más antiguo primero)
        const parseFechaIngreso = (s: string): number => {
            const p = (s || '').split('/');
            return p.length === 3 ? new Date(+p[2], +p[1] - 1, +p[0]).getTime() : 0;
        };
        this.allRows.sort((a, b) => parseFechaIngreso(a.fechaIngreso) - parseFechaIngreso(b.fechaIngreso));

        this.applyFilter();
    }

    calculateVacationDays(years: number): number {
        if (years <= 0) return 0;
        if (years === 1) return 12;
        if (years === 2) return 14;
        if (years === 3) return 16;
        if (years === 4) return 18;
        if (years === 5) return 20;

        // 6-10 -> 22, etc.
        if (years >= 6 && years <= 10) return 22;
        if (years >= 11 && years <= 15) return 24;
        if (years >= 16 && years <= 20) return 26;
        if (years >= 21 && years <= 25) return 28;
        if (years >= 26 && years <= 30) return 30;

        const cycles5 = Math.floor((years - 1) / 5);
        return 22 + (cycles5 - 1) * 2;
    }

    formatDate(date: Date): string {
        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const y = date.getFullYear();
        return `${d}/${m}/${y}`;
    }

    // Parsea una fecha 'YYYY-MM-DD' (o ISO) como fecha local, sin desfase de zona horaria
    private parseLocalDate(str: string): Date {
        const datePart = (str || '').substring(0, 10);
        const [y, m, d] = datePart.split('-').map(Number);
        return new Date(y, (m || 1) - 1, d || 1);
    }

    applyFilter(): void {
        if (!this.searchTerm) {
            this.filteredData = this.allRows;
        } else {
            const term = this.searchTerm.toLowerCase();
            this.filteredData = this.allRows.filter(r =>
                r.nombre.toLowerCase().includes(term) ||
                r.num.includes(term)
            );
        }
    }

    onEmployeeChange(employeeId: string): void {
        if (this.requestType !== 'Incapacidad') return;
        const selected = this.allRows.find(r => r.id === employeeId);
        if (selected) {
            this.requestForm.patchValue({
                position: selected.position,
                location: selected.location
            });
        }
    }

    // --- Modal Logic ---

    openCreateModal(type: 'Vacaciones' | 'Permiso' | 'Incapacidad'): void {
        this.requestType = type;
        this.requestForm.reset({
            withPay: false,
            reason: type === 'Vacaciones' ? 'Vacaciones' : (type === 'Incapacidad' ? 'Incapacidad' : '')
        });
        this.requestForm.enable();
        this.selectedFile = null;
        this.editingRequestId = null;
        this.editingDisabilityId = null;
        this.isReadOnly = false;
        this.currentDocumentUrl = null;
        this.incapacidadMotivoBase = '';
        this.incapacidadTrayecto = '';
        this.incapacidadOtrosTexto = '';
        const modal = new (window as any).bootstrap.Modal(document.getElementById('createRequestModal'));
        modal.show();
    }

    // Helper to open edit from history
    onIncapacidadMotivoChange(value: string): void {
        this.incapacidadMotivoBase = value;
        this.incapacidadTrayecto = '';
        this.incapacidadOtrosTexto = '';
        if (value === 'Accidente en trayecto') {
            this.requestForm.patchValue({ reason: value });
        } else if (value === 'Otros') {
            this.requestForm.patchValue({ reason: '' });
        } else {
            this.requestForm.patchValue({ reason: value });
        }
    }

    // Inicializa el selector de motivo de incapacidad a partir del reason guardado
    private initIncapacidadMotivo(reason: string): void {
        this.incapacidadMotivoBase = '';
        this.incapacidadTrayecto = '';
        this.incapacidadOtrosTexto = '';
        const baseOptions = ['Enfermedad General', 'Accidente de trabajo', 'Maternidad', 'Parcial permanente'];
        if (!reason || reason === 'Incapacidad') {
            return;
        }
        if (reason.startsWith('Accidente en trayecto')) {
            this.incapacidadMotivoBase = 'Accidente en trayecto';
            const parts = reason.split(' - ');
            this.incapacidadTrayecto = parts.length > 1 ? parts[1] : '';
        } else if (baseOptions.includes(reason)) {
            this.incapacidadMotivoBase = reason;
        } else {
            this.incapacidadMotivoBase = 'Otros';
            this.incapacidadOtrosTexto = reason;
        }
    }

    onTrayectoChange(value: string): void {
        this.incapacidadTrayecto = value;
        this.requestForm.patchValue({ reason: `Accidente en trayecto - ${value}` });
    }

    onOtrosTextoChange(value: string): void {
        this.incapacidadOtrosTexto = value;
        this.requestForm.patchValue({ reason: value });
    }

    editRequest(record: RequestRecord, employeeId: string): void {
        this.requestType = record.type;
        this.editingRequestId = record.id;
        this.selectedFile = null;
        this.isReadOnly = false;
        this.currentDocumentUrl = record.documentUrl || null;
        this.incapacidadMotivoBase = '';
        this.incapacidadTrayecto = '';
        this.incapacidadOtrosTexto = '';

        this.requestForm.patchValue({
            employeeId: employeeId,
            startDate: record.startDate,
            endDate: record.endDate,
            reason: record.reason || '',
            description: record.description || '',
            withPay: !!record.withPay,
            vacationYear: record.vacationYear || null,
            returnToWorkDate: record.returnToWorkDate || ''
        });

        if (record.type === 'Incapacidad') {
            this.initIncapacidadMotivo(record.reason || '');
            this.patchDisabilityFields(employeeId, record.startDate);
        }

        this.requestForm.enable();
        this.switchModal();
    }

    viewRequest(record: RequestRecord, employeeId: string): void {
        this.requestType = record.type;
        this.editingRequestId = record.id;
        this.selectedFile = null;
        this.isReadOnly = true;
        this.currentDocumentUrl = record.documentUrl || null;
        this.incapacidadMotivoBase = '';
        this.incapacidadTrayecto = '';
        this.incapacidadOtrosTexto = '';

        this.requestForm.patchValue({
            employeeId: employeeId,
            startDate: record.startDate,
            endDate: record.endDate,
            reason: record.reason || '',
            description: record.description || '',
            withPay: !!record.withPay,
            vacationYear: record.vacationYear || null,
            returnToWorkDate: record.returnToWorkDate || ''
        });

        if (record.type === 'Incapacidad') {
            this.initIncapacidadMotivo(record.reason || '');
            this.patchDisabilityFields(employeeId, record.startDate);
        }

        this.requestForm.disable();
        this.switchModal();
    }

    private calcDisabilityEndDate(): void {
        if (this.requestType !== 'Incapacidad') return;
        const startVal = this.requestForm.get('startDate')?.value;
        const days = parseInt(this.requestForm.get('disabilityDays')?.value, 10);
        if (!startVal || !days || days <= 0) return;
        const start = new Date(startVal + 'T00:00:00');
        start.setDate(start.getDate() + days - 1);
        const endDate = start.toISOString().split('T')[0];
        this.requestForm.patchValue({ endDate }, { emitEvent: false });
    }

    private patchDisabilityFields(employeeId: string, startDate: string): void {
        const disability = this.disabilities.find(
            d => d.id_employee === employeeId && d.start_date === startDate
        );
        this.editingDisabilityId = disability?.id ?? null;
        if (disability) {
            this.requestForm.patchValue({
                position: disability.position || '',
                location: disability.location || '',
                folio: disability.folio || '',
                incapacidadType: disability.type || '',
                insuranceBranch: disability.insurance_branch || '',
                eg: !!disability.eg,
                rt: !!disability.rt,
                at_field: !!disability.at_field,
                st7: !!disability.st7,
                st2: !!disability.st2,
                returnToWorkDate: disability.return_to_work_date || '',
                disabilityDays: disability.days || null
            });
            // Si la URL guardada en la solicitud no es válida, intentar con la de la incapacidad
            if (disability.document_path?.startsWith('http')) {
                this.currentDocumentUrl = disability.document_path;
            }
        }
    }

    deleteRequest(record: RequestRecord): void {
        if (!confirm('¿Está seguro de que desea eliminar este registro?')) return;
        if (!record.id) return;

        this.absenceRequestAdapter.delete(record.id).subscribe({
            next: () => {
                this.toastr.success('Registro eliminado');
                this.selectedEmployeeHistory = this.selectedEmployeeHistory.filter(r => r.id !== record.id);
                this.loadEmployees();
            },
            error: (err) => {
                console.error('Error deleting request', err);
                this.toastr.error('Error al eliminar el registro');
            }
        });
    }

    private switchModal(): void {
        const historyModalEl = document.getElementById('historyModal');
        if (historyModalEl) {
            const historyModal = (window as any).bootstrap.Modal.getInstance(historyModalEl);
            if (historyModal) {
                this.isOpenedFromHistory = true;
                historyModal.hide();
            }
        }

        const createModal = new (window as any).bootstrap.Modal(document.getElementById('createRequestModal'));
        createModal.show();
    }

    async openDocument(url: string | null): Promise<void> {
        // 1. Si la URL guardada es válida, abrir directo
        if (url && url.startsWith('http')) {
            window.open(url, '_blank', 'noopener,noreferrer');
            return;
        }

        // 2. Link roto (registros viejos): intentar recuperar desde el repositorio de documentos
        const employeeId = this.requestForm.get('employeeId')?.value;
        if (!employeeId) {
            this.toastr.warning('No se pudo identificar al colaborador para recuperar el documento.');
            return;
        }

        this.toastr.info('Buscando el documento en el repositorio...');
        try {
            const docs = await firstValueFrom(this.docService.getDocuments(employeeId));
            const expectedType = `Justificante ${this.requestType}`;
            // Buscar documento del tipo correspondiente con URL válida de Firebase
            const match = (docs || []).find(d =>
                d.document_type === expectedType && (d.document_path || '').startsWith('http')
            );
            if (match?.document_path) {
                window.open(match.document_path, '_blank', 'noopener,noreferrer');
                // Reparar el registro para que la próxima vez ya tenga el link bueno
                if (this.editingRequestId) {
                    this.absenceRequestAdapter.update(this.editingRequestId, {
                        document_url: match.document_path
                    } as AbsenceRequest).subscribe({ error: () => {} });
                }
                return;
            }
        } catch (err) {
            console.error('Error recuperando documento', err);
        }

        this.toastr.warning(
            'No se encontró el archivo en el repositorio. Es posible que se haya reemplazado por otro documento del mismo tipo. En ese caso será necesario volver a adjuntarlo.',
            'Documento no disponible',
            { timeOut: 7000 }
        );
    }

    onFileSelected(event: any): void {
        if (this.isReadOnly) return;
        if (event.target.files && event.target.files.length > 0) {
            this.selectedFile = event.target.files[0];
        }
    }

    async saveRequest(): Promise<void> {
        if (this.isReadOnly) return; // Prevention

        // If it's Vacations or Incapacidad, ensure a default reason to pass validation
        if (this.requestType === 'Vacaciones' && !this.requestForm.get('reason')?.value) {
            this.requestForm.patchValue({ reason: 'Vacaciones' });
        }
        if (this.requestType === 'Incapacidad' && !this.requestForm.get('reason')?.value) {
            this.requestForm.patchValue({ reason: 'Incapacidad' });
        }

        if (this.requestForm.invalid) {
            this.toastr.warning('Por favor complete los campos requeridos');
            return;
        }

        const formValues = this.requestForm.value; // Note: if disabled, value might be missing fields depending on Angular version/config. 
        // But we re-enable before save? No, readOnly shouldn't save.
        // For Edit, form is enabled.

        const start = new Date(formValues.startDate);
        const end = new Date(formValues.endDate);
        const daysCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;

        if (daysCount <= 0) {
            this.toastr.error('La fecha fin debe ser posterior a la fecha inicio');
            return;
        }

        this.toastr.info('Procesando solicitud...');

        let docPath = '';

        // 1. Upload File to Document Repository if exists
        if (this.selectedFile) {
            try {
                const formData = new FormData();
                formData.append('id_employee', formValues.employeeId);
                formData.append('document_type', `Justificante ${this.requestType}`);
                formData.append('document', this.selectedFile);

                const uploadRes = await firstValueFrom(this.docService.saveDocument(formData));
                docPath = uploadRes?.doc?.document_path || uploadRes?.document_path || '';
                if (!docPath) {
                    this.toastr.error('El archivo se subió pero no se obtuvo la URL. Intenta de nuevo.');
                    return;
                }
                this.toastr.success('Documento guardado en repositorio');
            } catch (err) {
                console.error('Upload Error', err);
                this.toastr.error('Error al subir el documento al repositorio');
                return;
            }
        }

        const requestData: AbsenceRequest = {
            id_employee: formValues.employeeId,
            type: this.requestType,
            start_date: formValues.startDate,
            end_date: formValues.endDate,
            days_count: daysCount,
            reason: formValues.reason,
            description: formValues.description || '',
            with_pay: !!formValues.withPay,
            vacation_year: this.requestType === 'Vacaciones' ? formValues.vacationYear : null,
            document_url: docPath || this.currentDocumentUrl || '',
            request_date: new Date().toISOString().split('T')[0],
            return_to_work_date: (this.requestType === 'Vacaciones' && formValues.returnToWorkDate) ? formValues.returnToWorkDate : null
        } as AbsenceRequest;

        try {
            if (this.editingRequestId) {
                await firstValueFrom(this.absenceRequestAdapter.update(this.editingRequestId, requestData));
                this.toastr.success('Registro actualizado exitosamente');
            } else {
                await firstValueFrom(this.absenceRequestAdapter.create(requestData));
                this.toastr.success(`${this.requestType} registrado exitosamente`);
            }

            // Si es Incapacidad, guardar también en la tabla de incapacidades
            if (this.requestType === 'Incapacidad') {
                const selectedEmployee = this.allRows.find(r => r.id === formValues.employeeId);
                const disabilityData: Disability = {
                    id_employee: formValues.employeeId,
                    name: selectedEmployee?.nombre || '',
                    admission_date: selectedEmployee?.fechaIngreso || '',
                    position: formValues.position || '',
                    location: formValues.location || '',
                    start_date: formValues.startDate,
                    end_date: formValues.endDate,
                    days: daysCount,
                    folio: formValues.folio || '',
                    type: formValues.incapacidadType || '',
                    insurance_branch: formValues.insuranceBranch || '',
                    eg: !!formValues.eg,
                    rt: !!formValues.rt,
                    at_field: !!formValues.at_field,
                    st7: !!formValues.st7,
                    st2: !!formValues.st2,
                    return_to_work_date: formValues.returnToWorkDate || null,
                    document_path: docPath || this.currentDocumentUrl || '',
                    document_name: this.selectedFile?.name || ''
                } as Disability;
                try {
                    if (this.editingRequestId && this.editingDisabilityId) {
                        await firstValueFrom(this.disabilityAdapter.update(String(this.editingDisabilityId), disabilityData));
                    } else {
                        await firstValueFrom(this.disabilityAdapter.create(disabilityData));
                    }
                } catch (disabilityErr) {
                    console.error('Error guardando incapacidad', disabilityErr);
                    this.toastr.warning('El registro se guardó pero hubo un error al guardar la incapacidad en el detalle');
                }
            }

            // Close Modal
            const modalEl = document.getElementById('createRequestModal');
            const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
            modal.hide();

            // Generar PDF si el tipo requiere formato
            if (this.requestType !== 'Incapacidad') {
                const empRow = this.allRows.find(r => r.id === formValues.employeeId);
                if (empRow) {
                    this.generarPdf(empRow, requestData, daysCount);
                }
            }

            this.loadEmployees(); // Refresh view
        } catch (err: any) {
            console.error('Error saving request', err);
            this.toastr.error('Error al guardar el registro');
        }
    }

    exportHistory(row: VacationRow): void {
        this.historyExcelService.exportToExcel(row.nombre, row.history);
    }

    private sortByNameThenDate(a: { nombre: string; startDate: string }, b: { nombre: string; startDate: string }): number {
        const byName = (a.nombre || '').localeCompare(b.nombre || '');
        if (byName !== 0) return byName;
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    }

    get allVacacionesRecords(): (RequestRecord & { nombre: string })[] {
        return this.allRows.flatMap(row =>
            row.history
                .filter(r => r.type === 'Vacaciones')
                .map(r => ({ ...r, nombre: row.nombre }))
        ).sort((a, b) => this.sortByNameThenDate(a, b));
    }

    get allPermisosRecords(): (RequestRecord & { nombre: string })[] {
        return this.allRows.flatMap(row =>
            row.history
                .filter(r => r.type === 'Permiso')
                .map(r => ({ ...r, nombre: row.nombre }))
        ).sort((a, b) => this.sortByNameThenDate(a, b));
    }

    get allIncapacidadesRecords(): (any)[] {
        // Base: todas las solicitudes de tipo Incapacidad (igual que en "Ver Registros")
        const incapRequests = this.allRawRequests.filter(r => r.type === 'Incapacidad');
        return incapRequests.map(req => {
            // Enriquecer con la tabla disability (match por empleado + fecha inicio)
            const d: any = this.disabilities.find(
                x => x.id_employee === req.id_employee && x.start_date === req.start_date
            ) || {};
            const emp = this.allEmployeesMap.get(req.id_employee);
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(req.id_employee);
            const nombre = emp?.name_employee || (req as any).employee?.name_employee || d.name || (isUuid ? 'Empleado dado de baja' : req.id_employee);
            const empCode = emp?.employee_code || (isUuid ? '-' : req.id_employee);
            const fechaIngreso = emp?.admission_date
                ? this.formatDate(new Date(emp.admission_date + 'T00:00:00'))
                : '';
            return {
                id_employee: req.id_employee,
                empCode,
                nombre,
                fechaIngreso,
                position: d.position || emp?.position || '',
                location: d.location || emp?.location || '',
                start_date: req.start_date,
                end_date: req.end_date,
                days: req.days_count,
                folio: d.folio || '',
                type: d.type || '',
                eg: d.eg, rt: d.rt, at_field: d.at_field, st7: d.st7, st2: d.st2,
                return_to_work_date: d.return_to_work_date || ''
            };
        }).sort((a, b) => {
            // Ordenar por colaborador (nombre); dentro del mismo, por fecha de inicio
            const byName = (a.nombre || '').localeCompare(b.nombre || '');
            if (byName !== 0) return byName;
            return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
        });
    }

    exportAllVacaciones(): void {
        this.exportReportExcel(
            'Historial_Vacaciones',
            ['Nombre', 'Fecha Solicitud', 'Desde', 'Hasta', 'Días', 'Periodo', 'Motivo', 'Descripción'],
            this.allVacacionesRecords.map(r => [
                r.nombre,
                this.formatDateStr(r.requestDate),
                this.formatDateStr(r.startDate),
                this.formatDateStr(r.endDate),
                r.daysCount,
                r.vacationYear ? `${r.vacationYear} - ${r.vacationYear + 1}` : '-',
                r.reason || '-',
                r.description || '-'
            ])
        );
    }

    exportAllPermisos(): void {
        this.exportReportExcel(
            'Historial_Permisos',
            ['Nombre', 'Fecha Solicitud', 'Desde', 'Hasta', 'Días', 'Motivo', 'Con Goce', 'Descripción'],
            this.allPermisosRecords.map(r => [
                r.nombre,
                this.formatDateStr(r.requestDate),
                this.formatDateStr(r.startDate),
                this.formatDateStr(r.endDate),
                r.daysCount,
                r.reason || '-',
                r.withPay ? 'Sí' : 'No',
                r.description || '-'
            ])
        );
    }

    exportAllIncapacidades(): void {
        this.exportReportExcel(
            'Historial_Incapacidades',
            ['ID', 'Nombre', 'Fecha Ingreso', 'Puesto', 'Ubicación', 'Inicio', 'Folio', 'Días', 'Vence', 'Tipo', 'EG', 'RT', 'AT', 'ST7', 'ST2', 'Inicio Labores', 'Observaciones'],
            this.allIncapacidadesRecords.map(d => [
                d.empCode || d.id_employee,
                d.nombre,
                d.fechaIngreso,
                d.position || '-',
                d.location || '-',
                d.start_date ? this.formatDate(new Date(d.start_date + 'T00:00:00')) : '-',
                d.folio || '-',
                d.days || '-',
                d.end_date ? this.formatDate(new Date(d.end_date + 'T00:00:00')) : '-',
                d.type || '-',
                d.eg ? 'X' : '',
                d.rt ? 'X' : '',
                d.at_field ? 'X' : '',
                d.st7 ? 'X' : '',
                d.st2 ? 'X' : '',
                d.return_to_work_date ? this.formatDate(new Date(d.return_to_work_date + 'T00:00:00')) : '-',
                ''
            ])
        );
    }

    private exportReportExcel(fileName: string, headers: string[], rows: any[][]): void {
        const ORANGE: [number,number,number] = [245, 133, 37];
        const WHITE: [number,number,number] = [255, 255, 255];
        const DARK: [number,number,number] = [30, 30, 30];
        const LIGHT_BG: [number,number,number] = [245, 245, 245];

        const headerStyle: any = {
            font: { bold: true, sz: 10, color: { rgb: 'FFFFFF' } },
            fill: { fgColor: { rgb: 'F58525' } },
            alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
            border: { top: { style: 'thin', color: { rgb: 'D47020' } }, bottom: { style: 'thin', color: { rgb: 'D47020' } }, left: { style: 'thin', color: { rgb: 'D47020' } }, right: { style: 'thin', color: { rgb: 'D47020' } } }
        };
        const titleStyle: any = {
            font: { bold: true, sz: 14, color: { rgb: 'FFFFFF' } },
            fill: { fgColor: { rgb: '2C3E6B' } },
            alignment: { horizontal: 'center', vertical: 'center' }
        };
        const dataStyle: any = {
            font: { sz: 9, color: { rgb: '333333' } },
            alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
            border: { bottom: { style: 'thin', color: { rgb: 'EEEEEE' } }, left: { style: 'thin', color: { rgb: 'EEEEEE' } }, right: { style: 'thin', color: { rgb: 'EEEEEE' } } }
        };
        const centerData: any = { ...dataStyle, alignment: { horizontal: 'center', vertical: 'center' } };

        const emissionDate = new Date().toLocaleString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
        const allRows = [
            [fileName.replace(/_/g, ' ')],
            [`Fecha de generación: ${emissionDate}`],
            [],
            headers,
            ...rows
        ];

        const ws: any = XLSX.utils.aoa_to_sheet(allRows);
        ws['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
            { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } },
            { s: { r: 2, c: 0 }, e: { r: 2, c: headers.length - 1 } },
        ];
        ws['!cols'] = headers.map(() => ({ wch: 18 }));
        ws['!rows'] = [{ hpt: 28 }, { hpt: 16 }, { hpt: 8 }, { hpt: 22 }];

        for (let c = 0; c < headers.length; c++) {
            ['A1','B1','C1'].forEach(() => {});
            const r0 = XLSX.utils.encode_cell({ r: 0, c });
            const r1 = XLSX.utils.encode_cell({ r: 1, c });
            const r3 = XLSX.utils.encode_cell({ r: 3, c });
            if (!ws[r0]) ws[r0] = { v: '' };
            if (!ws[r1]) ws[r1] = { v: '' };
            ws[r0].s = titleStyle;
            ws[r1].s = { font: { sz: 9, color: { rgb: '666666' } }, fill: { fgColor: { rgb: 'F5F5F5' } }, alignment: { horizontal: 'center' } };
            if (ws[r3]) ws[r3].s = headerStyle;
        }

        rows.forEach((_, i) => {
            headers.forEach((__, c) => {
                const ref = XLSX.utils.encode_cell({ r: 4 + i, c });
                if (!ws[ref]) ws[ref] = { v: '' };
                ws[ref].s = c <= 1 ? dataStyle : centerData;
            });
        });

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, fileName.substring(0, 31));
        XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
    }

    private overrideKey(id: string, field: 'previous' | 'current'): string {
        const year = field === 'previous' ? this.previousYear : this.currentYear;
        return `vac_override_${id}_${year}`;
    }

    getOverride(id: string, field: 'previous' | 'current'): number | null {
        const raw = localStorage.getItem(this.overrideKey(id, field));
        return raw !== null ? Number(raw) : null;
    }

    getDiasPorTomar(item: VacationRow, field: 'previous' | 'current'): number {
        const override = this.getOverride(item.id, field);
        return override !== null ? override : (field === 'previous' ? item.diasPorTomarPrevious : item.diasPorTomarCurrent);
    }

    startEdit(item: VacationRow, field: 'previous' | 'current'): void {
        if (!this.canManage) return;
        this.editingCell = { id: item.id, field };
    }

    saveEdit(item: VacationRow, field: 'previous' | 'current', value: string): void {
        const num = parseInt(value, 10);
        if (!isNaN(num) && num >= 0) {
            localStorage.setItem(this.overrideKey(item.id, field), String(num));
            if (field === 'previous') item.diasPorTomarPrevious = num;
            else item.diasPorTomarCurrent = num;
            item.saldoTotal = item.diasPorTomarPrevious + item.diasPorTomarCurrent;
        }
        this.editingCell = null;
    }

    isEditing(id: string, field: 'previous' | 'current'): boolean {
        return this.editingCell?.id === id && this.editingCell?.field === field;
    }

    startEditDate(item: VacationRow): void {
        if (!this.canManage) return;
        this.editingDateRow = item.id;
    }

    saveAdmissionDate(item: VacationRow, value: string): void {
        this.editingDateRow = null;
        if (!value || value === item.admissionDateRaw) return;
        this.employeesAdapter.put(item.id, { admission_date: value } as any).subscribe({
            next: () => {
                this.toastr.success('Fecha de ingreso actualizada');
                this.loadEmployees(); // recalcula antigüedad, aniversario y días
            },
            error: (err) => {
                console.error('Error actualizando fecha de ingreso', err);
                this.toastr.error('No se pudo actualizar la fecha de ingreso');
            }
        });
    }

    toDate(dateStr: string): Date {
        return new Date(dateStr + 'T00:00:00');
    }

    formatDateStr(dateStr: string): string {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr + 'T00:00:00');
            return this.formatDate(d);
        } catch {
            return dateStr;
        }
    }

    openHistoryModal(row: VacationRow): void {
        this.selectedEmployeeName = row.nombre;
        this.selectedEmployeeId = row.id;
        this.selectedEmployeeHistory = [...row.history]
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
            .map(req => {
                if (req.type === 'Incapacidad') {
                    const disability = this.disabilities.find(
                        d => d.id_employee === req.employeeId && d.start_date === req.startDate
                    );
                    return { ...req, subtype: disability?.type || '' };
                }
                return req;
            });
        const modal = new (window as any).bootstrap.Modal(document.getElementById('historyModal'));
        modal.show();
    }

    exportHistoryFromModal(filterType?: 'Vacaciones' | 'Permiso' | 'Incapacidad'): void {
        const records = filterType
            ? this.selectedEmployeeHistory.filter(r => r.type === filterType)
            : this.selectedEmployeeHistory;
        if (records.length === 0) {
            this.toastr.info(`No hay registros de ${filterType || 'historial'} para exportar`);
            return;
        }
        const suffix = filterType ? ` - ${filterType}` : '';
        this.historyExcelService.exportToExcel(this.selectedEmployeeName + suffix, records);
    }

    countByType(type: 'Vacaciones' | 'Permiso' | 'Incapacidad'): number {
        return this.selectedEmployeeHistory.filter(r => r.type === type).length;
    }

    // --- Calendar Logic ---

    openCalendarModal(): void {
        this.calendarCurrentDate = new Date(); // Reset to today
        this.buildCalendar();
        const modal = new (window as any).bootstrap.Modal(document.getElementById('calendarModal'));
        modal.show();
    }

    changeMonth(delta: number): void {
        this.calendarCurrentDate.setMonth(this.calendarCurrentDate.getMonth() + delta);
        // Force update reference to trigger change detection if needed (though mutation works usually in Angular default strategy)
        this.calendarCurrentDate = new Date(this.calendarCurrentDate);
        this.buildCalendar();
    }

    buildCalendar(): void {
        const year = this.calendarCurrentDate.getFullYear();
        const month = this.calendarCurrentDate.getMonth();

        // Month Label
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        this.calendarMonthLabel = `${monthNames[month]} ${year}`;

        // First day of the month
        const firstDay = new Date(year, month, 1);
        // Last day of the month
        const lastDay = new Date(year, month + 1, 0);

        // Days in month
        const daysInMonth = lastDay.getDate();

        // Day of week for the first day (0 = Sunday, 1 = Monday, etc.)
        const startDayOfWeek = firstDay.getDay();

        this.calendarDays = [];

        // Add empty padding days for start
        for (let i = 0; i < startDayOfWeek; i++) {
            this.calendarDays.push({ day: null, events: [] });
        }

        // Collect all events from all employees
        // We need to flatten the history of all rows
        const allEvents = this.allRows.flatMap(row =>
            row.history.map(h => ({
                ...h,
                employeeName: row.nombre
            }))
        );

        // Add actual days
        for (let i = 1; i <= daysInMonth; i++) {
            const currentDayDate = new Date(year, month, i);
            const dateStr = this.formatDateIso(currentDayDate); // YYYY-MM-DD for comparison

            // Filter events that include this day
            const dayEvents = allEvents.filter(event => {
                const start = new Date(event.startDate);
                const end = new Date(event.endDate);
                // Reset times to compare strictly dates
                start.setHours(0, 0, 0, 0);
                end.setHours(0, 0, 0, 0);

                // Check if currentDayDate is within range [start, end]
                return currentDayDate >= start && currentDayDate <= end;
            });

            this.calendarDays.push({
                day: i,
                date: currentDayDate,
                events: dayEvents
            });
        }
    }

    // Helper to format date as YYYY-MM-DD for simpler comparison if needed, 
    // although direct Date object comparison (normalized) is often safer.
    // Kept this for reference or debugging.
    private formatDateIso(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    onEventClick(event: any): void {
        this.isOpenedFromCalendar = true;
        // Must close calendar modal first to show the detail modal properly or handle stacking
        // For simplicity and to reuse existing logic:
        const calendarModalEl = document.getElementById('calendarModal');
        if (calendarModalEl) {
            const calendarModal = (window as any).bootstrap.Modal.getInstance(calendarModalEl);
            if (calendarModal) calendarModal.hide();
        }

        // Use setTimeout to ensure previous modal finishes hiding if animations conflict, 
        // though Bootstrap 5 usually handles stacking if configured, but 'hide' is safer for now.
        setTimeout(() => {
            this.viewRequest(event, event.employeeId);
        }, 150);
    }

    closeRequestModal(): void {
        const modalEl = document.getElementById('createRequestModal');
        if (modalEl) {
            const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
        }

        if (this.isOpenedFromHistory) {
            this.isOpenedFromHistory = false;
            setTimeout(() => {
                const historyModalEl = document.getElementById('historyModal');
                if (historyModalEl) {
                    const modal = new (window as any).bootstrap.Modal(historyModalEl);
                    modal.show();
                }
            }, 150);
        } else if (this.isOpenedFromCalendar) {
            this.isOpenedFromCalendar = false;
            setTimeout(() => {
                this.openCalendarModal();
            }, 150);
        }
    }

    exportToExcel(): void {
        this.reportService.exportToExcel(this.filteredData, this.previousYear, this.currentYear);
    }

    printRecord(record: RequestRecord): void {
        if (record.type === 'Incapacidad') return;
        const empRow = this.allRows.find(r => r.id === this.selectedEmployeeId);
        if (!empRow) return;
        const absReq = {
            id_employee: empRow.id,
            type: record.type,
            start_date: record.startDate,
            end_date: record.endDate,
            days_count: record.daysCount,
            reason: record.reason,
            description: record.description,
            with_pay: record.withPay,
            vacation_year: record.vacationYear ?? null,
            document_url: record.documentUrl || '',
            request_date: record.requestDate
        };
        const daysCount = record.daysCount;
        this.generarPdf(empRow, absReq as any, daysCount);
    }

    private generarPdf(empRow: VacationRow, requestData: any, daysCount: number): void {
        if (requestData.type === 'Permiso') {
            this.permisoPdfService.generate(
                { nombre: empRow.nombre, fechaIngreso: empRow.fechaIngreso },
                {
                    startDate: requestData.start_date,
                    endDate: requestData.end_date,
                    reason: requestData.reason,
                    withPay: !!requestData.with_pay,
                    requestDate: requestData.request_date
                }
            );
        } else if (requestData.type === 'Vacaciones') {
            this.vacacionesPdfService.generate(
                {
                    nombre: empRow.nombre,
                    fechaIngreso: empRow.fechaIngreso,
                    antiguedad: empRow.antiguedad,
                    totalVacaciones: empRow.totalVacaciones,
                    diasTomados: empRow.diasTomados,
                    diasPorTomarPrevious: empRow.diasPorTomarPrevious,
                    diasPorTomarCurrent: empRow.diasPorTomarCurrent,
                    saldoTotal: empRow.saldoTotal
                },
                {
                    startDate: requestData.start_date,
                    endDate: requestData.end_date,
                    daysCount: daysCount,
                    requestDate: requestData.request_date,
                    vacationYear: requestData.vacation_year ?? null
                }
            );
        }
    }
}

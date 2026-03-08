import { Component, OnInit } from '@angular/core';
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
import { ReportPermissionsVacationsService } from '../../services/reports/report_permissions_vacations.service';
import { ReportPermisoPdfService } from '../../services/reports/report_permiso_pdf.service';
import { ReportVacacionesPdfService } from '../../services/reports/report_vacaciones_pdf.service';

interface VacationRow {
    id: string; // Employee ID
    antiguedad: number;
    num: string;
    nombre: string;
    fechaIngreso: string;
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
    startDate: string;
    endDate: string;
    daysCount: number;
    description: string;
    reason: string;
    withPay: boolean;
    vacationYear?: number;
    documentUrl?: string;
    requestDate: string;
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

    // History Modal State
    selectedEmployeeName: string = '';
    selectedEmployeeId: string = '';
    selectedEmployeeHistory: RequestRecord[] = [];

    // Disabilities cache
    disabilities: Disability[] = [];

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
        private vacacionesPdfService: ReportVacacionesPdfService
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
            returnToWorkDate: ['']
        });

        // Generate available years: only current year and previous year
        const currentYear = new Date().getFullYear();
        this.availableVacationYears = [currentYear - 1, currentYear];
    }

    ngOnInit(): void {
        this.loadEmployees();
    }

    loadEmployees(): void {
        this.loading = true;
        this.employeesAdapter.getList().subscribe({
            next: (employees) => {
                this.absenceRequestAdapter.getList().subscribe({
                    next: (requests) => {
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
            requestDate: r.request_date
        }));
    }

    processEmployees(employees: Employee[], savedRequests: RequestRecord[]): void {
        const currentYear = this.currentYear;
        const previousYear = this.previousYear;

        // Check Permissions (Live Update)
        if (typeof localStorage !== 'undefined') {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    const currentUserEmail = user.email;

                    // Find current user in the fresh employees list
                    const currentEmployee = employees.find(e => e.email === currentUserEmail);

                    if (currentEmployee) {
                        // Use fresh permission from DB
                        this.canManage = currentEmployee.pPermisosVacaciones === '1';
                    } else {
                        // Fallback to localStorage if not found in list (e.g. admin not in employee list)
                        this.canManage = user.pPermisosVacaciones === '1';
                    }
                } catch (e) {
                    console.error('Error parsing user for permissions', e);
                }
            }
        }

        this.allRows = employees
            .filter(emp => emp.status)
            .map((emp, index) => {
                const admissionDateStr = emp.admission_date;
                if (!admissionDateStr) return null;

                const admissionDate = new Date(admissionDateStr);
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
                // Optional: Clamp negative previous balance if needed, but usually it can be negative or 0.
                // Assuming standard logic where unused days carry over, but here we just show strict year math as requested.
                // However, if yearsOfServicePrev was 0 (new employee last year), existing logic works.
                // If employee joined THIS year, Previous Entitlement is 0. Balance 0. Correct.

                let diasPorTomarCurrent = entitlementCurrent - takenCurrent;

                const saldoTotal = diasPorTomarPrevious + diasPorTomarCurrent;
                const num = emp.employee_code || (index + 1).toString().padStart(4, '0');

                return {
                    id: emp.id_employee,
                    antiguedad: yearsOfServiceCurrent,
                    num: num,
                    nombre: emp.name_employee,
                    fechaIngreso: admissionStr,
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
            vacationYear: record.vacationYear || null
        });

        if (record.type === 'Incapacidad') {
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
            vacationYear: record.vacationYear || null
        });

        if (record.type === 'Incapacidad') {
            this.patchDisabilityFields(employeeId, record.startDate);
        }

        this.requestForm.disable();
        this.switchModal();
    }

    private patchDisabilityFields(employeeId: string, startDate: string): void {
        const disability = this.disabilities.find(
            d => d.id_employee === employeeId && d.start_date === startDate
        );
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
                returnToWorkDate: disability.return_to_work_date || ''
            });
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
            if (historyModal) historyModal.hide();
        }

        const createModal = new (window as any).bootstrap.Modal(document.getElementById('createRequestModal'));
        createModal.show();
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
                this.toastr.success('Documento guardado en repositorio');
                docPath = uploadRes?.path || 'Repositorio';
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
            request_date: new Date().toISOString().split('T')[0]
        };

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
                    return_to_work_date: formValues.returnToWorkDate || '',
                    document_path: docPath || this.currentDocumentUrl || '',
                    document_name: this.selectedFile?.name || ''
                };
                try {
                    await firstValueFrom(this.disabilityAdapter.create(disabilityData));
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
        } catch (err) {
            console.error('Error saving request', err);
            this.toastr.error('Error al guardar el registro');
        }
    }

    openHistoryModal(row: VacationRow): void {
        this.selectedEmployeeName = row.nombre;
        this.selectedEmployeeId = row.id;
        this.selectedEmployeeHistory = row.history;
        const modal = new (window as any).bootstrap.Modal(document.getElementById('historyModal'));
        modal.show();
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

        if (this.isOpenedFromCalendar) {
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

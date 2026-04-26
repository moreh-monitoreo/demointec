import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { EmployeesAdapterService } from '../../adapters/employees.adapter';
import { LaborRelationsAdapterService, LaborEvent, EmployeeUniform } from '../../adapters/labor-relations.adapter';
import { Employee } from '../../models/employees';

@Component({
    selector: 'app-labor-relations',
    templateUrl: './labor-relations.component.html',
    styleUrl: './labor-relations.component.css',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule]
})
export class LaborRelationsComponent implements OnInit {
    // Panel 1: Search
    searchTerm: string = '';
    employees: Employee[] = [];
    filteredEmployees: Employee[] = [];
    selectedEmployee: Employee | null = null;
    searchForm: FormGroup;
    selectedIndex: number = -1; // Index for keyboard navigation

    // Panel 2: Events
    events: LaborEvent[] = [];
    eventForm: FormGroup;
    selectedEventDetail: LaborEvent | null = null; // For View/Edit
    selectedFile: File | null = null;

    // Panel 3: Uniforms
    uniformForm: FormGroup;



    constructor(
        private fb: FormBuilder,
        private employeesService: EmployeesAdapterService,
        private laborService: LaborRelationsAdapterService,
        private toastr: ToastrService
    ) {
        this.searchForm = this.fb.group({
            searchTerm: ['']
        });

        this.eventForm = this.fb.group({
            event_date: ['', Validators.required],
            event_name: ['', Validators.required],
            observation: [''],
            document_path: ['']
        });

        this.uniformForm = this.fb.group({
            vest_type: [''],
            helmet_color: [''],
            glasses: [false],
            gloves_type: [''],
            earplugs: [false],
            boots_size: [''],
            boots_color: ['']
        });
    }

    ngOnInit(): void {
        this.loadEmployees();

        // Listen to search changes
        this.searchForm.get('searchTerm')?.valueChanges.subscribe(value => {
            this.filterEmployees(value);
        });
    }

    loadEmployees() {
        this.employeesService.getList().subscribe({
            next: (data) => {
                this.employees = data;
                this.filteredEmployees = [];
            },
            error: (err) => console.error(err)
        });
    }



    filterEmployees(term: string) {
        this.selectedIndex = -1; // Reset selection on search change
        if (!term) {
            this.filteredEmployees = [];
            return;
        }
        const lowerTerm = term.toLowerCase();
        this.filteredEmployees = this.employees.filter(emp =>
            emp.name_employee.toLowerCase().includes(lowerTerm) ||
            (emp.email ?? '').toLowerCase().includes(lowerTerm)
        );
    }

    onKeydown(event: KeyboardEvent) {
        if (this.filteredEmployees.length === 0) return;

        if (event.key === 'ArrowDown') {
            event.preventDefault(); // Prevent cursor moving in input
            this.selectedIndex = (this.selectedIndex + 1) % this.filteredEmployees.length;
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            this.selectedIndex = (this.selectedIndex - 1 + this.filteredEmployees.length) % this.filteredEmployees.length;
        } else if (event.key === 'Enter') {
            event.preventDefault(); // Prevent form submit if inside form
            if (this.selectedIndex >= 0 && this.selectedIndex < this.filteredEmployees.length) {
                this.selectEmployee(this.filteredEmployees[this.selectedIndex]);
            } else if (this.filteredEmployees.length > 0) {
                // Optional: Select first if none selected but Enter pressed? 
                // User asked "si aparece una o mas coincidencias... enter". 
                // Often users expect Enter to pick the first one if only one or if they just typed.
                // Let's stick to explicit selection for now, or select first if index is -1.
                this.selectEmployee(this.filteredEmployees[0]);
            }
        }
    }

    clearSearch() {
        this.searchForm.patchValue({ searchTerm: '' });
        this.selectedEmployee = null;
        this.filteredEmployees = [];
        this.selectedIndex = -1;
        this.events = [];
        this.uniformForm.reset();
    }

    selectEmployee(employee: Employee) {
        this.selectedEmployee = employee;
        this.filteredEmployees = []; // Hide list
        this.selectedIndex = -1;
        this.searchForm.patchValue({ searchTerm: employee.name_employee }, { emitEvent: false });

        this.loadEvents();
        this.loadUniforms();
    }

    // --- Events Logic ---

    loadEvents() {
        if (!this.selectedEmployee) return;
        this.laborService.getEvents(this.selectedEmployee.id_employee).subscribe({
            next: (data) => this.events = data,
            error: () => this.toastr.error('Error al cargar eventos')
        });
    }

    onFileSelected(event: any) {
        const file: File = event.target.files[0];
        if (file) {
            this.selectedFile = file;
        }
    }

    addEvent() {
        if (!this.selectedEmployee) return;
        if (this.eventForm.invalid) {
            this.toastr.warning('Completa los campos requeridos del evento');
            return;
        }

        const formData = new FormData();
        formData.append('id_employee', this.selectedEmployee.id_employee);
        formData.append('event_date', this.eventForm.get('event_date')?.value);
        formData.append('event_name', this.eventForm.get('event_name')?.value);
        formData.append('observation', this.eventForm.get('observation')?.value || '');

        if (this.selectedFile) {
            formData.append('document', this.selectedFile);
        }

        this.laborService.createEvent(formData).subscribe({
            next: () => {


                this.toastr.success('Evento agregado');
                this.eventForm.reset();
                this.selectedFile = null;
                this.closeModal('addEventModal');
                this.loadEvents();
            },
            error: (err) => {
                console.error('Frontend Error creating event:', err);
                this.toastr.error('Error al crear evento: ' + (err.message || err.statusText || 'Desconocido'));
            }
        });
    }

    viewEvent(event: LaborEvent) {
        this.selectedEventDetail = event;
        this.openModal('visualizarEventoModal');
    }

    editEvent(event: LaborEvent) {
        this.selectedEventDetail = event;
        this.eventForm.patchValue({
            event_date: event.event_date ? new Date(event.event_date).toISOString().split('T')[0] : '',
            event_name: event.event_name,
            observation: event.observation,
            document_path: event.document_path
        });
        this.selectedFile = null;
        this.openModal('editarEventoModal');
    }

    updateEvent() {
        if (!this.selectedEventDetail || !this.selectedEventDetail.id) return;
        if (this.eventForm.invalid) {
            this.toastr.warning('Completa los campos requeridos');
            return;
        }

        const formData = new FormData();
        // id_employee might not be needed for update if not changing owner, but good practice if required
        if (this.selectedEmployee) {
            formData.append('id_employee', this.selectedEmployee.id_employee);
        }
        formData.append('event_date', this.eventForm.get('event_date')?.value);
        formData.append('event_name', this.eventForm.get('event_name')?.value);
        formData.append('observation', this.eventForm.get('observation')?.value || '');

        if (this.selectedFile) {
            formData.append('document', this.selectedFile);
        }

        this.laborService.updateEvent(this.selectedEventDetail.id, formData).subscribe({
            next: () => {
                this.toastr.success('Evento actualizado');
                this.closeModal('editarEventoModal');
                this.loadEvents();
                this.selectedEventDetail = null;
                this.eventForm.reset();
                this.selectedFile = null;
            },
            error: () => this.toastr.error('Error al actualizar evento')
        });
    }

    deleteEvent(id: number | undefined) {
        if (!id) return;
        if (confirm('¿Seguro de eliminar este evento?')) {
            this.laborService.deleteEvent(id).subscribe({
                next: () => {
                    this.toastr.success('Evento eliminado');
                    this.loadEvents();
                },
                error: () => this.toastr.error('Error al eliminar')
            });
        }
    }


    // --- Uniforms Logic ---

    loadUniforms() {
        if (!this.selectedEmployee) return;
        this.laborService.getUniforms(this.selectedEmployee.id_employee).subscribe({
            next: (data) => {
                if (data) {
                    this.uniformForm.patchValue({
                        vest_type: data.vest_type,
                        helmet_color: data.helmet_color,
                        glasses: data.glasses,
                        gloves_type: data.gloves_type,
                        earplugs: data.earplugs,
                        boots_size: data.boots_size,
                        boots_color: data.boots_color
                    });
                } else {
                    this.uniformForm.reset();
                }
            },
            error: () => this.toastr.error('Error al cargar uniformes')
        });
    }

    saveUniforms() {
        if (!this.selectedEmployee) return;

        const uniformData: EmployeeUniform = {
            id_employee: this.selectedEmployee.id_employee,
            ...this.uniformForm.value
        };

        this.laborService.saveUniforms(uniformData).subscribe({
            next: () => this.toastr.success('Uniformes guardados'),
            error: () => this.toastr.error('Error al guardar uniformes')
        });
    }

    // Helpers

    openModal(modalId: string) {
        const modal = document.getElementById(modalId);
        if (modal) {
            const bootstrapModal = new (window as any).bootstrap.Modal(modal);
            bootstrapModal.show();
        }
    }

    // Alias for backward compatibility if template uses openAddEventModal
    openAddEventModal() {
        this.eventForm.reset();
        this.selectedFile = null;
        this.openModal('addEventModal');
    }



    closeModal(modalId: string) {
        const modal = document.getElementById(modalId);
        if (modal) {
            const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modal);
            if (bootstrapModal) {
                bootstrapModal.hide();
            }
        }
    }
}

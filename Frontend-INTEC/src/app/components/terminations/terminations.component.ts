import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TerminationsAdapterService, Termination } from '../../adapters/terminations.adapter';
import { EmployeesAdapterService } from '../../adapters/employees.adapter';
import { UploadAdapterService } from '../../adapters/upload.adapter';
import { Employee } from '../../models/employees';

declare var bootstrap: any;

@Component({
    selector: 'app-terminations',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './terminations.component.html',
    styleUrls: ['./terminations.component.css']
})
export class TerminationsComponent implements OnInit {
    terminations: Termination[] = [];
    employees: Employee[] = [];
    allEmployees: Employee[] = [];
    isLoading = false;
    searchTerm = '';

    terminationForm: FormGroup;
    isEditMode = false;
    selectedTerminationId: number | null = null;
    selectedTermination: Termination | null = null;
    formModal: any;
    viewModal: any;

    // Archivos al registrar nueva baja
    newTerminationFiles: File[] = [];

    // Estado del modal de documentos (dentro del modal de vista)
    docsFilesToAdd: File[] = [];
    isUploadingDocs = false;

    reasonOptions = [
        'Renuncia voluntaria',
        'Término de contrato',
        'Término de proyecto',
        'Desvinculación',
        'Abandono de trabajo'
    ];

    constructor(
        private terminationsService: TerminationsAdapterService,
        private employeesService: EmployeesAdapterService,
        private uploadService: UploadAdapterService,
        private fb: FormBuilder,
        private toastr: ToastrService,
        private zone: NgZone
    ) {
        this.terminationForm = this.fb.group({
            id_employee: ['', Validators.required],
            last_work_day: ['', Validators.required],
            reason: ['', Validators.required],
            severance_date: [''],
            observation: [''],
            document_path: [''],
            document_paths: [[]]
        });
    }

    get filteredTerminations(): Termination[] {
        if (!this.searchTerm) {
            return this.terminations;
        }
        const lowerTerm = this.searchTerm.toLowerCase();
        return this.terminations.filter(t =>
            (t.employee?.name_employee?.toLowerCase().includes(lowerTerm) ?? false) ||
            (t.name_employee?.toLowerCase().includes(lowerTerm) ?? false) ||
            (t.reason.toLowerCase().includes(lowerTerm)) ||
            (t.observation?.toLowerCase().includes(lowerTerm) ?? false)
        );
    }

    get selectedTerminationDocs(): string[] {
        return this.selectedTermination?.document_paths ?? [];
    }

    getFileNameFromUrl(url: string): string {
        try {
            const decoded = decodeURIComponent(url);
            const parts = decoded.split('/');
            const last = parts[parts.length - 1].split('?')[0];
            // El nombre guardado es uuid_nombreoriginal, quitamos el prefijo uuid_
            const match = last.match(/^[0-9a-f-]{36}_(.+)$/i);
            return match ? match[1] : last;
        } catch {
            return url;
        }
    }

    ngOnInit(): void {
        this.loadTerminations();
        this.loadEmployees();
    }

    loadTerminations(): void {
        this.isLoading = true;
        this.terminationsService.getTerminations().subscribe({
            next: (data: Termination[]) => {
                this.terminations = data;
                this.isLoading = false;
            },
            error: (err: any) => {
                console.error('Error loading terminations', err);
                this.isLoading = false;
            }
        });
    }

    loadEmployees(): void {
        this.employeesService.getList().subscribe({
            next: (data: Employee[]) => {
                this.allEmployees = data;
                this.employees = data.filter(emp => emp.status === true);
            },
            error: (err: any) => {
                console.error('Error loading employees', err);
            }
        });
    }

    openAddModal(): void {
        this.isEditMode = false;
        this.selectedTerminationId = null;
        this.newTerminationFiles = [];
        this.employees = this.allEmployees.filter(emp => emp.status === true);
        this.terminationForm.reset({ document_paths: [] });
        this.showModal();
    }

    openEditModal(termination: Termination): void {
        this.isEditMode = true;
        this.selectedTerminationId = termination.id!;
        this.employees = this.allEmployees.filter(emp => emp.id_employee === termination.id_employee);

        this.terminationForm.patchValue({
            id_employee: termination.id_employee,
            last_work_day: termination.last_work_day,
            reason: termination.reason,
            severance_date: termination.severance_date,
            observation: termination.observation,
            document_path: termination.document_path,
            document_paths: termination.document_paths || []
        });
        this.showModal();
    }

    showModal(): void {
        const modalElement = document.getElementById('terminationModal');
        if (modalElement) {
            this.formModal = new bootstrap.Modal(modalElement);
            this.formModal.show();
        }
    }

    hideModal(): void {
        if (this.formModal) {
            this.formModal.hide();
        }
    }

    saveTermination(): void {
        if (this.terminationForm.invalid) {
            return;
        }

        const formData = this.terminationForm.value;

        const processSave = (data: any) => {
            if (this.isEditMode && this.selectedTerminationId) {
                this.terminationsService.updateTermination(this.selectedTerminationId, data).subscribe({
                    next: () => {
                        this.loadTerminations();
                        this.hideModal();
                        this.zone.run(() => {
                            this.toastr.success('Baja actualizada correctamente', 'Éxito');
                        });
                    },
                    error: (err: any) => {
                        console.error('Error updating termination', err);
                        this.zone.run(() => {
                            this.toastr.error('Error al actualizar la baja', 'Error');
                        });
                    }
                });
            } else {
                this.terminationsService.createTermination(data).subscribe({
                    next: () => {
                        this.loadTerminations();
                        this.hideModal();
                        this.zone.run(() => {
                            this.toastr.success('Baja registrada correctamente', 'Éxito');
                        });
                    },
                    error: (err: any) => {
                        console.error('Error creating termination', err);
                        this.zone.run(() => {
                            this.toastr.error('Error al registrar la baja', 'Error');
                        });
                    }
                });
            }
        };

        if (!this.isEditMode && this.newTerminationFiles.length > 0) {
            this.uploadService.uploadFiles(this.newTerminationFiles).subscribe({
                next: (res) => {
                    formData.document_paths = res.paths;
                    formData.document_path = res.paths[0];
                    processSave(formData);
                },
                error: () => {
                    this.toastr.error('Error al subir los documentos. Guardando sin archivos...', 'Advertencia');
                    processSave(formData);
                }
            });
        } else {
            processSave(formData);
        }
    }

    deleteTermination(id: number): void {
        if (confirm('¿Estás seguro de eliminar esta baja? Esta acción también eliminará el evento de relaciones laborales.')) {
            this.terminationsService.deleteTermination(id).subscribe({
                next: () => {
                    this.loadTerminations();
                    this.zone.run(() => {
                        this.toastr.success('Baja eliminada correctamente', 'Éxito');
                    });
                },
                error: (err: any) => {
                    console.error('Error deleting termination', err);
                    this.zone.run(() => {
                        this.toastr.error('Error al eliminar la baja', 'Error');
                    });
                }
            });
        }
    }

    // ── Modal de vista ──────────────────────────────────────────────

    viewTermination(termination: Termination): void {
        // Normalizar: consolidar document_path legacy + document_paths en un solo array
        const hasPaths = termination.document_paths && termination.document_paths.length > 0;
        const paths = hasPaths
            ? [...termination.document_paths!]
            : termination.document_path ? [termination.document_path] : [];

        this.selectedTermination = { ...termination, document_paths: paths, document_path: paths[0] || '' };
        this.docsFilesToAdd = [];
        const modalElement = document.getElementById('viewTerminationModal');
        if (modalElement) {
            this.viewModal = new bootstrap.Modal(modalElement);
            this.viewModal.show();
        }
    }

    hideViewModal(): void {
        if (this.viewModal) {
            this.viewModal.hide();
        }
    }

    onNewTerminationFilesSelected(event: any): void {
        if (event.target.files && event.target.files.length > 0) {
            this.newTerminationFiles = [...this.newTerminationFiles, ...Array.from<File>(event.target.files)];
            event.target.value = '';
        }
    }

    removeNewTerminationFile(index: number): void {
        this.newTerminationFiles = this.newTerminationFiles.filter((_, i) => i !== index);
    }

    onDocsFileSelected(event: any): void {
        if (event.target.files && event.target.files.length > 0) {
            this.docsFilesToAdd = [...this.docsFilesToAdd, ...Array.from<File>(event.target.files)];
            event.target.value = '';
        }
    }

    removeDocToAdd(index: number): void {
        this.docsFilesToAdd = this.docsFilesToAdd.filter((_, i) => i !== index);
    }

    removeExistingDoc(index: number): void {
        if (!this.selectedTermination) return;
        const updated = this.selectedTermination.document_paths!.filter((_, i) => i !== index);
        this.selectedTermination = { ...this.selectedTermination, document_paths: updated };
    }

    saveDocChanges(): void {
        if (!this.selectedTermination || !this.selectedTermination.id) return;

        const existingPaths = this.selectedTermination.document_paths || [];

        const applyUpdate = (finalPaths: string[]) => {
            const updatedData: Partial<Termination> = {
                document_paths: finalPaths,
                document_path: finalPaths[0] || ''
            };

            this.isUploadingDocs = true;
            this.terminationsService.updateTermination(this.selectedTermination!.id!, updatedData as Termination).subscribe({
                next: () => {
                    this.isUploadingDocs = false;
                    this.loadTerminations();
                    // Actualizar selectedTermination localmente para que el modal refleje cambios
                    this.selectedTermination = { ...this.selectedTermination!, document_paths: finalPaths, document_path: finalPaths[0] || '' };
                    this.docsFilesToAdd = [];
                    this.zone.run(() => {
                        this.toastr.success('Documentos actualizados correctamente', 'Éxito');
                    });
                },
                error: (err: any) => {
                    this.isUploadingDocs = false;
                    console.error('Error updating documents', err);
                    this.zone.run(() => {
                        this.toastr.error('Error al actualizar documentos', 'Error');
                    });
                }
            });
        };

        if (this.docsFilesToAdd.length > 0) {
            this.isUploadingDocs = true;
            this.uploadService.uploadFiles(this.docsFilesToAdd).subscribe({
                next: (res) => {
                    this.isUploadingDocs = false;
                    const finalPaths = [...existingPaths, ...res.paths];
                    applyUpdate(finalPaths);
                },
                error: (err) => {
                    this.isUploadingDocs = false;
                    console.error('Error uploading files', err);
                    this.zone.run(() => {
                        this.toastr.error('Error al subir los archivos', 'Error');
                    });
                }
            });
        } else {
            applyUpdate(existingPaths);
        }
    }
}

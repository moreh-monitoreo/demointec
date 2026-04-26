import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { EmployeesAdapterService } from '../../adapters/employees.adapter';
import { EmployeeDocumentsAdapterService, EmployeeDocument } from '../../adapters/employee-documents.adapter';
import { Employee } from '../../models/employees';
import { PermissionsService } from '../../services/permissions.service';

interface DocumentRow {
    name: string;
    uploaded: boolean;
    path?: string;
    date?: string;
    id?: number;
}

@Component({
    selector: 'app-document-repository',
    templateUrl: './document-repository.component.html',
    styleUrl: './document-repository.component.css',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class DocumentRepositoryComponent implements OnInit {
    // Search
    searchForm: FormGroup;
    employees: Employee[] = [];
    filteredEmployees: Employee[] = [];
    selectedEmployee: Employee | null = null;
    selectedIndex: number = -1;

    // Documents
    // List from user request
    readonly DOCUMENT_TYPES = [
        "REGLAMENTO INTERIOR",
        "CONTRATO",
        "CONSTANCIA DE BAJA"
    ];

    documentsList: DocumentRow[] = [];
    selectedDocTypeForUpload: string | null = null;
    customDocName: string = '';
    customDocFile: File | null = null;
    @ViewChild('customFileInput') customFileInput: any;
    canDelete: boolean = false;
    requiredExpanded: boolean = true;
    additionalExpanded: boolean = false;

    get requiredDocs(): DocumentRow[] {
        return this.documentsList.filter(d => this.DOCUMENT_TYPES.includes(d.name));
    }

    get additionalDocs(): DocumentRow[] {
        return this.documentsList.filter(d => !this.DOCUMENT_TYPES.includes(d.name));
    }

    constructor(
        private fb: FormBuilder,
        private employeesService: EmployeesAdapterService,
        private docService: EmployeeDocumentsAdapterService,
        private toastr: ToastrService,
        private permissionsService: PermissionsService
    ) {
        this.searchForm = this.fb.group({
            searchTerm: ['']
        });
    }

    ngOnInit(): void {
        this.canDelete = !this.permissionsService.hasPermissionsConfigured() || this.permissionsService.canAccessRoute('/dashboard/repositorio-documental');
        this.loadEmployees();
        this.searchForm.get('searchTerm')?.valueChanges.subscribe(val => this.filterEmployees(val));
        this.resetDocumentsList();
    }

    resetDocumentsList() {
        this.documentsList = this.DOCUMENT_TYPES.map(type => ({
            name: type,
            uploaded: false
        }));
    }

    // --- Employee Search Logic (Same as Labor Relations) ---
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
        this.selectedIndex = -1;
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
            event.preventDefault();
            this.selectedIndex = (this.selectedIndex + 1) % this.filteredEmployees.length;
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            this.selectedIndex = (this.selectedIndex - 1 + this.filteredEmployees.length) % this.filteredEmployees.length;
        } else if (event.key === 'Enter') {
            event.preventDefault();
            if (this.selectedIndex >= 0 && this.selectedIndex < this.filteredEmployees.length) {
                this.selectEmployee(this.filteredEmployees[this.selectedIndex]);
            } else {
                this.selectEmployee(this.filteredEmployees[0]);
            }
        }
    }

    clearSearch() {
        this.searchForm.patchValue({ searchTerm: '' });
        this.selectedEmployee = null;
        this.filteredEmployees = [];
        this.selectedIndex = -1;
        this.resetDocumentsList();
    }

    selectEmployee(employee: Employee) {
        this.selectedEmployee = employee;
        this.filteredEmployees = [];
        this.selectedIndex = -1;
        this.searchForm.patchValue({ searchTerm: employee.name_employee }, { emitEvent: false });
        this.loadEmployeeDocuments();
    }

    // --- Document Logic ---

    loadEmployeeDocuments() {
        if (!this.selectedEmployee) return;
        this.docService.getDocuments(this.selectedEmployee.id_employee).subscribe({
            next: (docs) => {
                // 1. Start with default list
                const mergedList: DocumentRow[] = this.DOCUMENT_TYPES.map(type => ({
                    name: type,
                    uploaded: false
                }));

                // 2. Mark uploaded ones and find extra custom docs
                const customDocs: DocumentRow[] = [];

                docs.forEach(d => {
                    const defaultIndex = mergedList.findIndex(item => item.name === d.document_type);
                    if (defaultIndex !== -1) {
                        mergedList[defaultIndex].uploaded = true;
                        mergedList[defaultIndex].path = d.document_path;
                        mergedList[defaultIndex].date = d.upload_date;
                        mergedList[defaultIndex].id = d.id;
                    } else {
                        // This is a custom doc not in the default list
                        customDocs.push({
                            name: d.document_type,
                            uploaded: true,
                            path: d.document_path,
                            date: d.upload_date,
                            id: d.id
                        });
                    }
                });

                // 3. Combine
                this.documentsList = [...mergedList, ...customDocs];
            },
            error: () => this.toastr.error('Error al cargar documentos')
        });
    }

    onCustomFileSelected(event: any) {
        this.customDocFile = event.target.files[0] || null;
    }

    addCustomDocument() {
        if (!this.selectedEmployee) {
            this.toastr.warning('Seleccione un empleado primero');
            return;
        }

        if (!this.customDocName.trim()) {
            this.toastr.warning('Debes ingresar un nombre para el documento');
            return;
        }

        if (!this.customDocFile) {
            this.toastr.warning('Debes seleccionar un archivo para agregar el documento');
            return;
        }

        // Check if already exists in list
        if (this.documentsList.some(d => d.name.toLowerCase() === this.customDocName.trim().toLowerCase())) {
            this.toastr.warning('Este documento ya existe en la lista');
            return;
        }

        // Upload immediately
        this.uploadFile(this.customDocFile, this.customDocName.trim());

        // Reset inputs
        this.customDocName = '';
        this.customDocFile = null;
        if (this.customFileInput) {
            this.customFileInput.nativeElement.value = '';
        }
    }

    // Trigger file input
    initiateUpload(docType: string) {
        if (!this.selectedEmployee) {
            this.toastr.warning('Seleccione un empleado primero');
            return;
        }
        this.selectedDocTypeForUpload = docType;
        const fileInput = document.getElementById('docFileInput') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = ''; // Reset
            fileInput.click();
        }
    }

    onFileSelected(event: any) {
        const file: File = event.target.files[0];
        if (file && this.selectedDocTypeForUpload && this.selectedEmployee) {
            this.uploadFile(file, this.selectedDocTypeForUpload);
        }
    }

    uploadFile(file: File, type: string) {
        const formData = new FormData();
        formData.append('id_employee', this.selectedEmployee!.id_employee);
        formData.append('document_type', type);
        formData.append('document', file);

        this.toastr.info('Subiendo documento...');

        this.docService.saveDocument(formData).subscribe({
            next: (res) => {
                this.toastr.success(`Documento "${type}" subido correctamente`);
                this.loadEmployeeDocuments(); // Refresh list to show green check
            },
            error: (err) => {
                console.error(err);
                this.toastr.error('Error al subir documento');
            }
        });
    }

    deleteDocument(doc: DocumentRow) {
        if (!doc.uploaded || !doc.id) return;

        if (confirm(`¿Está seguro que desea eliminar el documento "${doc.name}"?`)) {
            this.docService.deleteDocument(doc.id).subscribe({
                next: () => {
                    this.toastr.success(`Documento "${doc.name}" eliminado`);
                    this.loadEmployeeDocuments();
                },
                error: (err) => {
                    console.error(err);
                    this.toastr.error('Error al eliminar documento');
                }
            });
        }
    }
}

import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { TrainingInstructionAdapterService } from '../../adapters/training-instruction.adapter';
import { ErrorService } from '../../services/errror.services';
import { TrainingInstruction } from '../../models/training-instruction';
import { TrainingInstructionFolder } from '../../models/training-instruction-folder';

interface InstructionSection {
  folderId: number;
  key: string;
  label: string;
  folderPath: string;
  expanded: boolean;
  documents: TrainingInstruction[];
  filteredDocuments: TrainingInstruction[];
  isLoading: boolean;
  loaded: boolean;
}

@Component({
  selector: 'app-training-instructions',
  templateUrl: './training-instructions.component.html',
  styleUrl: './training-instructions.component.css',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule]
})
export class TrainingInstructionsComponent {
  private trainingAdapter = inject(TrainingInstructionAdapterService);
  private toastr = inject(ToastrService);
  private errorService = inject(ErrorService);
  private destroyRef = inject(DestroyRef);

  searchTerm: string = '';
  sections: InstructionSection[] = [];
  isLoadingSections: boolean = false;

  showUploadModal: boolean = false;
  uploadSection: InstructionSection | null = null;
  selectedFile: File | null = null;
  isUploading: boolean = false;

  showFolderModal: boolean = false;
  newFolderName: string = '';
  isCreatingFolder: boolean = false;

  ngOnInit(): void {
    this.loadSections();
  }

  loadSections(): void {
    this.isLoadingSections = true;
    this.trainingAdapter.getFolders()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (folders: TrainingInstructionFolder[]) => {
          this.sections = folders.map(f => ({
            folderId: f.id!,
            key: f.folder_name,
            label: f.folder_name,
            folderPath: f.folder_path,
            expanded: false,
            documents: [],
            filteredDocuments: [],
            isLoading: false,
            loaded: false
          }));
          this.isLoadingSections = false;
        },
        error: (e: HttpErrorResponse) => {
          this.errorService.handleError(e);
          this.isLoadingSections = false;
        }
      });
  }

  onSearchInput(): void {
    const term = this.searchTerm.toLowerCase().trim();
    for (const section of this.sections) {
      if (section.loaded) {
        section.filteredDocuments = term.length === 0
          ? [...section.documents]
          : section.documents.filter(d =>
              (d.name_document || '').toLowerCase().includes(term)
            );
      }
    }
  }

  toggleSection(section: InstructionSection): void {
    section.expanded = !section.expanded;
    if (section.expanded && !section.loaded) {
      this.loadDocuments(section);
    }
  }

  loadDocuments(section: InstructionSection): void {
    section.isLoading = true;
    this.trainingAdapter.getDocumentsByType(section.key)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (docs) => {
          section.documents = docs;
          this.applyFilter(section);
          section.isLoading = false;
          section.loaded = true;
        },
        error: (e: HttpErrorResponse) => {
          this.errorService.handleError(e);
          section.isLoading = false;
        }
      });
  }

  private applyFilter(section: InstructionSection): void {
    const term = this.searchTerm.toLowerCase().trim();
    section.filteredDocuments = term.length === 0
      ? [...section.documents]
      : section.documents.filter(d =>
          (d.name_document || '').toLowerCase().includes(term)
        );
  }

  openUploadModal(section: InstructionSection): void {
    this.uploadSection = section;
    this.selectedFile = null;
    this.showUploadModal = true;
  }

  closeUploadModal(): void {
    this.showUploadModal = false;
    this.uploadSection = null;
    this.selectedFile = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  uploadDocument(): void {
    if (!this.selectedFile || !this.uploadSection) return;

    this.isUploading = true;
    const formData = new FormData();
    formData.append('document', this.selectedFile);
    formData.append('document_type', this.uploadSection.key);

    this.trainingAdapter.saveDocument(formData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastr.success('Documento subido correctamente', 'Éxito');
          this.isUploading = false;
          const section = this.uploadSection!;
          this.closeUploadModal();
          section.loaded = false;
          this.loadDocuments(section);
        },
        error: (e: HttpErrorResponse) => {
          this.errorService.handleError(e);
          this.isUploading = false;
        }
      });
  }

  viewDocument(doc: TrainingInstruction): void {
    if (doc.document_path) {
      window.open(doc.document_path, '_blank');
    }
  }

  downloadDocument(doc: TrainingInstruction): void {
    if (!doc.document_path) return;

    const fileName = doc.name_document || 'documento';

    this.trainingAdapter.downloadDocument(doc.document_path)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: () => {
          this.toastr.error('No se pudo descargar el documento', 'Error');
        }
      });
  }

  deleteDocument(doc: TrainingInstruction, section: InstructionSection): void {
    if (!doc.id) return;
    if (!confirm('¿Está seguro de eliminar este documento?')) return;

    this.trainingAdapter.deleteDocument(doc.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastr.success('Documento eliminado correctamente', 'Éxito');
          section.loaded = false;
          this.loadDocuments(section);
        },
        error: (e: HttpErrorResponse) => {
          this.errorService.handleError(e);
        }
      });
  }

  openFolderModal(): void {
    this.newFolderName = '';
    this.showFolderModal = true;
  }

  closeFolderModal(): void {
    this.showFolderModal = false;
    this.newFolderName = '';
  }

  createFolder(): void {
    const name = this.newFolderName.trim();
    if (!name) return;

    const alreadyExists = this.sections.some(s => s.key.toLowerCase() === name.toLowerCase());
    if (alreadyExists) {
      this.toastr.warning('Ya existe una carpeta con ese nombre', 'Atención');
      return;
    }

    this.isCreatingFolder = true;
    this.trainingAdapter.createFolder(name)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.sections.push({
            folderId: res.folder.id!,
            key: res.folder.folder_name,
            label: res.folder.folder_name,
            folderPath: res.folder.folder_path,
            expanded: false,
            documents: [],
            filteredDocuments: [],
            isLoading: false,
            loaded: false
          });
          this.toastr.success('Carpeta creada correctamente', 'Éxito');
          this.isCreatingFolder = false;
          this.closeFolderModal();
        },
        error: (e: HttpErrorResponse) => {
          this.errorService.handleError(e);
          this.isCreatingFolder = false;
        }
      });
  }
}

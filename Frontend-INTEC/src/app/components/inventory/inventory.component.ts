import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InventoryAdapterService } from '../../adapters/inventory.adapter';
import { InventoryExtintorAdapterService } from '../../adapters/inventory-extintor.adapter';
import { InventoryUniformAdapterService } from '../../adapters/inventory-uniform.adapter';
import { InventoryCategoryAdapterService } from '../../adapters/inventory-category.adapter';
import { Inventory } from '../../models/inventory';
import { InventoryExtintor } from '../../models/inventory-extintor';
import { InventoryUniform } from '../../models/inventory-uniform';
import { InventoryCategory } from '../../models/inventory-category';
import { InventoryAssignmentComponent } from '../inventory-assignment/inventory-assignment.component';
import { InventoryMovementComponent } from '../inventory-movement/inventory-movement.component';
import { ReportInventoryService } from '../../services/report-inventory.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule, InventoryAssignmentComponent, InventoryMovementComponent]
})
export class InventoryComponent implements OnInit {
  inventoryForm: FormGroup;
  extintorForm: FormGroup;
  uniformForm: FormGroup;
  isEditMode: boolean = false;
  selectedItem: Inventory | null = null;
  selectedExtintor: InventoryExtintor | null = null;
  selectedUniform: InventoryUniform | null = null;
  items: Inventory[] = [];
  allItems: Inventory[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  pages: number[] = [];
  maxPagesToShow: number = 5;
  searchTerm: string = '';
  selectedStatus: string = '';
  selectedCategory: string = '';
  filteredItems: Inventory[] = [];
  hasConsulted: boolean = false;
  isLoading: boolean = false;

  categoryOptions: string[] = [];
  newCategoryName: string = '';
  isSavingCategory: boolean = false;
  unitOptions = ['Pieza', 'Caja', 'Rollo', 'Metro', 'Kilogramo', 'Litro', 'Par', 'Juego'];
  stateOptions = ['Nuevo', 'Bueno', 'Regular', 'Deteriorado', 'Dado de baja'];
  extintorTypeOptions = ['PQS', 'CO2', 'Agua', 'Espuma', 'Halón'];
  genderOptions = ['Masculino', 'Femenino', 'Unisex'];

  private inventoryAdapter = inject(InventoryAdapterService);
  private extintorAdapter = inject(InventoryExtintorAdapterService);
  private uniformAdapter = inject(InventoryUniformAdapterService);
  private categoryAdapter = inject(InventoryCategoryAdapterService);
  private reportService = inject(ReportInventoryService);

  constructor(private fb: FormBuilder) {
    this.inventoryForm = this.fb.group({
      name_inventory: ['', Validators.required],
      description: [''],
      category: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0)]],
      unit: ['', Validators.required],
      location: ['', Validators.required],
      state: [''],
      purchase_date: [''],
      supplier: [''],
      unit_cost: [0, Validators.min(0)],
      responsible: [''],
      minimum_stock: [0, Validators.min(0)],
      maximum_stock: [0, Validators.min(0)],
      observations: [''],
      status: [true]
    });

    this.extintorForm = this.fb.group({
      extintor_type: ['', Validators.required],
      capacity: ['', Validators.required],
      serial_number: ['', Validators.required],
      exact_location: ['', Validators.required],
      recharge_date: [''],
      expiration_date: [''],
      last_inspection: [''],
      next_inspection: ['']
    });

    this.uniformForm = this.fb.group({
      size: ['', Validators.required],
      gender: ['', Validators.required],
      department: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryAdapter.getList().subscribe({
      next: (data: InventoryCategory[]) => {
        this.categoryOptions = data.map(c => c.name_category);
      },
      error: () => {}
    });
  }

  saveCategory(): void {
    const name = this.newCategoryName.trim();
    if (!name) return;
    this.isSavingCategory = true;
    this.categoryAdapter.post({ name_category: name, status: true }).subscribe({
      next: () => {
        this.newCategoryName = '';
        this.isSavingCategory = false;
        this.closeModal('nuevaCategoriaModal');
        this.loadCategories();
      },
      error: () => {
        this.isSavingCategory = false;
      }
    });
  }

  get selectedCategory_create(): string {
    return this.inventoryForm.get('category')?.value ?? '';
  }

  get isExtintor(): boolean {
    return this.selectedCategory_create === 'Extintores';
  }

  get isUniform(): boolean {
    return this.selectedCategory_create === 'Uniformes';
  }

  setCreateMode(): void {
    this.isEditMode = false;
    this.selectedItem = null;
    this.inventoryForm.reset({ status: true, quantity: 0, unit_cost: 0, minimum_stock: 0, maximum_stock: 0 });
    this.extintorForm.reset();
    this.uniformForm.reset();
  }

  consultItems(): void {
    this.isLoading = true;
    this.hasConsulted = true;
    this.inventoryAdapter.getList().subscribe({
      next: (data: Inventory[]) => {
        this.allItems = data;
        this.filteredItems = [...data];
        this.updatePagination();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedCategory = '';
    this.filteredItems = [...this.allItems];
    this.currentPage = 1;
    this.updatePagination();
  }

  applyFilters(): void {
    let filtered = [...this.allItems];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(i =>
        i.name_inventory.toLowerCase().includes(term) ||
        i.location.toLowerCase().includes(term) ||
        i.supplier?.toLowerCase().includes(term) ||
        i.responsible?.toLowerCase().includes(term)
      );
    }
    if (this.selectedStatus !== '') {
      const active = this.selectedStatus === 'true';
      filtered = filtered.filter(i => i.status === active);
    }
    if (this.selectedCategory) {
      filtered = filtered.filter(i => i.category === this.selectedCategory);
    }
    this.filteredItems = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.selectedStatus || this.selectedCategory);
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredItems.length / this.itemsPerPage);
    this.pages = Array.from({ length: Math.min(this.maxPagesToShow, this.totalPages) }, (_, i) => i + 1);
    this.items = this.filteredItems.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }

  setPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.items = this.filteredItems.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  saveItem(): void {
    if (this.inventoryForm.invalid) {
      this.inventoryForm.markAllAsTouched();
      return;
    }
    if (this.isExtintor && this.extintorForm.invalid) {
      this.extintorForm.markAllAsTouched();
      return;
    }
    if (this.isUniform && this.uniformForm.invalid) {
      this.uniformForm.markAllAsTouched();
      return;
    }

    const id_inventory = this.generateUUID();
    const inventoryData: Inventory = { ...this.inventoryForm.value, id_inventory };

    this.inventoryAdapter.post(inventoryData).subscribe({
      next: () => {
        if (this.isExtintor) {
          const extintorData: InventoryExtintor = { ...this.extintorForm.value, id_inventory };
          this.extintorAdapter.post(extintorData).subscribe({
            next: () => {
              this.closeModal('agregarItemModal');
              this.consultItems();
            },
            error: () => {}
          });
        } else if (this.isUniform) {
          const uniformData: InventoryUniform = { ...this.uniformForm.value, id_inventory };
          this.uniformAdapter.post(uniformData).subscribe({
            next: () => {
              this.closeModal('agregarItemModal');
              this.consultItems();
            },
            error: () => {}
          });
        } else {
          this.closeModal('agregarItemModal');
          this.consultItems();
        }
      },
      error: () => {}
    });
  }

  closeModal(modalId: string): void {
    const modal = document.getElementById(modalId);
    if (modal) {
      const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modal);
      if (bootstrapModal) bootstrapModal.hide();
    }
  }

  viewItem(item: Inventory): void {
    this.selectedItem = item;
    this.selectedExtintor = null;
    this.selectedUniform = null;

    if (item.category === 'Extintores' && item.id_inventory) {
      this.extintorAdapter.getList().subscribe({
        next: (list: InventoryExtintor[]) => {
          this.selectedExtintor = list.find(e => e.id_inventory === item.id_inventory) ?? null;
        },
        error: () => {}
      });
    } else if (item.category === 'Uniformes' && item.id_inventory) {
      this.uniformAdapter.getList().subscribe({
        next: (list: InventoryUniform[]) => {
          this.selectedUniform = list.find(u => u.id_inventory === item.id_inventory) ?? null;
        },
        error: () => {}
      });
    }
  }

  editItem(item: Inventory): void {
    this.isEditMode = true;
    this.selectedItem = item;
    this.inventoryForm.patchValue(item);
  }

  updateItem(): void {
    if (this.inventoryForm.invalid || !this.selectedItem?.id_inventory) {
      this.inventoryForm.markAllAsTouched();
      return;
    }
    const data: Inventory = { ...this.inventoryForm.value, id_inventory: this.selectedItem.id_inventory };
    this.inventoryAdapter.put(this.selectedItem.id_inventory, data).subscribe({
      next: () => {
        this.closeModal('editarItemModal');
        this.consultItems();
      },
      error: () => {}
    });
  }

  deleteItem(item: Inventory): void {}

  exportToExcel(): void {
    this.reportService.exportToExcel(this.filteredItems);
  }
}

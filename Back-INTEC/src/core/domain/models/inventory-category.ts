export class InventoryCategory {
  private id_category_inventory: number | undefined;
  private name_category: string | undefined;
  private status: boolean | undefined;

  public get getId(): number | undefined { return this.id_category_inventory; }
  public set setId(id_category_inventory: number | undefined) { this.id_category_inventory = id_category_inventory; }

  public get getNameCategory(): string | undefined { return this.name_category; }
  public set setNameCategory(name_category: string | undefined) { this.name_category = name_category; }

  public get getStatus(): boolean | undefined { return this.status; }
  public set setStatus(status: boolean | undefined) { this.status = status; }
}

export class BondApplication {
  private id_bond: string | undefined;
  private id_employee: string | undefined;
  private employee_name: string | undefined;
  private hire_date: string | undefined;
  private contract_date: string | undefined;
  private bond_amount: number | undefined;
  private payment_date: string | undefined;
  private observations: string | undefined;
  private direct_boss_signature: string | undefined;
  private rh_signature: string | undefined;
  private status: boolean | undefined;

  public get getId(): string | undefined { return this.id_bond; }
  public set setId(v: string | undefined) { this.id_bond = v; }

  public get getIdEmployee(): string | undefined { return this.id_employee; }
  public set setIdEmployee(v: string | undefined) { this.id_employee = v; }

  public get getEmployeeName(): string | undefined { return this.employee_name; }
  public set setEmployeeName(v: string | undefined) { this.employee_name = v; }

  public get getHireDate(): string | undefined { return this.hire_date; }
  public set setHireDate(v: string | undefined) { this.hire_date = v; }

  public get getContractDate(): string | undefined { return this.contract_date; }
  public set setContractDate(v: string | undefined) { this.contract_date = v; }

  public get getBondAmount(): number | undefined { return this.bond_amount; }
  public set setBondAmount(v: number | undefined) { this.bond_amount = v; }

  public get getPaymentDate(): string | undefined { return this.payment_date; }
  public set setPaymentDate(v: string | undefined) { this.payment_date = v; }

  public get getObservations(): string | undefined { return this.observations; }
  public set setObservations(v: string | undefined) { this.observations = v; }

  public get getDirectBossSignature(): string | undefined { return this.direct_boss_signature; }
  public set setDirectBossSignature(v: string | undefined) { this.direct_boss_signature = v; }

  public get getRhSignature(): string | undefined { return this.rh_signature; }
  public set setRhSignature(v: string | undefined) { this.rh_signature = v; }

  public get getStatus(): boolean | undefined { return this.status; }
  public set setStatus(v: boolean | undefined) { this.status = v; }
}

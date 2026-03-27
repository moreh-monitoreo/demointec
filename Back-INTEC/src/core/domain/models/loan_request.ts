export class LoanRequest {
  private id_loan: string | undefined;
  private id_employee: string | undefined;
  private operative_owner: string | undefined;
  private executive_owner: string | undefined;
  private approval_date: string | undefined;
  private effective_date: string | undefined;
  private employee_name: string | undefined;
  private position: string | undefined;
  private hire_date: string | undefined;
  private requested_amount: number | undefined;
  private authorized_amount: number | undefined;
  private loan_reason: string | undefined;
  private payment_method: string | undefined;
  private payment_count: number | undefined;
  private first_payment_date: string | undefined;
  private status: boolean | undefined;

  public get getId(): string | undefined { return this.id_loan; }
  public set setId(v: string | undefined) { this.id_loan = v; }

  public get getIdEmployee(): string | undefined { return this.id_employee; }
  public set setIdEmployee(v: string | undefined) { this.id_employee = v; }

  public get getOperativeOwner(): string | undefined { return this.operative_owner; }
  public set setOperativeOwner(v: string | undefined) { this.operative_owner = v; }

  public get getExecutiveOwner(): string | undefined { return this.executive_owner; }
  public set setExecutiveOwner(v: string | undefined) { this.executive_owner = v; }

  public get getApprovalDate(): string | undefined { return this.approval_date; }
  public set setApprovalDate(v: string | undefined) { this.approval_date = v; }

  public get getEffectiveDate(): string | undefined { return this.effective_date; }
  public set setEffectiveDate(v: string | undefined) { this.effective_date = v; }

  public get getEmployeeName(): string | undefined { return this.employee_name; }
  public set setEmployeeName(v: string | undefined) { this.employee_name = v; }

  public get getPosition(): string | undefined { return this.position; }
  public set setPosition(v: string | undefined) { this.position = v; }

  public get getHireDate(): string | undefined { return this.hire_date; }
  public set setHireDate(v: string | undefined) { this.hire_date = v; }

  public get getRequestedAmount(): number | undefined { return this.requested_amount; }
  public set setRequestedAmount(v: number | undefined) { this.requested_amount = v; }

  public get getAuthorizedAmount(): number | undefined { return this.authorized_amount; }
  public set setAuthorizedAmount(v: number | undefined) { this.authorized_amount = v; }

  public get getLoanReason(): string | undefined { return this.loan_reason; }
  public set setLoanReason(v: string | undefined) { this.loan_reason = v; }

  public get getPaymentMethod(): string | undefined { return this.payment_method; }
  public set setPaymentMethod(v: string | undefined) { this.payment_method = v; }

  public get getPaymentCount(): number | undefined { return this.payment_count; }
  public set setPaymentCount(v: number | undefined) { this.payment_count = v; }

  public get getFirstPaymentDate(): string | undefined { return this.first_payment_date; }
  public set setFirstPaymentDate(v: string | undefined) { this.first_payment_date = v; }

  public get getStatus(): boolean | undefined { return this.status; }
  public set setStatus(v: boolean | undefined) { this.status = v; }
}

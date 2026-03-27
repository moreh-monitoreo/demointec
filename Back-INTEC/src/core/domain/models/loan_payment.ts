export class LoanPayment {
  private id_payment: string | undefined;
  private id_loan: string | undefined;
  private payment_date: string | undefined;
  private payment_amount: number | undefined;
  private paid: boolean | undefined;
  private status: boolean | undefined;

  public get getId(): string | undefined { return this.id_payment; }
  public set setId(v: string | undefined) { this.id_payment = v; }

  public get getIdLoan(): string | undefined { return this.id_loan; }
  public set setIdLoan(v: string | undefined) { this.id_loan = v; }

  public get getPaymentDate(): string | undefined { return this.payment_date; }
  public set setPaymentDate(v: string | undefined) { this.payment_date = v; }

  public get getPaymentAmount(): number | undefined { return this.payment_amount; }
  public set setPaymentAmount(v: number | undefined) { this.payment_amount = v; }

  public get getPaid(): boolean | undefined { return this.paid; }
  public set setPaid(v: boolean | undefined) { this.paid = v; }

  public get getStatus(): boolean | undefined { return this.status; }
  public set setStatus(v: boolean | undefined) { this.status = v; }
}

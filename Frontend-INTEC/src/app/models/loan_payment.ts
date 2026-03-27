export interface LoanPayment {
  id?: number;
  id_payment: string;
  id_loan: string;
  payment_date: string;
  payment_amount: number;
  paid: boolean;
  status?: boolean;
}

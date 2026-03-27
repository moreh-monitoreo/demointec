export interface LoanRequest {
  id?: number;
  id_loan: string;
  id_employee: string;
  operative_owner: string;
  executive_owner: string;
  approval_date: string;
  effective_date: string;
  employee_name: string;
  position: string;
  hire_date: string;
  requested_amount: number;
  authorized_amount: number;
  loan_reason: string;
  payment_method: string;
  payment_count: number;
  first_payment_date: string;
  status?: boolean;
}

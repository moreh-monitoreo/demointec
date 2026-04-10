export interface BondRecommendation {
  id?: number;
  id_bond_rec: string;
  id_employee: string;
  employee_name: string;
  hire_date: string;
  recommended_person: string;
  contract_date: string;
  bond_amount: number;
  payment_date: string;
  observations: string;
  direct_boss_signature: string;
  rh_signature: string;
  status?: boolean;
}

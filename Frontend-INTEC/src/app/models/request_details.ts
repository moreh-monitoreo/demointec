export interface RequestDetails {
  id?: number;
  id_detail: string;
  temp_id?: string; // ID único temporal para identificar cada detalle en la lista local
  name: string;
  amount: number;
  code: string;
  c1: string;
  c2: string;
  unit_cost: number;
  description: string;
  observation: string;
  folio_request: string;
  category1: string;
  category: string;
  subcategory: string;
  unit: string;
  supplied?: boolean;
  status: boolean;
} 
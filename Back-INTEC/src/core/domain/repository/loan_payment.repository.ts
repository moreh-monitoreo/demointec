export type Query = Record<string, any>;

export type Id = string | number;

export interface LoanPaymentRepository<T> {
  create(data: Partial<T> | Partial<T>[], query?: Query): Promise<T | T[]>;
  list(query?: Query): Promise<T[]>;
  get(id: Id, query?: Query): Promise<T>;
  getByLoan(id_loan: string, query?: Query): Promise<T[]>;
  remove(id: Id, query?: Query): Promise<T>;
  update(data: Partial<T> | Partial<T>[], query?: Query): Promise<T | T[]>;
}

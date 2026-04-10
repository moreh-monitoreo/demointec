export type Query = Record<string, any>;

export type Id = string | number;

export interface BondRecommendationRepository<T> {
  create(data: Partial<T> | Partial<T>[], query?: Query): Promise<T | T[]>;
  list(query?: Query): Promise<T[]>;
  get(id: Id, query?: Query): Promise<T>;
  remove(id: Id, query?: Query): Promise<T>;
  update(data: Partial<T> | Partial<T>[], query?: Query): Promise<T | T[]>;
}

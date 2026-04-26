export interface BaseData {
  id: string;
  createdAt: string;
  modifiedAt?: string | null;
  removedAt?: string | null;
}

export type Entity = BaseData;

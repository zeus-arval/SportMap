import { BaseData } from './base';

export interface IPost extends BaseData {
  title: string;
  content: string;
  status: number;
  authorId: string | null;
  createdAt: string;
  placeId: string | null;
}

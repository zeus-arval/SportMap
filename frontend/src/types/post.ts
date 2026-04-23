import { BaseData } from './base';

export interface PostDto extends BaseData {
  title: string;
  content: string;
  status: string;
  placeId: string;
}

import {IBaseModel} from "@/model/baseModel";

export interface IPost extends IBaseModel{
  title: string;
  content: string;
  status: number;
  authorId: string | null;
  createdAt: string;
}
import { BaseService } from './base.service';
import type { IPost } from '@/types/post';
import { ResultOf } from '@/lib/result';

export class FeedService extends BaseService<IPost> {
  protected readonly endpoint = 'feed';

  constructor() {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    super(baseUrl);
  }

  async getAllPosts(): Promise<ResultOf<IPost[]>> {
    try {
      const url = `${this.url}`;
      const response = await fetch(url);

      if (response.status === 404){
        return ResultOf.withValue([]);
      }

      if (!response.ok) {
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      }
      return ResultOf.withValue((await response.json()) as IPost[]);
    } catch (error) {
      return ResultOf.withError<IPost[]>(
        error instanceof Error ? error : new Error(String(error)),
      )
    }
  }

  async getPostsByUserId(userId: string): Promise<ResultOf<IPost[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/profile/${userId}/posts`);
      if (response.status === 404) return ResultOf.withValue([]);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return ResultOf.withValue((await response.json()) as IPost[]);
    } catch (error) {
      return ResultOf.withError(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  async getByPlaceId(placeId: string): Promise<ResultOf<IPost[]>> {
    try {
      const url = `${this.url}?placeId=${placeId}`;
      const response = await fetch(url);
      
      if (response.status === 404) {
        return ResultOf.withValue([]);
      }

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      
      return ResultOf.withValue((await response.json()) as IPost[]);
    } catch (error) {
      return ResultOf.withError<IPost[]>(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  async getLatestUpdate(placeId: string): Promise<ResultOf<string | null>> {
    try {
      const url = `${this.url}/latest-update?placeId=${placeId}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      return ResultOf.withValue(await response.json());
    } catch (error) {
      return ResultOf.withError<string | null>(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }
}

export const feedService = new FeedService();

import { BaseService } from './base.service';
import type { PostDto } from '@/types/post';
import { ResultOf } from '@/lib/result';

export class FeedService extends BaseService<PostDto> {
  protected readonly endpoint = 'feed';

  constructor() {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    super(baseUrl);
  }

  async getByPlaceId(placeId: string): Promise<ResultOf<PostDto[]>> {
    try {
      const url = `${this.url}?placeId=${placeId}`;
      const response = await fetch(url);
      
      if (response.status === 404) {
        return ResultOf.withValue([]);
      }

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      
      return ResultOf.withValue((await response.json()) as PostDto[]);
    } catch (error) {
      return ResultOf.withError<PostDto[]>(
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

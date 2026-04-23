import { BaseService } from './base.service';
import type { PlaceDto } from '@/types/place';
export type { PlaceDto } from '@/types/place';

export interface PlaceFilters {
  placeTypeId?: string;
}

export class PlaceService extends BaseService<PlaceDto> {
  protected readonly endpoint = 'places';

  constructor() {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    super(baseUrl);
  }

  async getAll(filters?: PlaceFilters): Promise<ResultOf<PlaceDto[]>> {
    try {
      let url = this.url;
      if (filters?.placeTypeId) {
        url += `?placeTypeId=${filters.placeTypeId}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return ResultOf.withValue((await response.json()) as PlaceDto[]);
    } catch (error) {
      return ResultOf.withError<PlaceDto[]>(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  async search(query: string): Promise<ResultOf<PlaceDto[]>> {
    try {
      const url = `${this.url}/search?q=${encodeURIComponent(query)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return ResultOf.withValue((await response.json()) as PlaceDto[]);
    } catch (error) {
      return ResultOf.withError<PlaceDto[]>(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  async getById(id: string): Promise<ResultOf<PlaceDto>> {
    try {
      const url = `${this.url}/${id}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return ResultOf.withValue((await response.json()) as PlaceDto);
    } catch (error) {
      return ResultOf.withError<PlaceDto>(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }
}

import { ResultOf } from '@/lib/result';
export const placeService = new PlaceService();

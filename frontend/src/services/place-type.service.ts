import { BaseService } from "./base.service";
import type { PlaceTypeDto } from "@/types/place";
export type { PlaceTypeDto } from "@/types/place";
import { ResultOf } from "@/lib/result";

export class PlaceTypeService extends BaseService<PlaceTypeDto> {
  protected readonly endpoint = "place-types";

  async getAll(): Promise<ResultOf<PlaceTypeDto[]>> {
    try {
      const response = await fetch(this.url);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return ResultOf.withValue((await response.json()) as PlaceTypeDto[]);
    } catch (error) {
      return ResultOf.withError<PlaceTypeDto[]>(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }
}

export const placeTypeService = new PlaceTypeService();
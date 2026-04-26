import type { EventData, CreateEventData, EventFilters } from "@/types/event";
import { BaseService } from "./base.service";
import { Result, ResultOf } from "@/lib/result";

class EventService extends BaseService<EventData> {
  protected readonly endpoint = "events";

  async getFiltered(
    filters: EventFilters = {},
    page: number = 1,
    pageSize: number = 20
  ): Promise<ResultOf<EventData[]>> {
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));

      if (filters.lat !== undefined) params.set("lat", String(filters.lat));
      if (filters.lng !== undefined) params.set("lng", String(filters.lng));
      if (filters.radiusKm !== undefined) params.set("radiusKm", String(filters.radiusKm));
      if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.set("dateTo", filters.dateTo);

      const response = await fetch(`${this.url}?${params.toString()}`);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return ResultOf.withValue((await response.json()) as EventData[]);
    } catch (error) {
      return ResultOf.withError<EventData[]>(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  async getByPlaceId(
    placeId: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<ResultOf<EventData[]>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/places/${placeId}/events?page=${page}&pageSize=${pageSize}`
      );
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return ResultOf.withValue((await response.json()) as EventData[]);
    } catch (error) {
      return ResultOf.withError<EventData[]>(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  async create(event: CreateEventData): Promise<ResultOf<EventData>> {
    try {
      const response = await fetch(this.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return ResultOf.withValue((await response.json()) as EventData);
    } catch (error) {
      return ResultOf.withError<EventData>(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  async join(eventId: string): Promise<Result> {
    try {
      const response = await fetch(`${this.url}/${eventId}/join`, {
        method: "POST",
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return Result.withMessage("Joined event successfully");
    } catch (error) {
      return Result.withError(
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  async leave(eventId: string): Promise<Result> {
    try {
      const response = await fetch(`${this.url}/${eventId}/leave`, {
        method: "POST",
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return Result.withMessage("Left event successfully");
    } catch (error) {
      return Result.withError(
        error instanceof Error ? error.message : String(error)
      );
    }
  }
}

export const eventService = new EventService();

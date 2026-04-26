import type { BaseData } from "./base";

export interface EventParticipantData {
  userId: string;
  userName: string;
  joinedAt: string;
}

export interface EventData extends BaseData {
  placeId: string;
  hostUserId: string;
  hostUserName: string;
  title: string;
  description?: string | null;
  startTime: string;
  capacity?: number | null;
  participantCount: number;
  status: string;
  participants?: EventParticipantData[] | null;
}

export interface CreateEventData {
  placeId: string;
  title: string;
  description?: string | null;
  startTime: string;
  capacity?: number | null;
}

export interface EventFilters {
  lat?: number;
  lng?: number;
  radiusKm?: number;
  dateFrom?: string;
  dateTo?: string;
}

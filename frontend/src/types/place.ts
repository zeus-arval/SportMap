export interface PlaceTypeDto {
  id: string;
  name: string;
  description: string;  
  createdAt: string;
}

export interface PlaceDto {
  id: string;
  name: string;
  description: string;
  placeTypeId: string;
  placeType?: PlaceTypeDto;
  latitude: number;
  longitude: number;
  address?: string;
  imageId?: string;
  creatorId: string;
  creatorName: string;
  createdAt: string;
  updatedAt?: string;
  status: string;
  
  // UI-specific / Additional fields
  reviewerId?: string;
}

/** A place that hasn't been created in the DB yet — deferred until event creation. */
export interface PendingPlace {
  pending: true;
  name: string;
  description: string;
  placeTypeId: string;
  latitude: number;
  longitude: number;
  creatorId: string;
  address?: string;
}

/** Either an existing place from the DB or a new place pending creation. */
export type SelectedPlace = PlaceDto | PendingPlace;

export function isPendingPlace(place: SelectedPlace): place is PendingPlace {
  return "pending" in place && place.pending === true;
}
export type Place = PlaceDto;
export type PlaceType = PlaceTypeDto;

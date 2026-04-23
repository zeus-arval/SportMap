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

export type Place = PlaceDto;
export type PlaceType = PlaceTypeDto;

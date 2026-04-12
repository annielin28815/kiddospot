import { Tag } from "./tag";
import { Facility } from "./facility";
import { User } from "./user";
import { Favorite } from "./favorite";

export type PlaceTag = {
  tagId: string;
  placeId: string;
  tag: Tag;
};

export type PlaceFacility = {
  facilityId: string;
  placeId: string;
  facility: Facility;
};

export type Place = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;

  description?: string | null;

  avgRating?: number | null;
  reviewCount: number;

  createdAt: string;

  createdById?: string | null;
  createdBy?: User | null;

  tags: PlaceTag[];
  facilities: PlaceFacility[];
  favorites?: Favorite[];
};
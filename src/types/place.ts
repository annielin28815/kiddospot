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

type DisplayTag =
  | {
      id: string;
      name: string;
    }
  | {
      tagId: string;
      tag: {
        id: string;
        name: string;
      };
    };

type DisplayFacility =
  | {
      id: string;
      name: string;
    }
  | {
      facilityId: string;
      facility: {
        id: string;
        name: string;
      };
    };

type DisplayPlace = Place & {
  sourceType?: "GOV_FAMILY_TOILET" | "GOV_NURSING_ROOM" | "GOV_PARENTING_CENTER";
  sourceLabel?: string;
  tags?: DisplayTag[];
  facilities?: DisplayFacility[];
};

export type PlaceSourceType = "user" | "gov-parenting-center" | "gov-nursing-room" | "gov-family-toilet";

export type PlaceItem = {
  id: string;
  sourceType: PlaceSourceType;
  sourceLabel: string;

  name: string;
  address: string;
  lat: number;
  lng: number;

  description?: string | null;
  phone?: string | null;
  openTime?: string | null;
  note?: string | null;

  tags: { id: string; name: string }[];
  facilities: { id: string; name: string }[];

  isFavorite?: boolean;
  createdById?: string | null;
};
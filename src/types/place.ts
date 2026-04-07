import { Tag } from "./tag";
import { Facility } from "./facility";
import { User } from "./user";
import { Favorite } from "./favorite";

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

  tags: {
    tagId: string;
    tag: Tag;
  }[];

  facilities: {
    facilityId: string;
    facility: Facility;
  }[];

  favorites?: Favorite[];
};
export type Place = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  description?: string;
  avgRating?: number;
  reviewCount?: number;
};
export type RoomRecord = {
  id: number;
  name: string;
  type: string;
  description: string;
  pricePerNight: unknown;
  maxGuests: number;
  amenities: string;
  imageUrl: string | null;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  rating: unknown;
  reviewCount: number;
};

export type RoomSearchResult = {
  id: number;
  name: string;
  type: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  amenities: string[];
  imageUrl?: string | null;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  rating?: number;
  reviewCount?: number;
  numberOfNights: number;
  estimatedSubtotal: number;
};

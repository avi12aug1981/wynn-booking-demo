import {
  Wifi,
  Tv,
  Coffee,
  Refrigerator,
  Sofa,
  UtensilsCrossed,
} from "lucide-react";

export const amenityIcons = {
  WiFi: Wifi,
  "Smart TV": Tv,
  "Coffee Maker": Coffee,
  "Mini Fridge": Refrigerator,
  "Living Room": Sofa,
  "Dining Area": UtensilsCrossed,
} as const;

export type AmenityName = keyof typeof amenityIcons;

export function getAmenityIcon(amenity: string) {
  if (amenity in amenityIcons) {
    return amenityIcons[amenity as AmenityName];
  }

  return undefined;
}

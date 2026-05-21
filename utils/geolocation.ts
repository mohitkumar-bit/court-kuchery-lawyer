import * as Location from "expo-location";
import { Platform } from "react-native";

export type GeoPoint = {
  type: "Point";
  coordinates: [number, number];
};

export type LocationDetails = {
  latitude: number;
  longitude: number;
  address: string;
  district: string;
  state: string;
  location: GeoPoint;
};

export function parseStoredLocation(
  loc?: { type?: string; coordinates?: number[]; latitude?: number; longitude?: number } | null
): GeoPoint | undefined {
  if (!loc) return undefined;
  if (
    loc.type === "Point" &&
    Array.isArray(loc.coordinates) &&
    loc.coordinates.length >= 2
  ) {
    return { type: "Point", coordinates: [loc.coordinates[0], loc.coordinates[1]] };
  }
  if (loc.latitude != null && loc.longitude != null) {
    return { type: "Point", coordinates: [loc.longitude, loc.latitude] };
  }
  return undefined;
}

async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<{ address: string; district: string; state: string }> {
  if (Platform.OS === "web") {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
    );
    const data = await response.json();
    if (data?.address) {
      const addr = data.address;
      return {
        address: data.display_name || "",
        district:
          addr.city_district || addr.district || addr.city || addr.town || "",
        state: addr.state || "",
      };
    }
    return { address: "", district: "", state: "" };
  }

  const results = await Location.reverseGeocodeAsync({ latitude, longitude });
  if (results.length > 0) {
    const addr = results[0];
    const fullAddress = `${addr.name || ""}, ${addr.street || ""}, ${addr.district || ""}, ${addr.city || ""}, ${addr.region || ""}, ${addr.postalCode || ""}, ${addr.country || ""}`
      .replace(/, ,/g, ",")
      .replace(/^, /, "")
      .replace(/, $/, "");
    return {
      address: fullAddress,
      district: addr.district || addr.city || "",
      state: addr.region || "",
    };
  }
  return { address: "", district: "", state: "" };
}

export async function fetchCurrentLocationDetails(): Promise<LocationDetails> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Permission to access location was denied");
  }

  const position = await Location.getCurrentPositionAsync({});
  const { latitude, longitude } = position.coords;
  const { address, district, state } = await reverseGeocode(latitude, longitude);

  return {
    latitude,
    longitude,
    address,
    district,
    state,
    location: {
      type: "Point",
      coordinates: [longitude, latitude],
    },
  };
}

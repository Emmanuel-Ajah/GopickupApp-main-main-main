import { GOOGLE_MAPS_API_KEY } from "../constants/Config";

export interface PlaceSuggestion {
  description: string;
  placeId?: string;
  mainText: string;
  secondaryText: string;
  lat?: number;
  lng?: number;
}

// Well-known fallback landmarks in Nigeria for instant responsive local discovery
const POPULAR_NIGERIAN_PLACES: PlaceSuggestion[] = [
  {
    description: "Wuse 2, Abuja, Federal Capital Territory, Nigeria",
    mainText: "Wuse 2",
    secondaryText: "Abuja, FCT, Nigeria",
    lat: 9.0765,
    lng: 7.4816,
  },
  {
    description: "Asokoro District, Abuja, Federal Capital Territory, Nigeria",
    mainText: "Asokoro District",
    secondaryText: "Abuja, FCT, Nigeria",
    lat: 9.0436,
    lng: 7.5255,
  },
  {
    description: "Maitama District, Abuja, Federal Capital Territory, Nigeria",
    mainText: "Maitama District",
    secondaryText: "Abuja, FCT, Nigeria",
    lat: 9.0882,
    lng: 7.4983,
  },
  {
    description: "Garki 2, Abuja, Federal Capital Territory, Nigeria",
    mainText: "Garki 2",
    secondaryText: "Abuja, FCT, Nigeria",
    lat: 9.0321,
    lng: 7.4912,
  },
  {
    description: "Central Business District, Abuja, Nigeria",
    mainText: "Central Business District",
    secondaryText: "Abuja, FCT, Nigeria",
    lat: 9.0579,
    lng: 7.4951,
  },
  {
    description: "Ikeja, Lagos State, Nigeria",
    mainText: "Ikeja",
    secondaryText: "Lagos State, Nigeria",
    lat: 6.6018,
    lng: 3.3515,
  },
  {
    description: "Victoria Island, Lagos State, Nigeria",
    mainText: "Victoria Island",
    secondaryText: "Lagos State, Nigeria",
    lat: 6.4281,
    lng: 3.4219,
  },
  {
    description: "Lekki Phase 1, Lagos State, Nigeria",
    mainText: "Lekki Phase 1",
    secondaryText: "Lagos State, Nigeria",
    lat: 6.4474,
    lng: 3.4849,
  },
  {
    description: "Nnamdi Azikiwe International Airport, Abuja, Nigeria",
    mainText: "Nnamdi Azikiwe Int'l Airport",
    secondaryText: "Abuja, FCT, Nigeria",
    lat: 9.0065,
    lng: 7.2631,
  },
  {
    description: "Port Harcourt City, Rivers State, Nigeria",
    mainText: "Port Harcourt",
    secondaryText: "Rivers State, Nigeria",
    lat: 4.8156,
    lng: 7.0498,
  },
  {
    description: "Kano Municipal, Kano State, Nigeria",
    mainText: "Kano",
    secondaryText: "Kano State, Nigeria",
    lat: 12.0022,
    lng: 8.5919,
  },
];

/**
 * Searches real-time places using Google Places Autocomplete API with seamless live fallback
 */
export async function searchPlaces(query: string): Promise<PlaceSuggestion[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  // 1. If Google Maps API Key is provided, use Google Places Autocomplete
  if (GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY.trim()) {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        trimmed
      )}&key=${GOOGLE_MAPS_API_KEY}&components=country:ng`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && Array.isArray(data.predictions) && data.predictions.length > 0) {
        return data.predictions.map((p: any) => ({
          description: p.description,
          placeId: p.place_id,
          mainText: p.structured_formatting?.main_text || p.description,
          secondaryText: p.structured_formatting?.secondary_text || "",
        }));
      }
    } catch (err) {
      console.warn("Google Places API error, attempting live geocode fallback:", err);
    }
  }

  // 2. Query live OpenStreetMap / Photon geocoder for real locations
  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&limit=6`;
    const res = await fetch(url);
    const geo = await res.json();

    if (geo && Array.isArray(geo.features) && geo.features.length > 0) {
      return geo.features.map((f: any) => {
        const props = f.properties || {};
        const coords = f.geometry?.coordinates || [7.4816, 9.0765];
        const name = props.name || trimmed;
        const details = [props.city, props.state, props.country].filter(Boolean).join(", ");

        return {
          description: details ? `${name}, ${details}` : name,
          mainText: name,
          secondaryText: details || "Nigeria",
          lng: coords[0],
          lat: coords[1],
        };
      });
    }
  } catch (err) {
    console.warn("Live photon geocode request failed:", err);
  }

  // 3. Fallback matching to Nigerian locations
  const lower = trimmed.toLowerCase();
  const matched = POPULAR_NIGERIAN_PLACES.filter(
    (p) =>
      p.mainText.toLowerCase().includes(lower) ||
      p.description.toLowerCase().includes(lower)
  );

  if (matched.length > 0) return matched;

  // Generic custom entry
  return [
    {
      description: `${trimmed}, Abuja, Nigeria`,
      mainText: trimmed,
      secondaryText: "Abuja, Nigeria",
      lat: 9.0765,
      lng: 7.4816,
    },
  ];
}

/**
 * Resolves latitude and longitude for a given place or address
 */
export async function getPlaceCoordinates(
  address: string,
  placeId?: string
): Promise<{ latitude: number; longitude: number; address: string }> {
  // If Google Maps API Key is provided
  if (GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY.trim()) {
    try {
      const endpoint = placeId
        ? `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_API_KEY}`
        : `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            address
          )}&key=${GOOGLE_MAPS_API_KEY}`;

      const res = await fetch(endpoint);
      const data = await res.json();

      if (data.status === "OK") {
        const loc =
          data.result?.geometry?.location || data.results?.[0]?.geometry?.location;
        if (loc) {
          return {
            latitude: loc.lat,
            longitude: loc.lng,
            address: data.result?.formatted_address || data.results?.[0]?.formatted_address || address,
          };
        }
      }
    } catch (err) {
      console.warn("Google Geocoding error:", err);
    }
  }

  // Live Photon fallback
  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(address)}&limit=1`;
    const res = await fetch(url);
    const data = await res.json();
    if (data?.features?.[0]?.geometry?.coordinates) {
      const [lng, lat] = data.features[0].geometry.coordinates;
      return { latitude: lat, longitude: lng, address };
    }
  } catch (err) {
    console.warn("Geocoding fallback failed:", err);
  }

  // Default coordinate (Abuja City Center)
  return { latitude: 9.0765, longitude: 7.4816, address };
}

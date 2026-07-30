type PlaceSuggestion = {
  description: string;
  placeId: string;
};

export async function fetchAddressSuggestions(query: string): Promise<PlaceSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) {
    return [];
  }

  const apiKey =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_PLACES_API_KEY ||
    process.env.PLACES_API_KEY;

  if (!apiKey) {
    return [];
  }

  const url = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json");
  url.searchParams.set("input", trimmed);
  url.searchParams.set("types", "address");
  url.searchParams.set("language", "nl");
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as {
    status?: string;
    predictions?: Array<{ description?: string; place_id?: string }>;
  };

  if (!payload.predictions || !Array.isArray(payload.predictions)) {
    return [];
  }

  return payload.predictions
    .map((item) => ({
      description: item.description || "",
      placeId: item.place_id || "",
    }))
    .filter((item) => item.description.length > 0)
    .slice(0, 6);
}

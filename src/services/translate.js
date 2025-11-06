export async function translateText({ text, target, source = "en" }) {
  if (!text || !target) {
    throw new Error("Missing required parameters: text and target");
  }

  const apiKey = import.meta.env.VITE_RAPIDAPI_KEY;
  // Allow overriding the RapidAPI host and endpoint path via env.
  // Defaults set to the Free Google Translator API host.
  const apiHost =
    import.meta.env.VITE_RAPIDAPI_HOST ||
    "free-google-translator.p.rapidapi.com";
  // Default path for the Free Google Translator API
  const endpointPath =
    import.meta.env.VITE_RAPIDAPI_ENDPOINT_PATH ||
    "/external-api/free-google-translator";

  if (!apiKey) {
    throw new Error(
      "RapidAPI key is not set. Define VITE_RAPIDAPI_KEY in your .env file."
    );
  }

  // Build URL with query params per the API's cURL example
  const url = new URL(`https://${apiHost}${endpointPath}`);
  url.searchParams.set("from", source);
  url.searchParams.set("to", target);
  url.searchParams.set("query", text);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": apiHost,
    },
    // Body as shown in provider's example
    body: JSON.stringify({ translate: "rapidapi" }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Translation API error (${res.status}): ${text}`);
  }

  const data = await res.json();

  // Try common response shapes used by RapidAPI wrappers
  const candidates = [
    data?.data?.translated_text,
    data?.data?.translation,
    data?.translated_text,
    data?.translation,
    data?.translated,
    data?.result,
    data?.text,
    data?.output,
  ];

  let translated = candidates.find(
    (v) => typeof v === "string" && v.length > 0
  );

  // If any candidate is an array, pick the first string item
  if (!translated) {
    const arrayCandidate = candidates.find((v) => Array.isArray(v) && v.length);
    if (arrayCandidate) {
      const first = arrayCandidate.find((v) => typeof v === "string");
      if (first) translated = first;
    }
  }

  if (!translated) {
    throw new Error("Unexpected API response format: " + JSON.stringify(data));
  }
  return translated;
}

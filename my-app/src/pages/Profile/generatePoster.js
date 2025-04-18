
export async function generateConcertPoster(artist, topSongs) {
  const prompt = `Create a minimalist concert poster with simple colors and images that alludes to the songs: ${topSongs[0]}. do NOT add any text. please make sure it fills the whole canvas.`;

  const response = await fetch("/api/generate-poster", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  const data = await response.json();
  return data.imageUrl;
}
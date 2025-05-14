// ✅ Load data from the main JSON dataset
async function loadSpeciesData() {
  const res = await fetch("./json/fish_samples_cleaned.json");
  return await res.json();
}

function classifyWeather(rainfall) {
  if (rainfall < 0.5) return "Dry";
  if (rainfall <= 2) return "Rainy";
  return "Flooded";
}

function classifyTemperature(min, max) {
  if (isNaN(min) || isNaN(max)) return null;
  const avg = (min + max) / 2;
  if (avg < 15) return "<15°C";
  if (avg <= 25) return "15–25°C";
  return ">25°C";
}

function computeStats(data, speciesName) {
  const filtered = data.filter(e => e.species === speciesName);
  if (filtered.length === 0) return null;

  const rainfalls = filtered.map(e => parseFloat(e.rainfall)).filter(r => !isNaN(r));
  const minTemps = filtered.map(e => parseFloat(e.temp_min)).filter(t => !isNaN(t));
  const maxTemps = filtered.map(e => parseFloat(e.temp_max)).filter(t => !isNaN(t));
  const counts = filtered.map(e => parseInt(e.count)).filter(c => !isNaN(c));
  const seasons = filtered.map(e => e.season);
  const dates = filtered.map(e => new Date(e.simple)).filter(d => !isNaN(d)).sort((a, b) => a - b);

  const avgRain = rainfalls.reduce((a, b) => a + b, 0) / rainfalls.length;
  const min = Math.min(...minTemps);
  const max = Math.max(...maxTemps);
  const totalSamples = counts.reduce((a, b) => a + b, 0);

  const seasonCounts = seasons.reduce((acc, s) => {
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const mostCommonSeason = Object.entries(seasonCounts).sort((a, b) => b[1] - a[1])[0][0];

  return {
    rainfall: `${avgRain.toFixed(2)} mm`,
    tempRange: `${min.toFixed(1)}°C – ${max.toFixed(1)}°C`,
    seasonality: mostCommonSeason,
    sampleCount: totalSamples.toLocaleString(),
    observedFrom: dates[0]?.toLocaleString('default', { month: 'short', year: 'numeric' }) || "N/A",
    lastSeen: dates[dates.length - 1]?.toLocaleString('default', { month: 'short', year: 'numeric' }) || "N/A"
  };
}

window.addEventListener("DOMContentLoaded", async () => {
  const url = new URL(window.location.href);
  const speciesName = url.searchParams.get("species");

  const data = await loadSpeciesData();
  const stats = computeStats(data, speciesName);
  console.log('xxxxxxxxxxxxxx');
  console.log(speciesName);
  console.log('xxxxxxxxxxxxxx');
  if (!stats) {
    document.body.innerHTML = "<h2 style='text-align:center;margin-top:5rem;'>Species not found.</h2>";
    return;
  }

   // Getting the image name from the url
  const safeName = speciesName.trim().toLowerCase().replace(/\s+/g, "_");
  const imagePath = `images/${safeName}.jpg`;

  // Set hero image with fallback
  const heroImage = document.getElementById("heroImage");
  heroImage.src = imagePath;
  heroImage.onerror = () => {
    heroImage.src = "images/fallback.jpg";
  };

 

  document.getElementById("commonName").textContent = "Common name to be implemented";
  document.getElementById("sciName").textContent = speciesName;
  document.getElementById("description").textContent = "No description provided.";
  document.getElementById("wikiLink").href = `https://www.google.com/search?q=${encodeURIComponent(speciesName)}`;

  document.getElementById("rainfall").textContent = stats.rainfall;
  document.getElementById("tempRange").textContent = stats.tempRange;
  document.getElementById("seasonality").textContent = stats.seasonality;
  document.getElementById("sampleCount").textContent = stats.sampleCount;
  document.getElementById("observedFrom").textContent = stats.observedFrom;
  document.getElementById("lastSeen").textContent = stats.lastSeen;

  // Optional: similar species section could go here in the future
});

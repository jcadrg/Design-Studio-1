// ✅ Load data from the main JSON dataset
async function loadSpeciesData() {
  const res = await fetch("./json/fish_samples_cleaned.json");
  return await res.json();
}

async function loadMetadata() {
  const res = await fetch("./json/species_common_names.json");
  return await res.json();
}

import {
  renderSeasonDistributionChart,
  renderTemperatureDistributionChart,
  renderRainfallDistributionChart,
  renderFrequencyOverTimeChart
} from "./js/chart.js";

function computeStats(data, speciesName) {
  const filtered = data.filter(e => e.species === speciesName);
  if (filtered.length === 0) return null;

  const rainfalls = filtered.map(e => parseFloat(e.rainfall)).filter(r => !isNaN(r));
  const minTemps = filtered.map(e => parseFloat(e.temp_min)).filter(t => !isNaN(t));
  const maxTemps = filtered.map(e => parseFloat(e.temp_max)).filter(t => !isNaN(t));
  const counts = filtered.map(e => parseInt(e.count)).filter(c => !isNaN(c));
  const seasons = filtered.map(e => e.season);

  const dateObjs = filtered.map(e => new Date(e.sample_date)).filter(d => !isNaN(d));
  const sortedDates = dateObjs.sort((a, b) => a - b);

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
    rainfall: `${avgRain.toFixed(2)} mm (most common condition)`,
    tempRange: `${min.toFixed(1)}°C – ${max.toFixed(1)}°C (observed range)`,
    seasonality: `${mostCommonSeason} (most frequent)`,
    sampleCount: `${totalSamples.toLocaleString()} total samples`,
    observedFrom: sortedDates.length > 0 ? sortedDates[0].toLocaleDateString('en-AU', { month: 'short', year: 'numeric' }) : "Unknown",
    lastSeen: sortedDates.length > 0 ? sortedDates[sortedDates.length - 1].toLocaleDateString('en-AU', { month: 'short', year: 'numeric' }) : "Unknown"
  };
}

window.addEventListener("DOMContentLoaded", async () => {
  const url = new URL(window.location.href);
  const speciesName = url.searchParams.get("species");

  const [data, metadata] = await Promise.all([
    loadSpeciesData(),
    loadMetadata()
  ]);

  const stats = computeStats(data, speciesName);

  if (!stats) {
    document.body.innerHTML = "<h2 style='text-align:center;margin-top:5rem;'>Species not found.</h2>";
    return;
  }

  const metaEntry = metadata.find(e => e.species === speciesName);

  const safeName = speciesName.trim().toLowerCase().replace(/\s+/g, "_");
  const imagePath = `images/${safeName}.jpg`;

  const heroImage = document.getElementById("heroImage");
  heroImage.src = imagePath;
  heroImage.onerror = () => {
    heroImage.src = "images/fallback.jpg";
  };

  renderSeasonDistributionChart(speciesName, data);
  renderTemperatureDistributionChart(speciesName, data);
  renderRainfallDistributionChart(speciesName, data);
  renderFrequencyOverTimeChart(speciesName, data);

  document.getElementById("commonName").textContent = metaEntry?.common_name || "—";
  document.getElementById("sciName").textContent = speciesName;
  document.getElementById("description").textContent = metaEntry?.description || "No description provided.";
  document.getElementById("wikiLink").href = `https://www.google.com/search?q=${encodeURIComponent(speciesName)}`;

  document.getElementById("rainfall").textContent = stats.rainfall;
  document.getElementById("tempRange").textContent = stats.tempRange;
  document.getElementById("seasonality").textContent = stats.seasonality;
  document.getElementById("sampleCount").textContent = stats.sampleCount;
  document.getElementById("observedFrom").textContent = stats.observedFrom;
  document.getElementById("lastSeen").textContent = stats.lastSeen;
});

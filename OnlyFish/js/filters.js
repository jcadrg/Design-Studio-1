// Loading fish samples and species metadata from json files within the project
async function loadSamples() {
  const res = await fetch("./json/fish_samples_cleaned.json");
  return await res.json();
}

async function loadSpeciesMetadata() {
  const res = await fetch("./json/species_common_names.json");
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

function renderCards(speciesList) {
  const stationList = document.querySelector(".station-list");
  stationList.innerHTML = "";

  speciesList.forEach((item) => {
    const card = document.createElement("div");
    card.className = "species-card";
    card.setAttribute("data-species", item.name);
    card.innerHTML = `
      <div class="fish-header">
        <h3 class="scientific-name-title">Scientific Name</h3>
        <h3 class="scientific-name">${item.name}</h3>
        <h4 class="common-name-title">Common Name</h4>
        <p class="common-name">${item.commonName || "—"}</p>
      </div>
      <p><strong>Average Rainfall in Sampling:</strong> ${item.weather} • ${item.avgRain.toFixed(2)} mm</p>
      <p><strong>Average Temperature & Season:</strong> ${
        item.avgTemp !== null && !isNaN(item.avgTemp)
          ? `${item.avgTemp.toFixed(1)}°C`
          : "No temp data"
      } • ${item.season}</p>
    `;
    stationList.appendChild(card);
  });

  const dataMap = {};
  speciesList.forEach((item) => (dataMap[item.name] = item));
  attachCardListeners(dataMap);
}

function applyFilters(data, metadata, season, weather, tempRange) {
  const grouped = {};

  data.forEach((entry) => {
    const rain = parseFloat(entry.rainfall);
    const min = parseFloat(entry.temp_min);
    const max = parseFloat(entry.temp_max);
    const avgTemp = (!isNaN(min) && !isNaN(max)) ? (min + max) / 2 : null;

    const weatherLabel = classifyWeather(rain);
    const tempLabel = classifyTemperature(min, max);

    const matchSeason = season === "Any" || entry.season === season;
    const matchWeather = weather === "Any" || weatherLabel === weather;
    const matchTemp = tempRange === "Any" || tempLabel === tempRange;

    if (matchSeason && matchWeather && matchTemp) {
      if (!grouped[entry.species]) {
        grouped[entry.species] = {
          rains: [],
          temps: [],
          seasons: [],
          totalSamples: 0,
        };
      }
      grouped[entry.species].rains.push(rain);
      if (avgTemp !== null) grouped[entry.species].temps.push(avgTemp);
      grouped[entry.species].seasons.push(entry.season);
      grouped[entry.species].totalSamples += parseInt(entry.count);
    }
  });

  const result = Object.entries(grouped).map(([species, stats]) => {
    const avgRain = stats.rains.reduce((a, b) => a + b, 0) / stats.rains.length;
    const avgTemp = stats.temps.length > 0
      ? stats.temps.reduce((a, b) => a + b, 0) / stats.temps.length
      : null;

    const mostCommonSeason = Object.entries(stats.seasons.reduce((acc, s) => {
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {})).sort((a, b) => b[1] - a[1])[0][0];

    const meta = metadata.find(m => m.species === species);

    return {
      name: species,
      avgRain,
      avgTemp,
      season: mostCommonSeason,
      weather: classifyWeather(avgRain),
      totalSamples: stats.totalSamples,
      commonName: meta?.common_name || "Unknown",
      description: meta?.description || "No description available."
    };
  });

  renderCards(result);
}

function attachCardListeners(dataMap) {
  const detailCard = document.getElementById("detailCard");
  const speciesHeader = document.getElementById("cardSpecies");
  const cardAbundance = document.getElementById("cardAbundance");
  const cardDescription = document.getElementById("cardDescription");

  const speciesCards = document.querySelectorAll(".species-card");
  speciesCards.forEach((card) => {
    const speciesName = card.dataset.species;
    const speciesData = dataMap[speciesName];
    if (!speciesData) return;

    card.addEventListener("click", () => {
      speciesHeader.textContent = speciesName;
      document.getElementById("cardCommonName").textContent = speciesData.commonName || "—";
      document.getElementById("cardWeather").textContent = `Average Weather: ${speciesData.weather}`;
      document.getElementById("cardTemperature").textContent = `Average Temperature: ${
        speciesData.avgTemp !== null ? speciesData.avgTemp.toFixed(1) + "°C" : "No temp"
      }`;
      document.getElementById("cardSeason").textContent = `Optimal Season: ${speciesData.season}`;

      cardAbundance.textContent = `Total samples: ${speciesData.totalSamples}`;
      cardDescription.textContent = speciesData.description;

      const moreBtn = detailCard.querySelector(".details-btn");
      moreBtn.setAttribute("data-species", speciesName);

      detailCard.classList.remove("hidden");
      detailCard.classList.add("visible");

      addSpeciesPins(speciesName, window.fullSampleData);
    });
  });

  detailCard.querySelector(".close-btn").addEventListener("click", () => {
    detailCard.classList.remove("visible");
    detailCard.classList.add("hidden");
  });

  document.addEventListener("click", (e) => {
    if (
      !detailCard.contains(e.target) &&
      !e.target.closest(".species-card") &&
      !e.target.closest(".leaflet-popup") &&
      !e.target.closest(".leaflet-marker-icon") &&
      detailCard.classList.contains("visible")
    ) {
      detailCard.classList.remove("visible");
      detailCard.classList.add("hidden");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && detailCard.classList.contains("visible")) {
      detailCard.classList.remove("visible");
      detailCard.classList.add("hidden");
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const seasonEl = document.getElementById("seasonFilter");
  const weatherEl = document.getElementById("weatherFilter");
  const tempEl = document.getElementById("temperatureFilter");
  const searchBtn = document.getElementById("searchBtn");


  const [data, metadata] = await Promise.all([
    loadSamples(),
    loadSpeciesMetadata()
  ]);

  window.fullSampleData = data; // Store full data for pin deploying

  searchBtn.addEventListener("click", () => {
    const season = seasonEl.value;
    const weather = weatherEl.value;
    const temp = tempEl.value;
    applyFilters(data, metadata, season, weather, temp);
  });

  document.addEventListener("click", (e) => {
    if (e.target.matches(".details-btn") && e.target.hasAttribute("data-species")) {
      const species = e.target.getAttribute("data-species");
      if (species) {
        window.location.href = `more-details.html?species=${encodeURIComponent(species)}`;
      }
    }
  });
});

// Map initialization
const map = L.map('map').setView([-33.5, 145.5], 6); // Centered over Murray-Darling Basin

// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//   maxZoom: 18,
//   attribution: '&copy; OpenStreetMap contributors'
// }).addTo(map);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let markersLayer = L.layerGroup().addTo(map); // to control/removal of markers

// This function is called when a species is selected from the filter
// It adds pins to the map for each unique lat/lon of the selected species
// It also fits the map view to the bounds of the pins
function addSpeciesPins(speciesName, allSamples) {
  // Clear old markers
  markersLayer.clearLayers();

  // Filter samples for the selected species
  const samples = allSamples.filter(s => s.species === speciesName);

  // Group by lat/lon and sum counts
  const grouped = {};
  for (const s of samples) {
    const key = `${s.latitude.toFixed(5)},${s.longitude.toFixed(5)}`;
    if (!grouped[key]) {
      grouped[key] = { lat: s.latitude, lon: s.longitude, count: 0 };
    }
    grouped[key].count += s.count;
  }

  // Add a pin for each unique coordinate
  Object.values(grouped).forEach(loc => {
    const marker = L.marker([loc.lat, loc.lon]);
    marker.bindPopup(
      `<strong>Sample Count:</strong> ${loc.count}<br><strong>Lat:</strong> ${loc.lat}<br><strong>Lon:</strong> ${loc.lon}`
    );
    marker.addTo(markersLayer);
  });

  // Fit map view to pins if any
  const points = Object.values(grouped);
  if (points.length > 0) {
    const bounds = L.latLngBounds(points.map(p => [p.lat, p.lon]));
    map.fitBounds(bounds, { padding: [50, 50] });
  }
}

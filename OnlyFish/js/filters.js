async function loadSamples() {
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

function renderCards(speciesList) {
  const stationList = document.querySelector(".station-list");
  stationList.innerHTML = "";

  speciesList.forEach((item) => {
    const card = document.createElement("div");
    card.className = "species-card";
    card.innerHTML = `
      <div class="fish-header">
        <div class="fish-icon">🐟</div>
        <h3>${item.name}</h3>
      </div>
      <p>${item.weather} • ${item.avgRain.toFixed(2)} mm</p>
      <p>
        ${item.avgTemp !== null && !isNaN(item.avgTemp)
          ? `${item.avgTemp.toFixed(1)}°C`
          : "No temp data"} • ${item.season}
      </p>
    `;
    stationList.appendChild(card);
  });

  // Hook up detail card with filtered data
  const dataMap = {};
  speciesList.forEach((item) => (dataMap[item.name] = item));
  attachCardListeners(dataMap);
}

function applyFilters(data, season, weather, tempRange) {
  const grouped = {};

  data.forEach((entry) => {
    const {
      species,
      rainfall,
      temp_min,
      temp_max,
      season: entrySeason,
      count
    } = entry;

    const rain = parseFloat(rainfall);
    const min = parseFloat(temp_min);
    const max = parseFloat(temp_max);
    const avgTemp = (!isNaN(min) && !isNaN(max)) ? (min + max) / 2 : null;

    const weatherLabel = classifyWeather(rain);
    const tempLabel = classifyTemperature(min, max);

    const matchSeason = season === "Any" || entrySeason === season;
    const matchWeather = weather === "Any" || weatherLabel === weather;
    const matchTemp = tempRange === "Any" || tempLabel === tempRange;

    if (matchSeason && matchWeather && matchTemp) {
      if (!grouped[species]) {
        grouped[species] = {
          rains: [],
          temps: [],
          seasons: [],
          totalSamples: 0,
        };
      }
      grouped[species].rains.push(rain);
      if (avgTemp !== null) grouped[species].temps.push(avgTemp);
      grouped[species].seasons.push(entrySeason);
      grouped[species].totalSamples += parseInt(count);
    }
  });

  const result = Object.entries(grouped).map(([name, stats]) => {
    const avgRain = stats.rains.reduce((a, b) => a + b, 0) / stats.rains.length;
    const avgTemp = stats.temps.length > 0
      ? stats.temps.reduce((a, b) => a + b, 0) / stats.temps.length
      : null;

    const seasonCounts = stats.seasons.reduce((acc, s) => {
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});
    const mostCommonSeason = Object.entries(seasonCounts).sort((a, b) => b[1] - a[1])[0][0];

    return {
      name,
      avgRain,
      avgTemp,
      season: mostCommonSeason,
      weather: classifyWeather(avgRain),
      totalSamples: stats.totalSamples,
      description: "A freshwater species found in the Murray-Darling Basin." // Placeholder
    };
  });

  renderCards(result);
}

function attachCardListeners(dataMap) {
  const detailCard = document.getElementById("detailCard");
  const speciesHeader = document.getElementById("cardSpecies");
  const speciesStatus = document.getElementById("cardStatus");
  const cardAbundance = document.getElementById("cardAbundance");
  const cardDescription = document.getElementById("cardDescription");

  const speciesCards = document.querySelectorAll(".species-card");

  speciesCards.forEach((card) => {
    const speciesName = card.querySelector("h3").textContent;
    const speciesData = dataMap[speciesName];
    if (!speciesData) return;

    card.addEventListener("click", () => {
      speciesHeader.textContent = speciesName;

      speciesStatus.textContent = `${speciesData.weather} • ${
        speciesData.avgTemp !== null ? speciesData.avgTemp.toFixed(1) + "°C" : "No temp"
      } • ${speciesData.season}`;

      cardAbundance.textContent = `📊 Total samples: ${speciesData.totalSamples}`;
      cardDescription.textContent = speciesData.description;

      // Set species data attribute for More Details button
      const moreBtn = detailCard.querySelector(".details-btn");
      moreBtn.setAttribute("data-species", speciesName);

      // Show the detail card
      detailCard.classList.remove("hidden");
      detailCard.classList.add("visible");
    });
  });

  // Close button
  detailCard.querySelector(".close-btn").addEventListener("click", () => {
    detailCard.classList.remove("visible");
    detailCard.classList.add("hidden");
  });

  // Click outside
  document.addEventListener("click", (e) => {
    if (
      !detailCard.contains(e.target) &&
      !e.target.closest(".species-card") &&
      detailCard.classList.contains("visible")
    ) {
      detailCard.classList.remove("visible");
      detailCard.classList.add("hidden");
    }
  });

  // ESC to close
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

  const data = await loadSamples();

  searchBtn.addEventListener("click", () => {
    const season = seasonEl.value;
    const weather = weatherEl.value;
    const temp = tempEl.value;
    applyFilters(data, season, weather, temp);
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
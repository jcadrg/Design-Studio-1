// ./js/filterSeason.js

// Load the fish sample data (assume script tag or dynamic fetch later)
import fishSamples from "../json/fish_samples_cleaned.js";

/**
 * Filters all sample records by the selected season and returns a unique list of species.
 * It then populates the .station-list in index.html with one card per unique species name.
 */

function filterBySeason(selectedSeason) {
  const filtered = fishSamples.filter(
    (sample) => sample.season === selectedSeason
  );

  const uniqueSpecies = Array.from(
    new Set(filtered.map((entry) => entry.species))
  );

  const stationList = document.querySelector(".station-list");
  stationList.innerHTML = ""; // clear old results

  uniqueSpecies.forEach((species, index) => {
    const card = document.createElement("div");
    card.className = "species-card";
    card.innerHTML = `
      <div class="fish-header">
        <div class="fish-icon">🐟</div>
        <h3>${species}</h3>
      </div>
      <p>${selectedSeason}</p>
    `;
    stationList.appendChild(card);
  });
}

// Optional: Expose function globally for hook-up with dropdown
window.filterBySeason = filterBySeason;

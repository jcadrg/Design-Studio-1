export function renderSeasonDistributionChart(speciesName, allSamples) {
  const seasonCounts = {};

  // Collect counts per season for the selected species
  allSamples.forEach((sample) => {
    if (sample.species === speciesName && sample.season) {
      const season = sample.season;
      if (!seasonCounts[season]) {
        seasonCounts[season] = 0;
      }
      seasonCounts[season] += sample.count;
    }
  });

  // Sort seasons by a defined order (optional but helps visual consistency)
  const orderedSeasons = [
    "Early Summer", "Mid Summer", "Late Summer",
    "Early Autumn", "Mid Autumn", "Late Autumn",
    "Early Winter", "Mid Winter", "Late Winter",
    "Early Spring", "Mid Spring", "Late Spring"
  ];

  const labels = orderedSeasons.filter(season => seasonCounts[season]);
  const data = labels.map(season => seasonCounts[season]);

  // This js snippet is for rendering a bar chart using Chart.js
  // The canvas with id "seasonChart" is at the bottom of the HTML file more-details.html
  const ctx = document.getElementById("seasonChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Sample Count",
          data,
          backgroundColor: "#00BFFF",
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Seasonal Sample Distribution",
          color: "white",
          font: { size: 16 },
        },
      },
      scales: {
        x: {
          ticks: { color: "white" },
          grid: { display: false },
        },
        y: {
          ticks: { color: "white" },
          grid: { color: "#444" },
        },
      },
    },
  });
}

// This function draws the chart for temperature distribution in the respective brackets
// The canvas with id "temperatureChart" is at the bottom of the HTML file more-details.html
export function renderTemperatureDistributionChart(speciesName, allSamples) {
  const buckets = {
    "<10°C": 0,
    "10–15°C": 0,
    "15–20°C": 0,
    "20–25°C": 0,
    ">25°C": 0
  };

  allSamples.forEach(sample => {
    if (sample.species === speciesName) {
      const min = parseFloat(sample.temp_min);
      const max = parseFloat(sample.temp_max);
      const count = parseInt(sample.count);

      if (!isNaN(min) && !isNaN(max) && !isNaN(count)) {
        const avg = (min + max) / 2;
        if (avg < 10) buckets["<10°C"] += count;
        else if (avg <= 15) buckets["10–15°C"] += count;
        else if (avg <= 20) buckets["15–20°C"] += count;
        else if (avg <= 25) buckets["20–25°C"] += count;
        else buckets[">25°C"] += count;
      }
    }
  });

  const labels = Object.keys(buckets);
  const data = Object.values(buckets);

  const ctx = document.getElementById("temperatureChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Sample Count",
        data,
        backgroundColor: "#ff6347", // Tomato color
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Temperature Range Distribution",
          color: "white",
          font: { size: 16 }
        }
      },
      scales: {
        x: {
          ticks: { color: "white" },
          grid: { display: false }
        },
        y: {
          ticks: { color: "white" },
          grid: { color: "#444" }
        }
      }
    }
  });
}

// This function draws the chart for rainfall distribution in the respective brackets
// The canvas with id "rainfallChart" is at the bottom of the HTML file more-details.html
export function renderRainfallDistributionChart(speciesName, allSamples) {
  const bins = {
    "<0.5 mm\nVery Dry": 0,
    "0.5–1 mm\nLow Moisture": 0,
    "1–2 mm\nModerate": 0,
    "2–3 mm\nMoist": 0,
    "3–5 mm\nRainy": 0,
    ">5 mm\nExtreme": 0,
  };

  allSamples.forEach(sample => {
    if (sample.species === speciesName && typeof sample.rainfall === "number") {
      const rain = sample.rainfall;
      const count = sample.count || 0;

      if (rain < 0.5) bins["<0.5 mm\nVery Dry"] += count;
      else if (rain < 1) bins["0.5–1 mm\nLow Moisture"] += count;
      else if (rain < 2) bins["1–2 mm\nModerate"] += count;
      else if (rain < 3) bins["2–3 mm\nMoist"] += count;
      else if (rain < 5) bins["3–5 mm\nRainy"] += count;
      else bins[">5 mm\nExtreme"] += count;
    }
  });

  const labels = Object.keys(bins);
  const data = labels.map(label => bins[label]);

  const ctx = document.getElementById("rainfallChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Sample Count",
        data,
        backgroundColor: "#7a55cf", // Violet color
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Rainfall Distribution",
          color: "white",
          font: { size: 16 }
        }
      },
      scales: {
        x: {
          ticks: {
            color: "white",
            callback: function(value) {
              return this.getLabelForValue(value).split("\n");
            }
          },
          grid: { display: false }
        },
        y: {
          ticks: { color: "white" },
          grid: { color: "#444" }
        }
      }
    }
  });
}

// This function draws the chart for sample frequency over time
// The canvas with id "frequencyChart" is at the bottom of the HTML file more-details.html
export function renderFrequencyOverTimeChart(speciesName, data) {
  const monthlyCounts = {};

  data.forEach(sample => {
    if (sample.species === speciesName && sample.sample_date) {
      const date = new Date(sample.sample_date);
      const label = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyCounts[label]) {
        monthlyCounts[label] = 0;
      }
      monthlyCounts[label] += sample.count;
    }
  });

  const sortedDates = Object.keys(monthlyCounts).sort();
  const counts = sortedDates.map(date => monthlyCounts[date]);

  const ctx = document.getElementById("frequencyChart").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: sortedDates,
      datasets: [{
        label: "Sample Count",
        data: counts,
        fill: false,
        borderColor: "#00CED1",
        backgroundColor: "#00CED1",
        tension: 0.3,
        pointRadius: 3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Sample Frequency Over Time",
          color: "white",
          font: { size: 16 }
        },
        legend: { display: false }
      },
      scales: {
        x: {
          ticks: { color: "white" },
          grid: { display: false }
        },
        y: {
          ticks: { color: "white" },
          grid: { color: "#444" }
        }
      }
    }
  });
}
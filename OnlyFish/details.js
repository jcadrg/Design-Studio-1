// ✅ Species data stored globally
const speciesData = {
  "Murray Cod": {
    scientific: "Maccullochella peelii",
    image: "images/MurrayCod.jpg",
    wiki: "https://en.wikipedia.org/wiki/Maccullochella_peelii",
    description: "The Murray Cod is a large, long-lived freshwater fish native to the Murray-Darling Basin. It is the top predator in its ecosystem and is culturally significant to First Nations communities.",
    rainfall: "0.52 mm",
    tempRange: "9.6°C – 22.7°C",
    seasonality: "Early to Late Summer",
    sampleCount: "201,473",
    observedFrom: "Mar 2015",
    lastSeen: "Jun 2023",
    similar: ["Golden Perch", "Silver Bream"],
    images: [
    "images/MurrayCod-1.jpg",
    "images/MurrayCod-2.jpg",
    "images/MurrayCod-3.jpg",
    "images/MurrayCod-4.jpg",]
  },
  "Golden Perch": {
    scientific: "Macquaria ambigua",
    image: "images/GoldenPerch.jpg",
    wiki: "https://en.wikipedia.org/wiki/Golden_perch",
    description: "The Golden Perch is a native Australian freshwater fish. It thrives in warm waters and is known for its migratory spawning behaviors.",
    rainfall: "0.48 mm",
    tempRange: "11.2°C – 24.5°C",
    seasonality: "Mid to Late Summer",
    sampleCount: "134,982",
    observedFrom: "Feb 2016",
    lastSeen: "May 2023",
    similar: ["Murray Cod", "Silver Bream"]
  },
  "Silver Bream": {
    scientific: "Acanthopagrus butcheri",
    image: "images/SilverBream.jpg",
    wiki: "https://en.wikipedia.org/wiki/Acanthopagrus_butcheri",
    description: "A bottom-dwelling fish tolerant of poor water quality, commonly found in estuarine and freshwater habitats.",
    rainfall: "0.61 mm",
    tempRange: "10.7°C – 25.1°C",
    seasonality: "Late Summer",
    sampleCount: "128,279",
    observedFrom: "Jan 2017",
    lastSeen: "Apr 2023",
    similar: ["Murray Cod"]
  }
};

// ✅ Wait for the page to load
window.addEventListener("DOMContentLoaded", () => {
  console.log("✅ JS loaded");
  window.scrollTo(0, 0);

  const url = new URL(window.location.href);
  const speciesName = url.searchParams.get("species");
  console.log("🔍 species param:", speciesName);

  const data = speciesData[speciesName];

  if (!data) {
    document.body.innerHTML = "<h2 style='text-align:center;margin-top:5rem;'>Species not found.</h2>";
    return;
  }

    // Set the hero image to the first image in the gallery (or fallback)
  const heroImage = document.getElementById("heroImage");
  const mainImage = data.image;
  heroImage.src = mainImage;

  // Inject gallery thumbnails if multiple images exist
  const gallery = document.getElementById("galleryThumbs");
  if (data.images && gallery) {
    data.images.forEach((src, index) => {
      const thumb = document.createElement("img");
      thumb.src = src;
      thumb.className = "thumb-img";
      thumb.alt = `Thumbnail ${index + 1}`;

      if (index === 0) thumb.classList.add("active");

      thumb.addEventListener("click", () => {
        heroImage.src = src;

        // Remove active class from all thumbs
        document.querySelectorAll(".thumb-img").forEach(t => t.classList.remove("active"));
        thumb.classList.add("active");
      });

      gallery.appendChild(thumb);
    });
  }

  document.getElementById("commonName").textContent = speciesName;
  document.getElementById("sciName").textContent = data.scientific;
  document.getElementById("description").textContent = data.description;
  document.getElementById("wikiLink").href = data.wiki;
  document.getElementById("rainfall").textContent = data.rainfall;
  document.getElementById("tempRange").textContent = data.tempRange;
  document.getElementById("seasonality").textContent = data.seasonality;
  document.getElementById("sampleCount").textContent = data.sampleCount;
  document.getElementById("observedFrom").textContent = data.observedFrom;
  document.getElementById("lastSeen").textContent = data.lastSeen;

  const similarContainer = document.getElementById("similarSpecies");
  data.similar.forEach(name => {
    const div = document.createElement("div");
    div.className = "similar-card";
    div.innerHTML = `
      <a href="more-details.html?species=${encodeURIComponent(name)}">
        <img src="${speciesData[name].image}" alt="${name}" />
        <p>${name}</p>
      </a>
    `;
    similarContainer.appendChild(div);
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const speciesData = {
    "Murray Cod": {
      status: "Dry • 27°C • Early Summer",
      river: "Murrumbidgee",
      lastSeen: "Jan 2024",
      abundance: "High",
      description:
        "A long-lived freshwater predator native to the Murray-Darling Basin.",
    },
    "Golden Perch": {
      status: "Rainy • 12°C • Mid Summer",
      river: "Darling River",
      lastSeen: "Dec 2023",
      abundance: "Medium",
      description:
        "An important recreational fish known for migration during floods.",
    },
    "Silver Bream": {
      status: "Flooded • 22°C • Late Summer",
      river: "Murray River",
      lastSeen: "Feb 2024",
      abundance: "Low",
      description:
        "A bottom-dwelling fish tolerant of poor water quality, common in still waters.",
    },
  };

  const detailCard = document.getElementById("detailCard");

  const cardSpecies = document.getElementById("cardSpecies");
  const cardStatus = document.getElementById("cardStatus");
  const cardRiver = document.getElementById("cardRiver");
  const cardLastSeen = document.getElementById("cardLastSeen");
  const cardAbundance = document.getElementById("cardAbundance");
  const cardDescription = document.getElementById("cardDescription");

  // Handle species card clicks
  document.querySelectorAll(".species-card").forEach((card) => {
    card.addEventListener("click", () => {
      const name = card.querySelector("h3").innerText;
      const data = speciesData[name];
      if (!data) return;

      // Update content
      cardSpecies.innerText = name;
      cardStatus.innerText = data.status;
      cardRiver.innerText = `📍 River: ${data.river}`;
      cardLastSeen.innerText = `🕒 Last seen: ${data.lastSeen}`;
      cardAbundance.innerText = `📊 Abundance: ${data.abundance}`;
      cardDescription.innerText = data.description;

      // Remove active from all cards
      document.querySelectorAll(".species-card.active").forEach(c =>
        c.classList.remove("active")
      );
      card.classList.add("active");

      // Show the detail card
      detailCard.classList.add("visible");
      detailCard.classList.remove("hidden");
    });
  });

  // Close button
  document.querySelector(".close-btn").addEventListener("click", () => {
    detailCard.classList.remove("visible");
    detailCard.classList.add("hidden");

    document.querySelectorAll(".species-card.active").forEach(c =>
      c.classList.remove("active")
    );
  });

  // Click outside to close
  document.addEventListener("click", (event) => {
    const isInsideCard = detailCard.contains(event.target);
    const isSpeciesCard = event.target.closest(".species-card");
    if (!isInsideCard && !isSpeciesCard && detailCard.classList.contains("visible")) {
      detailCard.classList.remove("visible");
      detailCard.classList.add("hidden");

      document.querySelectorAll(".species-card.active").forEach(c =>
        c.classList.remove("active")
      );
    }
  });

  // ESC key to close
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && detailCard.classList.contains("visible")) {
      detailCard.classList.remove("visible");
      detailCard.classList.add("hidden");

      document.querySelectorAll(".species-card.active").forEach(c =>
        c.classList.remove("active")
      );
    }
  });
});

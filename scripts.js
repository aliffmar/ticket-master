// Initialize the map with a center in the United States
const map = L.map("map").setView([37.7749, -122.4194], 3);
// Add a tile layer to the map
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// Function to change zoom level
function changeZoom() {
  const zoomLevel = document.getElementById("zoomLevel").value;
  map.setZoom(parseInt(zoomLevel));
}

let genreFilter = null;
// Function to fetch events data from Ticketmaster API
async function fetchEvents() {
  const apiKey = "EBG8ipmveG95yQx4qGmsGvjWrPyIaZ4A"; // Replace with your Ticketmaster API key
  let apiUrl = `https://app.ticketmaster.com/discovery/v2/events.json?size=20&apikey=${apiKey}`;
  if (genreFilter != null) {
    apiUrl += `&classificationName=${genreFilter}`;
  }
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    console.log({ data });
    renderEvents(data._embedded.events);
    data._embedded.events.forEach((event) => {
      // Loop through all venues in each event

      event._embedded.venues.forEach((venue) => {
        const marker = L.marker([
          venue.location.latitude,
          venue.location.longitude,
        ]);
        // marker.on("click", () => openEventModal(event));
        // Add marker for the venue's location
        if (genreFilter) {
          if (
            event.classifications[0].segment.name == genreFilter ||
            event.classifications[0].genre.name == genreFilter
          ) {
            marker
              .addTo(map)
              .bindPopup(
                `<b>${event.name}</b><br>${venue.name}<br><img src="${event.images[0].url}" alt="${event.name}" style="max-width: 100px; max-height: 100px;">`
              );
            // Add click event listener to the marker
          }
        } else {
          marker
            .addTo(map)
            .bindPopup(
              `<b>${event.name}</b><br>${venue.name}<br><img src="${event.images[0].url}" alt="${event.name}" style="max-width: 100px; max-height: 100px;">`
            );
        }
      });
    });
  } catch (error) {
    console.error("Error fetching events:", error);
  }
}

function renderEvents(events) {
  if (!events) {
    return;
  }
  const eventContainer = document.querySelector(".event-container");
  eventContainer.innerHTML = "";

  events.forEach((event) => {
    if (
      genreFilter === event.classifications[0].segment.name ||
      genreFilter === event.classifications[0].genre.name ||
      genreFilter == null
    ) {
      console.log({ event });
      const eventElement = document.createElement("div");
      eventElement.classList.add("event");

      const imageElement = document.createElement("img");
      imageElement.src = event.images[0].url;
      imageElement.alt = event.name;
      const genreBadge = document.createElement("span");
      genreBadge.classList.add("badge");
      genreBadge.textContent = `${event.classifications[0]?.genre?.name} | ${event.classifications[0]?.subGenre?.name}`;

      const nameElement = document.createElement("h5");
      nameElement.textContent = event.name;

      const dateElement = document.createElement("p");
      dateElement.textContent = `${event.dates.start.localDate} at ${event.dates.start.localTime}`;

      const venueElement = document.createElement("p");
      venueElement.textContent = `${event._embedded.venues[0].name} · ${event._embedded.venues[0].city.name}, ${event._embedded.venues[0].state.stateCode}`;

      eventElement.appendChild(imageElement);
      eventElement.appendChild(genreBadge);
      eventElement.appendChild(nameElement);
      eventElement.appendChild(dateElement);
      eventElement.appendChild(venueElement);
      eventElement.addEventListener("click", () => openEventModal(event));

      eventContainer.appendChild(eventElement);
    }
  });
}

function openEventModal(event) {
  const modal = document.getElementById("eventModal");
  const modalContent = document.getElementById("modalContent");

  // Populate the modal with event details
  modalContent.innerHTML = `
  <div class="row">
  <div class="col-md-4 col-sm-12">
    <img width="100%" src="${event.images[0].url}" alt="${event.name}" />
    </div>
    <div class="col-md-8 col-sm-12">
    <span class="badge">${event.classifications[0]?.genre?.name} | ${event.classifications[0]?.subGenre?.name}</span>
    
    <h5>${event.name}</h5>
    <p>${event.dates.start.localDate} at ${event.dates.start.localTime}</p>
    <p>${event._embedded.venues[0].name} · ${event._embedded.venues[0].city.name}, ${event._embedded.venues[0].state.stateCode}</p>
    <p>Ticket Sales: ${event.sales.public.startDateTime} - ${event.sales.public.endDateTime}</p>
    <button class="btn btn-success" onclick="window.open('${event.url}', '_blank')">Buy Tickets</button>
    <button class="btn btn-info" onclick="window.open('${event.seatmap.staticUrl}', '_blank')">View Venue Map</button>
  </div>
  </div>
    `;

  // Show the modal
  modal.style.display = "block";
  document.querySelector("#map").style.zIndex = "-1";
  // Close the modal when the user clicks on the close button (x)
  const closeBtn = document.querySelector(".close");
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
    document.querySelector("#map").style.zIndex = "1";
  });

  // Close the modal when the user clicks anywhere outside the modal
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
      document.querySelector("#map").style.zIndex = "1";
    }
  });
}

// Add this function to handle filtering by genre
function handleFilter(genre) {
  genreFilter = genre;
  fetchEvents().then((events) => {
    renderEvents(events);
  });
}

// Modify the toggleFilter and clearGenreFilter functions
function toggleFilter() {
  document.getElementById("eventFilters").style.display = "flex";
}

function clearGenreFilter() {
  document.getElementById("eventFilters").style.display = "none";
  genreFilter = null;
  fetchEvents().then((events) => {
    renderEvents(events);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("ready");
  fetchEvents();
});

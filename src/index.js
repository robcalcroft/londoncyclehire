import geolib from "geolib";

(() => {
  const map = L.map("map").setView([51.505, -0.09], 12);
  let bikePoints = [];

  L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
  }).addTo(map);

  fetch("https://api.tfl.gov.uk/bikePoint")
    .then(response => response.json())
    .then(_bikePoints => {
      if (_bikePoints && _bikePoints.length) {
        bikePoints = _bikePoints;
      }
    });

  document.getElementById("findMe").addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        map.setMinZoom(14);
        map.setView([coords.latitude, coords.longitude], 15);
        const bikePoints2kmFromUser = [];

        for (let index = 0; index < bikePoints.length; index += 1) {
          const bikePoint = bikePoints[index];
          const marker = L.marker([bikePoint.lat, bikePoint.lon]).addTo(map);
          marker.bindPopup(bikePoint.commonName);

          if (
            geolib.isPointInCircle(
              {
                latitude: bikePoint.lat,
                longitude: bikePoint.lon
              },
              {
                latitude: coords.latitude,
                longitude: coords.longitude
              },
              2000
            )
          ) {
            bikePoints2kmFromUser.push(bikePoint);
          }
        }

        console.log(bikePoints2kmFromUser);
        const container = document.createElement('div');

        for (let index = bikePoints2kmFromUser.length - 1; index > 0; index -= 1) {
          const bikepoint = bikePoints2kmFromUser[index];
          const element = document.createElement('div');
          element.className = 'dashboard__bikepoint';
          element.innerHTML = `<b>${bikepoint.additionalProperties[7].value}/${bikepoint.additionalProperties[8].value}</b> &mdash; ${bikepoint.commonName}`;
          container.appendChild(element);
        }

        document.getElementById('dashboard__main').appendChild(container);
      },
      () => {
        alert("Couldn't determine your location");
      }
    );
  });
})();

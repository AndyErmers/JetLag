document.addEventListener('DOMContentLoaded', function () {
    var map = L.map('map').setView([50.85, 5.95], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var bounds = L.latLngBounds(); // Maak een lege bounds-object

    // Voeg markers toe voor de bezienswaardigheden vanuit JSON
    fetch('data/challenges.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            data.forEach(challenge => {
                var marker = L.marker([challenge.lat, challenge.lon]).addTo(map)
                    .bindPopup(`<b>${challenge.location}</b><br>${challenge.challenge}`);
                bounds.extend(marker.getLatLng()); // Breid de bounds uit met elke marker
            });
            map.fitBounds(bounds); // Pas de kaart aan om alle markers te tonen
            map.setMaxBounds(bounds); // Stel de maximale bounds in
            map.setMinZoom(map.getBoundsZoom(bounds)); // Stel het minimale zoomniveau in op basis van de bounds
        })
        .catch(error => console.error('Error loading challenges:', error));
});

function updateLeaderboard() {
    const leaderboard = [
        { team: "Team A", points: 300 },
        { team: "Team B", points: 200 }
        // Voeg meer teams en punten toe
    ];
    const tableBody = document.querySelector('#leaderboard-table tbody');
    tableBody.innerHTML = '';
    leaderboard.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${entry.team}</td><td>${entry.points}</td>`;
        tableBody.appendChild(row);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    updateLeaderboard();
});

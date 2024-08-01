document.addEventListener('DOMContentLoaded', function () {
    var map = L.map('map').setView([50.85, 5.95], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Voeg markers toe voor de bezienswaardigheden
    fetch('data/challenges.json')
        .then(response => response.json())
        .then(data => {
            data.forEach(challenge => {
                L.marker([challenge.lat, challenge.lon]).addTo(map)
                    .bindPopup(`<b>${challenge.location}</b><br>${challenge.challenge}`);
            });
        });
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

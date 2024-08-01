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

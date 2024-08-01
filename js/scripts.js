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
            map.setMaxBounds(bounds.pad(0.5)); // Stel de maximale bounds in met een padding
        })
        .catch(error => console.error('Error loading challenges:', error));

    // Teams en leaderboard functionaliteit
    const teamForm = document.getElementById('team-form');
    const teamNameInput = document.getElementById('team-name');
    const memberNamesInput = document.getElementById('member-names');
    const leaderboardTableBody = document.querySelector('#leaderboard-table tbody');
    let teams = loadTeams();

    // Laad teams vanuit localStorage
    function loadTeams() {
        const teams = localStorage.getItem('teams');
        return teams ? JSON.parse(teams) : [];
    }

    function saveTeams() {
        localStorage.setItem('teams', JSON.stringify(teams));
    }

    function updateLeaderboard() {
        leaderboardTableBody.innerHTML = '';
        teams.forEach(team => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${team.name}</td><td>${team.points}</td>`;
            leaderboardTableBody.appendChild(row);
        });
    }

    teamForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const teamName = teamNameInput.value.trim();
        const memberNames = memberNamesInput.value.trim().split(',').map(name => name.trim());
        if (teamName && !teams.find(team => team.name === teamName)) {
            teams.push({ name: teamName, members: memberNames, points: 0 });
            teamNameInput.value = '';
            memberNamesInput.value = '';
            updateLeaderboard();
            saveTeams();
        }
    });

    // Functie om scores bij te werken
    function updateTeamScore(teamName, points) {
        const team = teams.find(t => t.name === teamName);
        if (team) {
            team.points += points;
            updateLeaderboard();
            saveTeams();
        }
    }

    // Initial update
    updateLeaderboard();

    // Voorbeeld van het bijwerken van scores
    // updateTeamScore('Team A', 100);
});

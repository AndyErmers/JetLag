document.addEventListener('DOMContentLoaded', function () {
    // Firebase configuratie
    const firebaseConfig = {
        apiKey: "AIzaSyC8WF1NnRcvg4FOmuVjeGZaOAXUQFnpsRY",
        authDomain: "jetlag-952b5.firebaseapp.com",
        databaseURL: "https://jetlag-952b5-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "jetlag-952b5",
        storageBucket: "jetlag-952b5.appspot.com",
        messagingSenderId: "335048150581",
        appId: "1:335048150581:web:e8e1fc43f9c958c7746b7c",
        measurementId: "G-0DCQL9NZRN"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();

    // Kaart instellen
    var map = L.map('map').setView([50.85, 5.95], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var bounds = L.latLngBounds(); // Maak een lege bounds-object

    // Voeg markers toe voor de bezienswaardigheden vanuit Firebase
    database.ref('challenges').once('value').then(function (snapshot) {
        const challenges = snapshot.val();
        challenges.forEach(function (challenge) {
            var marker = L.marker([challenge.lat, challenge.lon]).addTo(map)
                .bindPopup(`<b>${challenge.location}</b><br>${challenge.challenge}`);
            bounds.extend(marker.getLatLng()); // Breid de bounds uit met elke marker
        });
        map.fitBounds(bounds); // Pas de kaart aan om alle markers te tonen
        map.setMaxBounds(bounds.pad(0.5)); // Stel de maximale bounds in met een padding
    }).catch(error => console.error('Error loading challenges:', error));

    // Teams en leaderboard functionaliteit
    const teamForm = document.getElementById('team-form');
    const teamNameInput = document.getElementById('team-name');
    const memberNamesInput = document.getElementById('member-names');
    const leaderboardTableBody = document.querySelector('#leaderboard-table tbody');
    const teamSelect = document.getElementById('team-select');
    const updateScoreForm = document.getElementById('update-score-form');
    const pointsInput = document.getElementById('points');

    // Laad teams vanuit Firebase
    database.ref('teams').on('value', function (snapshot) {
        let teams = snapshot.val();
        updateLeaderboard(teams);
        updateTeamSelect(teams);
    });

    function updateLeaderboard(teams) {
        leaderboardTableBody.innerHTML = '';
        for (const teamId in teams) {
            if (teams.hasOwnProperty(teamId)) {
                const team = teams[teamId];
                const row = document.createElement('tr');
                row.innerHTML = `<td>${team.name}</td><td>${team.points}</td>`;
                leaderboardTableBody.appendChild(row);
            }
        }
    }

    function updateTeamSelect(teams) {
        teamSelect.innerHTML = '';
        for (const teamId in teams) {
            if (teams.hasOwnProperty(teamId)) {
                const team = teams[teamId];
                const option = document.createElement('option');
                option.value = teamId;
                option.textContent = team.name;
                teamSelect.appendChild(option);
            }
        }
    }

    teamForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const teamName = teamNameInput.value.trim();
        const memberNames = memberNamesInput.value.trim().split(',').map(name => name.trim());
        database.ref('teams').once('value').then(snapshot => {
            const teams = snapshot.val() || {};
            if (teamName && memberNames.length && !Object.values(teams).find(team => team.name === teamName)) {
                const newTeamRef = database.ref('teams').push();
                newTeamRef.set({
                    name: teamName,
                    members: memberNames,
                    points: 0
                });
                teamNameInput.value = '';
                memberNamesInput.value = '';
            }
        });
    });

    updateScoreForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const teamId = teamSelect.value;
        const points = parseInt(pointsInput.value);
        if (teamId && !isNaN(points)) {
            database.ref(`teams/${teamId}`).once('value').then(snapshot => {
                const team = snapshot.val();
                const newPoints = (team.points || 0) + points;
                database.ref(`teams/${teamId}`).update({ points: newPoints });
                pointsInput.value = '';
            });
        }
    });
});

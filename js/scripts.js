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
                .bindPopup(`<b>${challenge.location}</b><br><button onclick="startChallenge('${challenge.location}')">Challenge starten?</button>`);
            bounds.extend(marker.getLatLng()); // Breid de bounds uit met elke marker
        });
        map.fitBounds(bounds); // Pas de kaart aan om alle markers te tonen
        map.setMaxBounds(bounds.pad(0.5)); // Stel de maximale bounds in met een padding
    }).catch(error => console.error('Error loading challenges:', error));

    // Teams en leaderboard functionaliteit
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

    // Modal functionality
    const modal = document.getElementById("challengeModal");
    const closeButton = document.querySelector(".close-button");

    closeButton.addEventListener("click", function () {
        modal.style.display = "none";
    });

    window.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    window.startChallenge = function (location) {
        database.ref('challenges').once('value').then(function (snapshot) {
            const challenges = snapshot.val();
            const challenge = challenges.find(ch => ch.location === location && ch.veroverd === false);
            if (challenge) {
                database.ref('opdrachten').once('value').then(function (opdrachtenSnapshot) {
                    const opdrachten = opdrachtenSnapshot.val();
                    const opdracht = opdrachten.find(op => op.niveau === 0);
                    if (opdracht) {
                        document.getElementById('challengeText').textContent = opdracht.opdracht;
                        document.getElementById('challengePoints').textContent = `Punten: ${opdracht.punten}`;
                        modal.style.display = "block";
                    }
                });
            }
        });
    };
});

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
        snapshot.val().forEach(function (challenge) {
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

    // Laad teams vanuit Firebase
    database.ref('teams').on('value', function (snapshot) {
        let teams = snapshot.val();
        updateLeaderboard(teams);
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

    teamForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const teamName = teamNameInput.value.trim();
        const memberNames = memberNamesInput.value.trim().split(',').map(name => name.trim());
        database.ref('teams').once('value').then(snapshot => {
            const teams = snapshot.val();
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

    // Laad en toon spelregels vanuit Firebase
    database.ref('rules').once('value').then(function (snapshot) {
        const rules = snapshot.val();
        const rulesSection = document.querySelector('#rules .rules-content');
        rulesSection.innerHTML = `
            <p><strong>Naam van de game:</strong> ${rules.name}</p>
            <p><strong>Genre:</strong> ${rules.genre}</p>
            <p><strong>Doel van het spel:</strong> ${rules.goal}</p>

            <h3>Benodigdheden</h3>
            <ul>${rules.requirements.map(item => `<li>${item}</li>`).join('')}</ul>

            <h3>Voorbereiding</h3>
            <ul>${rules.preparation.map(item => `<li>${item}</li>`).join('')}</ul>

            <h3>Website Functies</h3>
            <ul>${rules.websiteFeatures.map(item => `<li>${item}</li>`).join('')}</ul>

            <h3>Spelregels</h3>
            <ul>${rules.rules.map(item => `<li>${item}</li>`).join('')}</ul>

            <h3>Punten</h3>
            <ul>${rules.points.map(item => `<li>${item}</li>`).join('')}</ul>

            <h3>Winvoorwaarden</h3>
            <ul>${rules.winConditions.map(item => `<li>${item}</li>`).join('')}</ul>

            <h3>Voorbeeld</h3>
            ${rules.example.map(item => `<p>${item}</p>`).join('')}

            <h3>Tips en Strategieën</h3>
            <ul>${rules.tips.map(item => `<li>${item}</li>`).join('')}</ul>
        `;
    }).catch(error => console.error('Error loading rules:', error));
});

document.addEventListener('DOMContentLoaded', function () {
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

    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();

    var map = L.map('map').setView([50.85, 5.95], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var bounds = L.latLngBounds();

    function loadMarkers() {
        database.ref('challenges').once('value').then(function (snapshot) {
            const challenges = snapshot.val();
            challenges.forEach(function (challenge) {
                var marker = createColoredMarker(challenge['kleur?'], [challenge.lat, challenge.lon]);
                marker.addTo(map)
                    .bindPopup(`<b>${challenge.location}</b><br><button onclick="startChallenge('${challenge.location}')">Challenge starten?</button>`);
                bounds.extend(marker.getLatLng());
            });
            map.fitBounds(bounds);
            map.setMaxBounds(bounds.pad(0.5));
        }).catch(error => console.error('Error loading challenges:', error));
    }

    function loadLeaderboard() {
        const leaderboardTableBody = document.querySelector('#leaderboard-table tbody');
        database.ref('teams').once('value', snapshot => {
            const teams = snapshot.val();
            leaderboardTableBody.innerHTML = ''; // Clear existing rows
            Object.keys(teams).forEach(teamKey => {
                const team = teams[teamKey];
                const row = document.createElement('tr');
                row.innerHTML = `<td>${team.name}</td><td>${team.points}</td>`;
                leaderboardTableBody.appendChild(row);
            });
        });
    }

    function loadChallengesList() {
        const challengeList = document.getElementById('challenge-list');
        database.ref('challenges').once('value', snapshot => {
            const challenges = snapshot.val();
            challengeList.innerHTML = ''; // Clear existing list
            challenges.forEach(challenge => {
                const challengeDiv = document.createElement('div');
                challengeDiv.innerHTML = `<span>${challenge.location}</span> <button onclick="startChallenge('${challenge.location}')">Challenge</button>`;
                challengeList.appendChild(challengeDiv);
            });
        });
    }

    loadMarkers();
    loadLeaderboard();
    loadTeams();
    loadLocations();
    loadChallengesList();

    function loadTeams() {
        const teamSelect = document.getElementById('team-select');
        database.ref('teams').once('value', snapshot => {
            const teams = snapshot.val();
            teamSelect.innerHTML = ''; // Clear existing options
            Object.keys(teams).forEach(teamKey => {
                const team = teams[teamKey];
                const option = document.createElement('option');
                option.value = team.name; // Store team name directly
                option.textContent = team.name;
                teamSelect.appendChild(option);
            });
        });
    }

    function loadLocations() {
        const locationSelect = document.getElementById('location-select');
        database.ref('challenges').once('value', snapshot => {
            const challenges = snapshot.val();
            locationSelect.innerHTML = ''; // Clear existing options
            challenges.forEach(challenge => {
                const option = document.createElement('option');
                option.value = challenge.location;
                option.textContent = challenge.location;
                locationSelect.appendChild(option);
            });
        });
    }

    function conquerLocation() {
        const selectedTeam = document.getElementById('team-select').value;
        const selectedLocation = document.getElementById('location-select').value;

        const teamColorMap = {
            "Team Rood": "Red",
            "Team Blauw": "Blue",
            "Team Geel": "Yellow"
        };
        const teamColor = teamColorMap[selectedTeam] || '#FFFFFF'; // Default to white if no match

        database.ref('challenges').orderByChild('location').equalTo(selectedLocation).once('value', snapshot => {
            const challengeData = snapshot.val();
            const challengeKey = Object.keys(challengeData)[0];
            database.ref(`challenges/${challengeKey}`).update({
                'veroverd': true,
                'kleur?': teamColor
            }).then(() => {
                alert("Locatie succesvol veroverd!");
                loadMarkers(); // Reload markers to show changes
                loadChallengesList(); // Reload challenge list to reflect changes
            }).catch(error => {
                console.error('Error updating challenge:', error);
                alert("Fout bij het veroveren van de locatie.");
            });
        });
    }

    function createColoredMarker(color, latlng) {
        var finalColor = color || '#FFFFFF'; // Default to white if no color is provided

        var markerHtmlStyles = `
        background-color: ${finalColor};
        width: 2rem;
        height: 2rem;
        display: block;
        left: -1rem;
        top: -1rem;
        position: relative;
        border-radius: 2rem 2rem 0;
        transform: rotate(45deg);
        border: 1px solid #FFFFFF`;

        var icon = L.divIcon({
            className: "my-custom-pin",
            iconAnchor: [0, 24],
            labelAnchor: [-6, 0],
            popupAnchor: [0, -36],
            html: `<span style="${markerHtmlStyles}" />`
        });

        return L.marker(latlng, { icon: icon });
    }

    document.querySelector('#conquer-button').addEventListener('click', conquerLocation);
});

function startChallenge(location) {
    // Placeholder function
    alert(`Challenge started at ${location}`);
}


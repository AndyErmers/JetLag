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

    const hardResetPassword = 'HARD-RESET'; // Vervang dit door je eigen wachtwoord

    document.getElementById('top-right-input-button').addEventListener('click', () => {
        const enteredPassword = document.getElementById('top-right-input-field').value;
        if (enteredPassword === hardResetPassword) {
            hardReset();
        } else {
            alert('Incorrect password');
        }
    });

    function hardReset() {
        database.ref('challenges').once('value').then(snapshot => {
            snapshot.forEach(challenge => {
                database.ref(`challenges/${challenge.key}`).update({
                    veroverd: false,
                    'kleur?': null
                });
            });
        });

        database.ref('opdrachten').once('value').then(snapshot => {
            snapshot.forEach(opdracht => {
                database.ref(`opdrachten/${opdracht.key}`).update({
                    voltooid: false
                });
            });
        });

        alert("Hard reset uitgevoerd!");
        location.reload(); // Reload the page to reflect changes
    }

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
            map.fitBounds(bounds, { padding: [20, 20] }); // Adjust the padding as needed
            map.setMaxBounds(bounds.pad(0.5));
        }).catch(error => console.error('Error loading challenges:', error));
    }

    function loadLeaderboard() {
        const leaderboardTableBody = document.querySelector('#leaderboard-table tbody');
        database.ref('challenges').once('value', snapshot => {
            const challenges = snapshot.val();
            const teamCounts = { "Red": 0, "Blue": 0, "Yellow": 0 };

            challenges.forEach(challenge => {
                if (challenge['veroverd'] && challenge['kleur?']) {
                    teamCounts[challenge['kleur?']] += 1;
                }
            });

            leaderboardTableBody.innerHTML = ''; // Clear existing rows
            Object.keys(teamCounts).forEach(color => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${color}</td><td>${teamCounts[color]}</td>`;
                leaderboardTableBody.appendChild(row);
            });
        }).catch(error => console.error('Error loading leaderboard:', error));
    }

    function loadChallengesList() {
        const challengeList = document.getElementById('challenge-list');
        database.ref('challenges').once('value', snapshot => {
            const challenges = snapshot.val();

            // Get all the tasks as well
            database.ref('opdrachten').once('value', taskSnapshot => {
                const tasks = taskSnapshot.val();

                challengeList.innerHTML = ''; // Clear existing list

                challenges.forEach(challenge => {
                    const challengeDiv = document.createElement('div');
                    challengeDiv.className = 'challenge-item';

                    // Create a task list for the current location
                    const tasksForLocation = Object.values(tasks).filter(task => task.locatie === challenge.location && !task.voltooid)
                        .map(task => `<li>${task.opdracht} </li>`)
                        .join('');

                    challengeDiv.innerHTML = `
                    <span>${challenge.location}</span>
                    <button onclick="startChallenge('${challenge.location}')">Challenge</button>
                `;

                    challengeList.appendChild(challengeDiv);
                });
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
        const modalTeamSelect = document.getElementById('modal-team-select');
        database.ref('teams').once('value', snapshot => {
            const teams = snapshot.val();
            teamSelect.innerHTML = ''; // Clear existing options
            modalTeamSelect.innerHTML = ''; // Clear existing options
            Object.keys(teams).forEach(teamKey => {
                const team = teams[teamKey];
                const option = document.createElement('option');
                option.value = team.name; // Store team name directly
                option.textContent = team.name;
                teamSelect.appendChild(option);

                // Add the same options to the modal team select
                const modalOption = document.createElement('option');
                modalOption.value = team.name;
                modalOption.textContent = team.name;
                modalTeamSelect.appendChild(modalOption);
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
        var finalColor = color || '#808080'; // Default to grey if no color is provided

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
        border: 1px solid #808080`;

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

    let currentOpdrachtKey;
    let currentLocation;

    window.startChallenge = function (location) {
        currentLocation = location; // Store the current location
        database.ref('opdrachten').once('value', snapshot => {
            const opdrachten = snapshot.val();

            // Split tasks into lists based on the given conditions
            let locationTasks = [];
            let niveau0Tasks = [];
            let niveau1Tasks = [];
            let niveau2Tasks = [];

            Object.values(opdrachten).forEach(opdracht => {
                if (!opdracht.voltooid) {
                    if (opdracht.locatie === location) {
                        locationTasks.push(opdracht);
                    } else if (opdracht.niveau === 0 && !opdracht.locatie) {
                        niveau0Tasks.push(opdracht);
                    } else if (opdracht.niveau === 1 && !opdracht.locatie) {
                        niveau1Tasks.push(opdracht);
                    } else if (opdracht.niveau === 2 && !opdracht.locatie) {
                        niveau2Tasks.push(opdracht);
                    }
                }
            });

            // Function to get a random task from a list
            function getRandomTask(tasks) {
                const randomIndex = Math.floor(Math.random() * tasks.length);
                return tasks[randomIndex];
            }

            let selectedTask = null;

            // Select a task based on the priority
            if (locationTasks.length > 0) {
                selectedTask = getRandomTask(locationTasks);
            } else if (niveau0Tasks.length > 0) {
                selectedTask = getRandomTask(niveau0Tasks);
            } else if (niveau1Tasks.length > 0) {
                selectedTask = getRandomTask(niveau1Tasks);
            } else if (niveau2Tasks.length > 0) {
                selectedTask = getRandomTask(niveau2Tasks);
            }

            if (selectedTask) {
                currentOpdrachtKey = Object.keys(opdrachten).find(key => opdrachten[key] === selectedTask);

                document.getElementById('challengeText').textContent = selectedTask.opdracht;
                document.getElementById('challengeModal').style.display = 'block';
            } else {
                alert("Geen beschikbare opdrachten voor deze locatie.");
            }
        });
    }

    document.querySelector('.close-button').addEventListener('click', () => {
        document.getElementById('challengeModal').style.display = 'none';
    });
    window.onclick = function (event) {
        if (event.target == document.getElementById('challengeModal')) {
            document.getElementById('challengeModal').style.display = 'none';
        }
    };

    document.getElementById('completeChallengeButton').addEventListener('click', () => {
        if (currentOpdrachtKey) {
            const selectedTeam = document.getElementById('modal-team-select').value;

            const teamColorMap = {
                "Team Rood": "Red",
                "Team Blauw": "Blue",
                "Team Geel": "Yellow"
            };
            const teamColor = teamColorMap[selectedTeam] || '#FFFFFF'; // Default to white if no match

            database.ref(`opdrachten/${currentOpdrachtKey}`).update({
                voltooid: true
            }).then(() => {
                database.ref('challenges').orderByChild('location').equalTo(currentLocation).once('value', snapshot => {
                    const challengeData = snapshot.val();
                    const challengeKey = Object.keys(challengeData)[0];
                    database.ref(`challenges/${challengeKey}`).update({
                        'veroverd': true,
                        'kleur?': teamColor
                    }).then(() => {
                        alert("Opdracht voltooid en locatie veroverd!");
                        document.getElementById('challengeModal').style.display = 'none';
                        loadMarkers(); // Reload markers to show changes
                        loadChallengesList(); // Reload challenge list to reflect changes
                    }).catch(error => {
                        console.error('Error updating challenge:', error);
                        alert("Fout bij het veroveren van de locatie.");
                    });
                });
            }).catch(error => {
                console.error('Error updating challenge:', error);
                alert("Fout bij het voltooien van de opdracht.");
            });
        }
    });
});

const options_scores = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Host': 'v1.hockey.api-sports.io',
		'X-RapidAPI-Key': '89a2439a92941c547d130eaa2b7a70c5'
	}
};

const odds_key = 'b5c739e9418e8dfd1c25c4ad92fe6cb8';

// This code to produce the date that will later be used was created by someone else.
// I used this code and not another API for the sake of simplicity. The original code was taken from:
// https://stackoverflow.com/questions/1531093/how-do-i-get-the-current-date-in-javascript
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

var date = yyyy + '-' + mm + '-' + dd;

var sportButtonsEl = document.querySelector("#nav-bar");
var scoreContainerEl = document.querySelector("#score-container");

// NHL League ID = 57, Season = 2021
// MLB League ID = 1, Season = 2022
// NBA League ID = 12, Season = 2021

// https://v1.hockey.api-sports.io/games?league=57&date=2022-04-01&season=2021 "icehockey_nhl"
// https://v1.basketball.api-sports.io/leagues "basketball_nba"
// https://v1.baseball.api-sports.io/leagues "baseball_mlb"
// https://api.the-odds-api.com/v4/sports/{sport}/odds/?apiKey={apiKey}&regions={regions}&markets={markets}

// Use the sports api to get the games being played on a given date.
var getScore = function(sport, id, season) {
    var apiUrl = "https://v1." + sport + ".api-sports.io/games?league=" + id + "&date=" + date + "&season=" + season + "&timezone=America/New_York";

    fetch(apiUrl, options_scores).then(function(response) {
        if(response.ok) {
            response.json().then(function(data) {
                var gamesArr = data.response;
                // Check to see if there's any games for the day being looked up. If not, give
                // a message to let the user know that there's no games to be shown.
                if(gamesArr.length == 0) {
                    var noGamesEl = document.createElement("h3");
                    noGamesEl.textContent = "No games to display.";
                    noGamesEl.className = "text-center";
                    scoreContainerEl.appendChild(noGamesEl);
                    return;
                }
                console.log(gamesArr);
                // Loop through all of the games on a given day and display them.
                // Most of this code just consists of creating elements and having them store
                // and display the values retrieved from within the array of games.
                for(var i = 0; i < gamesArr.length; i++) {
                    var newRow = document.createElement("div");
                    newRow.classList = "row rounded game";

                    var timeEl = document.createElement("span");
                    timeEl.setAttribute("class", "time");
                    timeEl.textContent = formatTime(gamesArr[i].time);

                    var matchupEl = document.createElement("div");
                    matchupEl.setAttribute("class", "matchup");

                    var homeTeamEl = document.createElement("div");
                    homeTeamEl.setAttribute("class", "home-team");

                    var homeOdds = document.createElement("span");
                    homeOdds.classList = "odds d-inline";
                    // TODO: get odds function to return home team's odds

                    var homeLogoEl = document.createElement("img");
                    homeLogoEl.className = "home-logo";
                    homeLogoEl.setAttribute("src", gamesArr[i].teams.home.logo);

                    var homeNameEl = document.createElement("p");
                    homeNameEl.classList = "home-name d-inline";
                    homeNameEl.textContent = gamesArr[i].teams.home.name;

                    var awayTeamEl = document.createElement("div");
                    awayTeamEl.setAttribute("class", "away-team");

                    var awayOdds = document.createElement("span");
                    awayOdds.classList = "odds d-inline";
                    // TODO: get odds function to return away team's odds

                    var awayLogoEl = document.createElement("img");
                    awayLogoEl.className = "away-logo";
                    awayLogoEl.setAttribute("src", gamesArr[i].teams.away.logo);

                    var awayNameEl = document.createElement("p");
                    awayNameEl.classList = "away-name d-inline";
                    awayNameEl.textContent = gamesArr[i].teams.away.name;

                    var scoresEl = document.createElement("div");
                    scoresEl.setAttribute("class", "score");

                    var homeScoreEl = document.createElement("p");
                    homeScoreEl.setAttribute("class", "home-score");
                    homeScoreEl.textContent = checkScore(gamesArr[i], "home");

                    var awayScoreEl = document.createElement("p");
                    awayScoreEl.setAttribute("class", "away-score");
                    awayScoreEl.textContent = checkScore(gamesArr[i], "away");

                    var periodEl = document.createElement("span");
                    periodEl.setAttribute("class", "period");
                    // TODO: Add function to make short status meanings more user friendly
                    periodEl.textContent = gamesArr[i].status.short;
                    
                    newRow.appendChild(timeEl);

                    homeTeamEl.appendChild(homeOdds);
                    homeTeamEl.appendChild(homeLogoEl);
                    homeTeamEl.appendChild(homeNameEl);
                    matchupEl.appendChild(homeTeamEl);

                    awayTeamEl.appendChild(awayOdds);
                    awayTeamEl.appendChild(awayLogoEl);
                    awayTeamEl.appendChild(awayNameEl);
                    matchupEl.appendChild(awayTeamEl);

                    scoresEl.appendChild(homeScoreEl);
                    scoresEl.appendChild(awayScoreEl);

                    newRow.appendChild(matchupEl);
                    newRow.appendChild(scoresEl);
                    newRow.appendChild(periodEl);
                    
                    scoreContainerEl.appendChild(newRow);
                }
            })
        } else {
            alert("Error.");
        }
    })
}

// Use "the odds" api to get the odds for the games being displayed
var getOdds = function(sport) {
    var apiSport = "";
    if(sport == "hockey") {
        apiSport = "icehockey_nhl";
    } else if(sport == "baseball") {
        apiSport = "baseball_mlb";
    } else if(sport == "basketball") {
        apiSport = "basketball_nba";
    }
    var apiUrl = "https://api.the-odds-api.com/v4/sports/" + apiSport + "/odds/?apiKey=" + odds_key + "&regions=us&markets=spreads&oddsFormat=american";

    fetch(apiUrl).then(function(response) {
        if(response.ok) {
            response.json().then(function(data) {
                console.log(data);
            })
        } else {
            alert("Error.");
        }
    })
}

// Format the 24-hour times given to us by the sports API
var formatTime = function(time) {
    var timeSplit = time.split(":");
    var dayEvening = "PM";
    var hour = parseInt(timeSplit[0]);
    var minutes = timeSplit[1];
    if(hour < 12) {
        dayEvening = "AM";
    } 
    if(hour > 12) {
        hour -= 12;
    }
    return hour + ':' + minutes + dayEvening;
}

// Return the scores of the games. If the given game has no score data because it hasn't started or
// has had other interruptions/cancelations, default to show a score of 0 instead of null.
var checkScore = function(game, team) {
    if(game.status.short == "POST" || game.status.short == "NS" || game.status.short == "CANC") {
        return 0;
    }
    // Check for undefined. Unfortunately the different API's have very slightly different object
    // structure when searching for the scores. Since a simple game.scores.team won't cover
    // every single case of searching for the score, we have to check for 2 different instances.
    if(team == "home") {
        if(game.scores.home.total !== undefined) {
            return game.scores.home.total;
        } else {
            return game.scores.home;
        }
    } else {
        if(game.scores.away.total !== undefined) {
            return game.scores.away.total;
        } else {
            return game.scores.away;
        }
    }
}

// Format to show a more meaningful value in the period (whether it's over, or the period/inning)
var formatPeriod = function(period) {

}

// Determine which sports button was clicked and display the proper data
var buttonClickHandler = function(event) {
    var sport = event.target.getAttribute("data-sport");
    var id = 0;
    var season = 0;

    if(sport === "hockey") {
        id = 57;
        season = 2021;
    } else if (sport === "baseball") {
        id = 1;
        season = 2022;
    } else if(sport === "basketball") {
        id = 12;
        season = "2021-2022";
    }
    // If a button is in fact clicked, clear whatever is in the score container, then
    // pass in the values from the conditions above
    if(sport) {
        scoreContainerEl.textContent = "";
        getScore(sport, id, season);
    }
}

getOdds("hockey");
sportButtonsEl.addEventListener("click", buttonClickHandler);
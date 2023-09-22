const express = require("express");
const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
let db = null;

const app = express();
app.use(express.json());

const initializeDbAndServerToRespond = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("server running at https:localhost:3000/")
    );
  } catch (e) {
    console.log(`DB ERROR: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServerToRespond();

const convertPlayerObject = (object) => {
  return {
    playerId: object.player_id,
    playerName: object.player_name,
  };
};

const convertToMatchObject = (object) => {
  return {
    matchId: object.match_id,
    match: object.match,
    year: object.year,
  };
};

//API-1

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT * FROM player_details;`;

  const players = await db.all(getPlayersQuery);
  response.send(players.map((each) => convertPlayerObject(each)));
});

//API-2

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const getPlayersIdQuery = `SELECT * FROM player_details
    WHERE player_id = ${playerId};`;

  const players = await db.get(getPlayersIdQuery);
  response.send(convertPlayerObject(players));
});

//API-4

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;

  const getPlayersQuery = `SELECT * FROM match_details
    WHERE match_id = ${matchId};`;

  const players = await db.get(getPlayersQuery);
  response.send(players.map((each) => convertToMatchObject(each)));
});

//API-3

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const putPlayerQuery = `UPDATE player_details 
    SET 
    player_name = ${playerName}
    WHERE player_id = ${playerId};`;

  await db.run(putPlayerQuery);

  response.send("Player Details Updated");
});

//API-5

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;

  const getPlayerMatchQuery = `SELECT * FROM player_match_details NATURAL JOIN 
      player WHERE player_id = ${playerId};`;

  const matchDetails = await db.all(getPlayerMatchQuery);

  response.send(convertPlayerObject(matchDetails));
});

//API-6

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;

  const getMatchIdQuery = `
    SELECT * FROM player_match_details NATURAL JOIN match_details WHERE match_id = ${matchId};`;

  const matchResults = await db.all(getMatchIdQuery);

  response.send(convertToMatchObject(matchResults));
});

//API-7

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;

  const getScoresIdQuery = `SELECT 
  player_id AS playerId,
      player_name AS playerName,
      SUM(score) AS totalScore,
      SUM(fours) AS totalFours,
      SUM(sixes) AS totalSixes
      FROM player_match_score NATURAL JOIN player_details
      WHERE player_id = ${playerId};`;

  const matchIdResults = await db.get(getScoresIdQuery);

  response.send(matchIdResults);
});

module.exports = app;

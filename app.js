/*
 * Core application logic (handles web requests from client, detects new client initializations via socket.io)
 * Much of this code borrowed from https://github.com/hawkrobe/MWERT/blob/master/app.js
 */

/*
 * To run this locally:
 * 1. cd rps/
 * 2. `node app.js`
 * 3. in browser, visit http://localhost:{PORT}/index.html
 */


// GLOBALS
const JSPATH = "/lib"; // path to static js files
const DEFAULT_PORT = 8856; // port for cogtoolslab server

// Server variables
var app = require("express")(); // initialize express server
let port = process.env.PORT;
if (port == null || port == "") {
  port = DEFAULT_PORT;
}
var server = app.listen(port); // listen on port 3000 (nginx will proxy requests on 80 to 3000)
var io = require("socket.io").listen(server); // initialize socket.io
var UUID = require("uuid"); // UUID library for generating unique IDs
var game_handler = require(__dirname + JSPATH + "/" + "game.js") // object for keeping track of games

// Initializing server
// General purpose getter for js files
app.get("/*", function(req, res) {
    var file = req.params[0];
    if (file == "admin") { // admin endpoint returns state of game server for quick debugging
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(game_handler.getState(), null, 3));
    } else {
        res.sendFile(__dirname + "/" + file);
    }
});

// socket.io will call this function when a client connects
io.on("connection", function (client) {
    console.log("app.js:\t new user connected");
    client.userid = UUID()
    // tell the client it connected successfully and pass along unique ID
    client.emit("onconnected", {id: client.userid});
    initializeClient(client);
});

// Function to handle socket interactions between game_server and clients
initializeClient = function(client) {
    // extract relevant info from client request
    var istest = client.handshake.query.istest == "true";
    var version = client.handshake.query.version;
    // SONA completion information
    client.sona = client.handshake.query.sona;
    client.experiment_id = client.handshake.query.experiment_id;
    client.credit_token = client.handshake.query.credit_token;
    client.survey_code = client.handshake.query.survey_code;
    // assign client to an existing game or start a new one
    // overload `version` -> can either be a version # (1, 2, 3, ..) or "pilot" which produces a series of 3 versions
    if (version === "pilot") {
        var versions = game_handler.getPilotVersions();
    }
    else {
        var versions = [version];
    }

    client.emit("startinstructions", {versions: versions});

    client.on("finished_instructions", function(data) {
        game_handler.createGame(client, versions, istest, index=1);
    })

    // handle player signal that they're ready for the next round
    client.on("next_round", function(data) {
        console.log("app.js:\t detected next round");
        game_handler.logTimes(client, data)
        game_handler.nextRound(client, data)
    });

    // handle player signal that they're ready for the next game
    client.on("next_game", function(data) {
        console.log("app.js:\t detected next game");
        game_handler.nextGame(client, data);
    });

    // handle player submitting exit survey slider data
    client.on("slider_submit", function(data) {
        console.log("app.js:\t detected player Likert slider submission");
        game_handler.recordSliderData(data);
    });

    // handle disconnect
    client.on("disconnect", function() {
        console.log("app.js:\t detected client disconnect");
        game_handler.clientDisconnect(client);
    });
};

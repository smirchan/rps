/*
 * Core game logic
 * Note: exports new GameHandler() for use by app.js when clients connect
 */

var fs = require("fs");
var UUID = require("uuid");
var weighted = require("weighted");
var _ = require("lodash");
var server_constants = require("./server_constants.js"); // constants
const GAME_ROUNDS = server_constants.constants.GAME_ROUNDS;
const DATAPATH = server_constants.constants.DATAPATH;
const VALID_MOVES = server_constants.constants.VALID_MOVES;
const POINTS = server_constants.constants.POINTS;
const TRANSITION_MOVE_MAP = server_constants.constants.TRANSITION_MOVE_MAP;
const BOT_STRATEGY_SET_NOVICE_SAME = server_constants.constants.BOT_STRATEGY_SET_NOVICE_SAME;
const BOT_STRATEGY_SET_NOVICE_SEQUENCE = server_constants.constants.BOT_STRATEGY_SET_NOVICE_SEQUENCE;
const BOT_STRATEGY_SET_EXPERT = server_constants.constants.BOT_STRATEGY_SET_EXPERT;
const BOT_STRATEGY_LOOKUP = server_constants.constants.BOT_STRATEGY_LOOKUP;
const BOT_RANDOM_MOVES = server_constants.constants.BOT_RANDOM_MOVES;


// /*
//  * Object class for keeping track of each RPS game
//  */
Game = function(game_id, client_id, version, istest, player1, player2, game_rounds, sona = 0, experiment_id = "", credit_token = "", survey_code = "", versions = [], index = 1) {
    this.game_id = game_id; // unique id for this game
    this.client_id = client_id; // unique id for the client
    this.version = version; // version for this game
    this.istest = istest; // whether this game is a test,
    this.player1 = player1; // rps_player object: first player to join
    this.player2 = player2; // rps_player object: second player to join
    this.game_rounds = game_rounds; // total number of rounds to play in this game

    this.sona = sona; // whether this is a SONA online study (rather than in the lab)
    this.experiment_id = experiment_id; // experiment id if this is a SONA online study
    this.credit_token = credit_token; // credit token if this is a SONA online study
    this.survey_code = survey_code; // survey code if this is a SONA online study
    
    this.current_round_index = 0; // numeric: current round
    this.current_round = null; // rps_round object: depicts round currently in play
    this.player1_points_total = 0; // numeric: total points for player1
    this.player2_points_total = 0; // numeric: total points for player2
    this.previous_rounds = []; // list: previous rps_round objects for this game
    this.game_begin_ts = 0; // numeric: unix timestamp when game began

    this.survey_responses = []
    this.versions = versions
    this.index = index
}


// /*
//  * Object class for keeping track of each RPS round, i.e., one match between two players in a game
//  * NB: some of these fields are redundant with fields in Game but allow each round to stand alone if need be
//  */
Round = function(game) {
    this.game_id = game.game_id; // unique id for the game this round belongs to
    this.round_index = game.current_round_index; // numeric: round number
    this.player1_move = null; // VALID_MOVES item: player1's move
    this.player2_move = null; // VALID_MOVES item: player2's move
    this.player1_ability = null;
    this.denoised_player2_move = null; // VALID_MOVES item: player2's move assuming no noise
    this.player1_outcome = null; // rps_outcome item for player 1
    this.player2_outcome = null; // rps_outcome item for player 2
    this.player1_points = 0; // numeric: points for player1 in this round
    this.player2_points = 0; // numeric: points for player2 in this round
    this.player1_points_total = game.player1_points_total; // numeric: total points for player 1 *at beginning of round*
    this.player2_points_total = game.player2_points_total; // numeric: total points for player 2 *at beginning of round*
    this.round_begin_ts = null; // numeric: unix timestamp when both players began the round
    this.round_results_begin_ts = null; // numeric: unix timestamp when results are shown
    this.round_results_end_ts = null; // numeric: unix timestamp when next button is clicked
}


SimulatedLearningAgent = function(initial_ability, final_ability, game_rounds) {
    this.initial_ability = initial_ability
    this.final_ability = final_ability
    this.game_rounds = game_rounds
    this.oracle_strategy_transitions = TRANSITION_MOVE_MAP["+"]
}


BotAgent = function(ability) {
    this.ability = ability
    this.ability_description = null;
    if (ability == "novice-same") {
        this.fixed_strategy = _.sample(BOT_STRATEGY_SET_NOVICE_SAME);
        this.ability_description = "novice";
    }
    if (ability == "novice-sequence") {
        this.fixed_strategy = _.sample(BOT_STRATEGY_SET_NOVICE_SEQUENCE);
        this.ability_description = "novice";
    }
    if (ability.includes("expert")) {
        this.fixed_strategy = _.sample(BOT_STRATEGY_SET_EXPERT);
        this.ability_description = "expert";
    }
    console.log("game.js\t: game strategy: ", this.fixed_strategy);
    this.fixed_strategy_transitions = BOT_STRATEGY_LOOKUP[this.fixed_strategy]
}


// Utility function to evaluate whether a sequence of moves constituted a "+", "-", or "0" transition
// NB: this does not handle "none" moves so calling function must deal with that
// TODO replace this to server_constants.js:TRANSITION_LOOKUP
BotAgent.prototype.evaluateTransition = function(move1, move2) {
    if (move1 == move2) {
        return "0";
    } else if ((move1 == "rock" && move2 == "paper") ||
                (move1 == "paper" && move2 == "scissors") ||
                (move1 == "scissors" && move2 == "rock")) {
        return "+";
    } else if ((move1 == "rock" && move2 == "scissors") ||
                (move1 == "paper" && move2 == "rock") ||
                (move1 == "scissors" && move2 == "paper")) {
        return "-";
    }
};


// Function to choose a move based on a bot's fixed strategy
BotAgent.prototype.chooseMove = function(game) {
    console.log("game.js:\t strategy:", this.fixed_strategy)
    if (game.current_round_index == 1 ||
            this.fixed_strategy == "outcome_transition_dual_dependency" && game.current_round_index == 2) {
        // sample randomly from "rock", "paper", "scissors"
        return [weighted.select(BOT_RANDOM_MOVES), weighted.select(BOT_RANDOM_MOVES)];
    } else {
        // round index is 1-indexed, we want one behind the current round, 0-indexed
        var prev_round = game.previous_rounds[game.current_round_index - 2];
        // get bot's outcome in the previous round for determining its next move probabilities
        var prev_outcome = prev_round.player2_outcome;
        // If bot is using its opponent's previous move to determine next move, fetch its opponent's previous move
        if (this.fixed_strategy == "opponent_prev_move_positive" || this.fixed_strategy == "opponent_prev_move_nil") {
            var prev_move = prev_round.player1_move;
        } else {
        // In all other conditions, bot is using its own previous move so fetch bot's previous move
            var prev_move = prev_round.player2_move;
        }
        // If using a transition-dependent strategy (not just move or outcome), get previous transition
        if (this.fixed_strategy == "outcome_transition_dual_dependency") {
            var prev_round2 = game.previous_rounds[game.current_round_index - 3];
            var prev_move2 = prev_round2.player2_move;
            var prev_transition = this.evaluateTransition(prev_move2, prev_move);

            if (!prev_move || prev_move == "none" || !prev_outcome || !prev_move2 || prev_move2 == "none" || !prev_transition) {
                // If we're unable to make a strategic choice because previous moves are uninformative, choose randomly
                return [weighted.select(BOT_RANDOM_MOVES), weighted.select(BOT_RANDOM_MOVES)];
            } else {
                // Select move based on previous outcome and transition
                // NB: this object is nested one layer more than other strategy transitions
                var weights = this.fixed_strategy_transitions[prev_outcome][prev_transition][prev_move];
                return [weighted.select(weights), Object.keys(weights).reduce(function(a, b){ return weights[a] > weights[b] ? a : b })];
            }
        }

        // Choose move based on previous outcome and relevant previous move
        if (!prev_move || prev_move == "none" || !prev_outcome) {
            // If previous move was none, we have nothing to use to decide a move: sample randomly from "rock", "paper", "scissors"
            // NB: prev_move and/or prev_outcome can also be null if prev_round has a null player1_move; this can happen due to server restarts
            return [weighted.select(BOT_RANDOM_MOVES), weighted.select(BOT_RANDOM_MOVES)];
        } else {
            // Select move based on probabilities associated with transition from whichever previous move is relevant to this strategy
            //  (and previous outcome)
            var weights = this.fixed_strategy_transitions[prev_outcome][prev_move];
            return [weighted.select(weights), Object.keys(weights).reduce(function(a, b){ return weights[a] > weights[b] ? a : b })];
        }
    }
};


SimulatedLearningAgent.prototype.chooseMove = function(game, current_ability) {
    if (weighted.select({"oracle": current_ability, "random": 1 - current_ability}) == "oracle") {
        return this.oracle_strategy_transitions[game.current_round.denoised_player2_move]
    }
    else {
        return weighted.select(BOT_RANDOM_MOVES);
    }
}


// Function to select and register a move in the current game
BotAgent.prototype.makeMove = function(game) {
    var move_and_denoised_move = this.chooseMove(game);
    var move = move_and_denoised_move[0];
    var denoised_move = move_and_denoised_move[1];
    console.log("game.js:\t received bot move: ", move, "(denoised move: ", denoised_move, ")");

    // Update current round based on bot's selected move
    var current_round = game.current_round;
    current_round.denoised_player2_move = denoised_move;
    current_round.player2_move = move;
    game.current_round = current_round;

    return game;
};


SimulatedLearningAgent.prototype.makeMove = function(game) {
    var ability = this.initial_ability + (this.final_ability - this.initial_ability) * (game.current_round_index / this.game_rounds);
    var move = this.chooseMove(game, ability);
    console.log("game.js:\t received agent move: ", move);

    // Update current round based on bot's selected move
    var current_round = game.current_round;
    current_round.player1_move = move;
    current_round.player1_ability = ability;
    game.current_round = current_round;

    return game;
}


/*
 * Object class for keeping track of the RPS games being played
 * This is the work-horse of the server side game logic and the only thing visible to app.js
 */
GameHandler = function() {
    this.active_games = {}; // dict: mapping from game_id to Game objects currently in play or awaiting more players
};


// Admin function to return active game state of this game server.
// Returns a dictionary with each active game and the current round index in that game.
// Used for /admin requests to ensure clean game state before running participants and to
// monitor state of each game while running participants
GameHandler.prototype.getState = function() {
    var stateObj = {};
    for (elem in this.active_games) {
        stateObj[elem] = {'round_index': this.active_games[elem].current_round_index,
                          'game_index': this.active_games[elem].index};
    }
    return stateObj;
};


// // Util function to copy over relevant game attributes for sending to client
// // NB: to avoid copying large(ish) amounts of data, we don't copy previous_rounds array here
GameHandler.prototype.copyGameVals = function(game) {
    return {
        game_id: game.game_id,
        istest: game.istest,
        game_rounds: game.game_rounds,
        player1: game.player1,
        player2: game.player2,
        current_round_index: game.current_round_index,
        current_round: game.current_round,
        player1_points_total: game.player1_points_total,
        player2_points_total: game.player2_points_total
    };
};


// Util function to fetch the current game that a particular client belongs to
GameHandler.prototype.getCurrentGame = function(client) {
    for (game_id in this.active_games) {
        current_game = this.active_games[game_id];
        if (current_game.client_id == client.userid) {
            return current_game;
        }
    }
};


GameHandler.prototype.newGame = function(client, versions, istest, index) {
    var version = versions[index - 1];
    console.log("game.js:\t creating new game for client: ", client.userid, "\t version: ", version);

    // NB: getPilotVersions (game.js) and the constructor in instructions.js depend on this hand-coding of opponent / agent pairs
    if (version == "1") {
        opponent = new BotAgent("novice-same")
        agent = new SimulatedLearningAgent(0, 0, GAME_ROUNDS)
    }
    if (version == "2") {
        opponent = new BotAgent("novice-same")
        agent = new SimulatedLearningAgent(0, 0.5, GAME_ROUNDS)
    }
    if (version == "3") {
        opponent = new BotAgent("novice-same")
        agent = new SimulatedLearningAgent(0.5, 0.5, GAME_ROUNDS)
    }
    if (version == "4") {
        opponent = new BotAgent("novice-sequence")
        agent = new SimulatedLearningAgent(0, 0, GAME_ROUNDS)
    }
    if (version == "5") {
        opponent = new BotAgent("novice-sequence")
        agent = new SimulatedLearningAgent(0, 0.5, GAME_ROUNDS)
    }
    if (version == "6") {
        opponent = new BotAgent("novice-sequence")
        agent = new SimulatedLearningAgent(0.5, 0.5, GAME_ROUNDS)
    }
    if (version == "7") {
        opponent = new BotAgent("expert")
        agent = new SimulatedLearningAgent(0, 0, GAME_ROUNDS)
    }
    if (version == "8") {
        opponent = new BotAgent("expert")
        agent = new SimulatedLearningAgent(0, 0.5, GAME_ROUNDS)
    }
    if (version == "9") {
        opponent = new BotAgent("expert")
        agent = new SimulatedLearningAgent(0.5, 0.5, GAME_ROUNDS)
    }
    newgame_id = UUID()
    var newgame = new Game(id=newgame_id, client_id=client.userid, version=version, istest=istest, player1=agent, player2=opponent, 
        total_rounds=GAME_ROUNDS, sona = client.sona, experiment_id = client.experiment_id, credit_token = client.credit_token,
        survey_code = client.survey_code, versions = versions, index = index);
    
    return newgame;
}


// Function to create a new game and add this client as the first player
GameHandler.prototype.createGame = function(client, versions, istest, index) {
    newgame = this.newGame(client, versions, istest, index);
    // Add game to game server directory of games in play
    this.active_games[newgame_id] = newgame;
    // Update client telling them they're waiting and giving them the game id
    client.emit("newgame", {game_id: newgame_id, index: newgame.index, opponent_ability: newgame.player2.ability_description});
    newgame.game_begin_ts = new Date();
};


GameHandler.prototype.nextGame = function(client, data) {
    current_game = this.getCurrentGame(client);
    this.writeData(current_game);
    versions = current_game.versions;
    istest = current_game.istest;
    index = current_game.index + 1;
    delete this.active_games[current_game.game_id];
    this.createGame(client, versions, istest, index);
}


// Function to get versions for a three game series (randomly chosen opponent; three agent types in a random order)
GameHandler.prototype.getPilotVersions = function() {
        opponents = {4: 1/2, // novice-sequence
                     7: 1/2  // expert
                    }
        agent_offsets = _.shuffle([0, 1, 2])  // low-competence, learning, high-competence -> shuffle

        opponent_idx = weighted.select(opponents);
        game_versions = [];
        console.log(agent_offsets.length)
        for (var i = 0; i < agent_offsets.length; i++) {
            game_versions.push((parseInt(opponent_idx) + agent_offsets[i]).toString());
        }
        console.log("game.js:\t", game_versions);
        return game_versions;
}


// Take in an rps_round object and determine the winner, fill in other relevant data.
// Returns the rps_round filled in
GameHandler.prototype.evaluateRoundOutcome = function(rps_round) {
    console.log("game.js:\t evaluating round outcome");
    if (VALID_MOVES.indexOf(rps_round.player1_move) != -1 && VALID_MOVES.indexOf(rps_round.player2_move) != -1) {
        // All possible tie outcomes
        if (rps_round.player1_move == rps_round.player2_move) {
            player1_outcome = "tie";
            player2_outcome = "tie";
        // Player 1 wins
        } else if ((rps_round.player1_move == "rock" && rps_round.player2_move == "scissors") ||
            (rps_round.player1_move == "paper" && rps_round.player2_move == "rock") ||
            (rps_round.player1_move == "scissors" && rps_round.player2_move == "paper") ||
            (rps_round.player2_move == "none")) {
            player1_outcome = "win";
            player2_outcome = "loss";
        } else {
        // All other: player 2 wins
            player1_outcome = "loss";
            player2_outcome = "win";
        }
        rps_round.player1_outcome = player1_outcome;
        rps_round.player2_outcome = player2_outcome;
        rps_round.player1_points = POINTS[player1_outcome];
        rps_round.player2_points = POINTS[player2_outcome];
    }
    return rps_round;
};


// Received signal from client that we're ready for next round.
// Similar to receiving initial move, we tell the first client to wait for opponent.
// When both are ready, we update them accordingly.
GameHandler.prototype.nextRound = function(client, data) {
    console.log("game.js:\t next round request from client: ", client.userid);
    // Identify game and round information based on the client
    current_game = this.getCurrentGame(client);

    if (current_game.current_round_index == GAME_ROUNDS) {
        if (current_game.index >= current_game.versions.length) {
            client.emit("finishedexperiment");
        }
        else {
            client.emit("finishedgame");
        }
        return;
    }
    current_game.current_round_index += 1;
    console.log("game.js:\t round index:", current_game.current_round_index);
    if (current_game.current_round_index > 1) {
        current_round = current_game.current_round
        current_game.previous_rounds.push(current_round)
    }
    var new_round = new Round(current_game);
    current_game.current_round = new_round
    current_game = current_game.player2.makeMove(current_game);
    console.log("game.js:\t player2 move ->", current_game.current_round.player2_move)
    current_game = current_game.player1.makeMove(current_game);

    current_round = this.evaluateRoundOutcome(current_game.current_round);
    current_round.round_begin_ts = new Date();
    current_game.current_round = current_round;
    current_game.player1_points_total += current_round.player1_points; // update game total points
    current_game.player2_points_total += current_round.player2_points; // update game total points
    // Update both clients (or single client if playing against a bot)
    this.active_games[current_game.game_id] = current_game;

    client.emit("roundcomplete", this.copyGameVals(current_game))
    if (current_game.current_round_index % 5 == 0) {
        client.emit("showsurveybutton")
    }
};


GameHandler.prototype.logTimes = function(client, data) {
    console.log("game.js:\t times received from client");
    current_game = this.getCurrentGame(client);

    if (current_game.current_round_index > 0) {
        current_game.current_round.round_results_begin_ts = data.round_results_begin_ts;
        current_game.current_round.round_results_end_ts = data.round_results_end_ts;
    }
}


// One of the clients disconnected
// If this was unexpected, notify the other client and end this game
// If the game was already over, don't do anything
GameHandler.prototype.clientDisconnect = function(client) {
    console.log("game.js:\t disconnect from client: ", client.userid);
    var current_game = this.getCurrentGame(client);
    // If there's still a game in progress, save and delete it
    if (current_game) {
        this.writeData(current_game);
        delete this.active_games[current_game.game_id];
    }
};


GameHandler.prototype.getFilename = function(current_game) {
    var filename = __dirname + DATAPATH + "/";
    if (current_game.istest == true) {
        filename += "test_";
    }

    filename += current_game.client_id + "_" + current_game.index + ".json";

    return filename;
}


// Write results of this game to json
// NB: conversion of this json to long format csv is handled by a separate python script outside this repo
GameHandler.prototype.writeData = function(current_game) {
    filename = this.getFilename(current_game);
    // Make sure we have baseline data to write to file
    if (current_game.game_id && current_game.player1 && current_game.player2) {
        console.log("game.js:\t writing game results to file: ", filename);
        data_obj = {
            game_id: current_game.game_id,
            client_id: current_game.client_id,
            version: current_game.version,
            versions: current_game.versions,
            index: current_game.index,
            istest: current_game.istest,
            game_rounds: current_game.game_rounds,
            
            sona: current_game.sona,
            experiment_id: current_game.experiment_id,
            credit_token: current_game.credit_token,
            survey_code: current_game.survey_code,
            
            player2_ability_description: current_game.player2.ability_description,
            player2_strategy: current_game.player2.fixed_strategy,
            player1_initial_ability: current_game.player1.initial_ability,
            player1_final_ability: current_game.player1.final_ability,
            game_begin_ts: current_game.game_begin_ts,
            rounds: [],
            survey_responses: []
        };
        // Add data for each round
        for (round_idx in current_game.previous_rounds) {
            round = current_game.previous_rounds[round_idx];
            round_obj = {
                round_index: round.round_index,
                player1_move: round.player1_move,
                player2_move: round.player2_move,
                player1_ability: round.player1_ability,
                denoised_player2_move: round.denoised_player2_move,
                player1_outcome: round.player1_outcome,
                player2_outcome: round.player2_outcome,
                player1_points: round.player1_points,
                player2_points: round.player2_points,
                player1_points_total: round.player1_points_total,
                player2_points_total: round.player2_points_total,
                round_begin_ts: round.round_begin_ts,
                round_results_begin_ts: round.round_results_begin_ts,
                round_results_end_ts: round.round_results_end_ts
            };
            data_obj.rounds.push(round_obj);
        }
        data_obj.survey_responses = current_game.survey_responses;
        
        data_str = JSON.stringify(data_obj, null, 2);
        // console.log("game.js:\t results string: ", data_str);
        fs.writeFile(filename, data_str, (err) => {
            if (err) throw err;
            console.log("game.js:\t game data successfully written to file.");
        });
    }
};


// Write slider exit survey results to json
GameHandler.prototype.recordSliderData = function(data) {
    console.log("game.js:\t writing slider data.");

    game = this.active_games[data.game_id];
    game.survey_responses.push({
        "round_index": game.current_round_index,
        "slider_1": data.slider_1,
        "slider_2": data.slider_2
    });
    this.active_games[data.game_id] = game;
    this.writeData(game);
};


var game_handler = new GameHandler();
module.exports = game_handler

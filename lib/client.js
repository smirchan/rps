/*
 * Core client-side functionality
 * Some of this is borrowed from https://github.com/hawkrobe/MWERT/blob/master/game.client.js
 */


// global for keeping track of the player object for this client
var THIS_PLAYER = {
    // Defaults for SONA online completion, the below are overriden if it's a SONA online study
    sona: 0,
    experiment_id: "",
    credit_token: "",
    survey_code: ""
};

// Start up: load consent page with callback to connect to server
$(window).ready(function() {
    $("body").load(HTML_LOOKUP["consent"], function() {
        $("#credit").text(STUDY_CREDITS);
        $("#duration").text(STUDY_DURATION);
        $("#consent-button").click(connect_to_server);
    });
});



connect_to_server = function() {
    var game = {};
    initialize_game(game); // sets game attributes, loads html
    // pass in relevant features on connection (this seems a bit hacky...)
    game.socket = io.connect("", {query: {istest: game.istest.toString(),
                                            version: game.version.toString(),
                                            sona: THIS_PLAYER.sona.toString(),
                                            experiment_id: THIS_PLAYER.experiment_id.toString(),
                                            credit_token: THIS_PLAYER.credit_token.toString(),
                                            survey_code: THIS_PLAYER.survey_code.toString()}});
    // Map out function bindings for various messages from the server
    game.socket.on("onconnected", client_onconnected.bind(THIS_PLAYER));
    game.socket.on("startinstructions", client_startinstructions.bind(game));
    game.socket.on("newgame", client_newgame.bind(game))
    game.socket.on("roundcomplete", display_results.bind(game));
    game.socket.on("showsurveybutton", display_survey_button.bind(game))
    game.socket.on("showsurvey", display_survey.bind(game))
    game.socket.on("finishedgame", client_finishedgame.bind(game))
    game.socket.on("finishedexperiment", client_finishedexperiment.bind(game))
};


// Initialization for game object: parses html, assigns attributes, and loads stub html for game
initialize_game = function(game) {
    // URL parsing
    // ex. http://localhost:3000/index.html?&mode=test&ver=2
    // Sample SONA link: http://lambdaserver.ucsd.edu/index.html?&ver=2&sona=1&survey_code=1859
    game.istest = false
    game.version = 1
    game.round_results_begin_ts = null;
    game.round_results_end_ts = null;
    var urlParams = (new URL(document.location)).searchParams;
    if (urlParams.has("mode") && urlParams.get("mode").includes("test")) {
        game.istest = true;
    }
    if (urlParams.has("ver") && urlParams.get("ver").includes("pilot")) {
        game.version = urlParams.get("ver");
    }
    else if (urlParams.has("ver")) {
        game.version = parseInt(urlParams.get("ver"))
    }
    if (urlParams.has("sona") && urlParams.get("sona").includes("1")) {
        THIS_PLAYER.sona = 1;
        THIS_PLAYER.experiment_id = EXPERIMENT_ID;
        THIS_PLAYER.credit_token = CREDIT_TOKEN;
        if (urlParams.has("survey_code")) {
            THIS_PLAYER.survey_code = urlParams.get("survey_code");
        }
    }
    console.log("client.js:\t initializing game. \n\tTEST: ", game.istest, "\n\tVERSION: ", game.version);
    console.log("client.js:\t Participant SONA info: \n\tSONA = ", THIS_PLAYER.sona,
                "; \n\texperiment id = ", THIS_PLAYER.experiment_id, "; \n\tcredit token = ", THIS_PLAYER.credit_token,
                "; \n\tsurvey code = ", THIS_PLAYER.survey_code);
}


client_onconnected = function(data) {
    this.client_id = data.id;
}


client_startinstructions = function(data) {
    var urlParams = (new URL(document.location)).searchParams;
    if (urlParams.has("mode") && urlParams.get("mode").includes("noinstructions")) {
        this.socket.emit("finished_instructions");
    }
    else {
        console.log(data.versions);
        callback = function() {
            this.socket.emit("finished_instructions");
        }
        inst = new Instructions(HTML_LOOKUP["trust_instructions"], data.versions, callback.bind(this));
        inst.run();
    }
}


client_newgame = function(data) {
    console.log("client.js:\t new game available");
    this.game_id = data.game_id;
    this.index = data.index;
    this.opponent_ability = data.opponent_ability;
    var index = this.index;
    var opponent_ability = this.opponent_ability;
    THIS_PLAYER.game_id = data.game_id;
    $("body").load(HTML_LOOKUP["trust_experiment"], function() {
        set_agent_header(index, opponent_ability)
        display_message(NEWGAME_READY, hideall = false);
        show_next_button(request_next_round.bind(this), "Play Next Round");
    }.bind(this));
}


request_next_round = function() {
    this.round_results_end_ts = new Date();
    this.socket.emit("next_round", {"round_results_begin_ts": this.round_results_begin_ts, "round_results_end_ts": this.round_results_end_ts})
}


load_and_request_next_round = function() {
    callback = function() {
        set_agent_header(this.index, this.opponent_ability);
        this.socket.emit("next_round", {});
        show_next_button(request_next_round.bind(this), "Play Next Round");
    }
    $("body").load(HTML_LOOKUP["trust_experiment"], callback.bind(this));
}


// We've heard back from the server that the round is complete: display the results
// data passed in here is a copy of the rps_game object
display_results = function(data) {
    // Determine outcome for this client based on round results
    console.log("client.js:\t displaying results of round with game: ", data);

    show_thinking(finish_displaying_results.bind(this), data);
};


show_thinking = function(callback, data) {
    console.log("client.js:\t show_thinking")
    update_background("none");
    unhighlight_moves();
    disable_button();
    display_message("Players are thinking...");
    update_round(data.current_round_index, data.game_rounds)
    countdown = COUNTDOWN + 1;
    var check = function(){
        if(countdown == 1){
            callback(data);
        }
        else {
            countdown = countdown - 1;
            set_countdown(countdown);
            setTimeout(check, COUNTDOWN_PAUSE);
        }
    }
    check();
}


finish_displaying_results = function(data) {
    agent_outcome = data.current_round.player1_outcome;
    agent_move = data.current_round.player1_move;
    opponent_move = data.current_round.player2_move;
    if (agent_outcome == "win") {
        outcome_text = "Agent " + this.index + " won this round!";
    } else if (agent_outcome == "loss") {
        outcome_text = "Agent " + this.index + " lost this round.";
    } else if (agent_outcome == "tie") {
        outcome_text = "This round was a tie.";
    }

    // // Display html elements relevant to the results
    display_message(outcome_text, hideall = false);
    update_background(agent_outcome);
    highlight_agent_move(agent_move);
    highlight_opponent_move(opponent_move);

    // Track when participant is first shown results (for later analysis of how long participants viewed results)
    this.round_results_begin_ts = new Date();
    enable_button();
    remove_countdown();
}


display_survey_button = function(data) {
    callback = display_survey.bind(this);
    show_next_button(callback, "Continue");
}


log_survey_responses = function(data) {
    callback = load_and_request_next_round.bind(this);
    slider_data = {
        game_id: THIS_PLAYER.game_id,
        slider_1: parseInt($("input[type='radio'][name='radio-1']:checked").val()),
        slider_2: parseInt($("input[type='radio'][name='radio-2']:checked").val()),
    };
    this.socket.emit("slider_submit", slider_data);
    callback();
}


display_survey = function(data) {
    console.log("client.js:\t displaying survey")
    callback = log_survey_responses.bind(this);
    var index = this.index;
    $("body").load(HTML_LOOKUP["trust_survey"], function() {
        display_message(SURVEY_SLIDER_HEADER.replace("*", index));
        set_survey_1(SURVEY_SLIDER_MESSAGE_1.replace("*", index));
        set_survey_2(SURVEY_SLIDER_MESSAGE_2.replace("*", index));
        disable_button();
        var slider1Clicked = false;
        var slider2Clicked = false;
        $('input[type="radio"][name="radio-1"]').on('click', function(e) {
            slider1Clicked = true;
            if (slider1Clicked && slider2Clicked) {
                enable_button();
            }
        });
        $('input[type="radio"][name="radio-2"]').on('click', function(event) {
            slider2Clicked = true;
            if (slider1Clicked && slider2Clicked) {
                enable_button();
            }
        });
        show_next_button(callback, "Submit and Continue to Next Round");
    })
}


// Intermediate screen between games
client_finishedgame = function() {
    console.log("client.js:\t completion of game.");
    callback = function() {
        this.socket.emit("next_game");
    }
    display_message(FINISHED_GAME_HEADER.replace("*", this.index));
    $("#inner-game-container").html("<h2>" + FINISHED_GAME_SUBHEADER + "</h2>");

    show_next_button(callback.bind(this), "Continue");
};


// Replace all experiment html with end-of-experiment header message
client_finishedexperiment = function() {
    console.log("client.js:\t completion of experiment.");
    $("#sidebar").hide();
    $("#game-container").html("<h2>" + THANK_YOU + "</h2>");
    post_completion();
};


// // Utility function for handling SONA credit form posts
addHidden = function(id, value) {
	var input = document.createElement("input");
	input.setAttribute("type", "hidden");
	input.setAttribute("name", id);
	input.setAttribute("value", value);
	return(input);
};


// // Send SONA completion
post_completion = function() {
    // Sample URL:
    // https://ucsd.sona-systems.com/webstudy_credit.aspx?experiment_id=1768&credit_token=19421bc286424246b6b1e873e7a55a8e&survey_code=XXXX
    if (THIS_PLAYER.sona) {
        var form = document.createElement('form')
        form.method = 'GET';
        form.action = 'https://ucsd.sona-systems.com/webstudy_credit.aspx';
        form.appendChild(addHidden('experiment_id', THIS_PLAYER.experiment_id));
        form.appendChild(addHidden('credit_token', THIS_PLAYER.credit_token));
        form.appendChild(addHidden('survey_code', THIS_PLAYER.survey_code));
        document.body.appendChild(form);
        console.log("Attempting completion post to SONA: ", form);
        form.submit();
    }
};

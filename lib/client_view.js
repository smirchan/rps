/*
 * Client functions for interacting with html
 * These functions are pulled out of client.js for ease of interaction
 */


display_message = function(msg, hideall) {
    if (hideall) {
        hide_next_button();
        $("#game-container").css({visibility: "hidden"});
    }
    $("#message-container").text(msg);
};


set_survey_1 = function(msg) {
    $("#eval-slider-1-text").text(msg);
}


set_survey_2 = function(msg) {
    $("#eval-slider-2-text").text(msg);
}


set_agent_header = function(index, opponent_ability) {
    $("#agent-header").html("Your AI Assistant (Agent " + index + ")");
    if (opponent_ability === "expert") {
        $("#opponent-header").html("Opponent A (Expert)");
    }
    else if (opponent_ability === "novice") {
        $("#opponent-header").html("Opponent A (Novice)");
    }
    for (var i = 1; i <= 3; i++) {
        if (index === i) {
            $("#agent-" + i + "-label").addClass("agent-label-current");
            $("#agent-" + i + "-label").removeClass("agent-label");
        }
        else {
            $("#agent-" + i + "-label").removeClass("agent-label-current");
            $("#agent-" + i + "-label").addClass("agent-label");
        }
    }
    if (index === 1) {
        $("#agent-icon-img").attr("src", "img/blue-agent.jpg");
        $("#agent-header").addClass("blue");
        $("#agent-icon").addClass("blue-border");
    }
    else if (index === 2) {
        $("#agent-icon-img").attr("src", "img/purple-agent.jpg");
        $("#agent-header").addClass("purple");
        $("#agent-icon").addClass("purple-border");
    }
    else if (index === 3) {
        $("#agent-icon-img").attr("src", "img/teal-agent.jpg");
        $("#agent-header").addClass("teal");
        $("#agent-icon").addClass("teal-border");
    }
}


hide_next_button = function() {
    $("#exp-button-container").css({visibility: "hidden"});
};


show_next_button = function(callback, text="Play Next Round") {
    $("#exp-button-container").css({visibility: "visible"});
    $(".next-button").text(text);
    $(".next-button").unbind().click(callback);
};


highlight_opponent_move = function(opponent_move) {
    $(".opponent-move").css({opacity: "0.2"});
    $("#opponent-move-" + opponent_move).css({opacity: 1.0});
};


highlight_agent_move = function(agent_move) {
    $(".agent-move").css({opacity: "0.2"});
    $("#agent-move-" + agent_move).css({opacity: 1.0});
};


unhighlight_moves = function() {
    $(".agent-move").css({opacity: "0.2"});
    $(".opponent-move").css({opacity: "0.2"});
}


enable_button = function() {
    $("#next-round").css({opacity: "1.0"});
    $('#next-round').attr("disabled", false);
}


disable_button = function() {
    $("#next-round").css({opacity: "0.2"});
    $('#next-round').attr("disabled", true); 
}


set_countdown = function(number) {
    $("#countdown").css({visibility: "visible"});
    $("#countdown").text(number);
}


remove_countdown = function() {
    $("#countdown").css({visibility: "hidden"});
}


update_background = function(agent_outcome) {
    if (agent_outcome === "loss") {
        $("#experiment-container").css({"background-color": "rgba(255, 246, 246, 1)"});
    }
    else if (agent_outcome === "tie") {
        $("#experiment-container").css({"background-color": "rgba(255, 255, 246, 1)"});
    }
    else if (agent_outcome == "win") {
        $("#experiment-container").css({"background-color": "rgba(240, 255, 240, 1)"});
    }
    else {
        $("#experiment-container").css({"background-color": "rgba(255, 255, 255, 1)"});
    }
}


update_round = function(current_round_index, game_rounds) {
    $("#round-index").text(current_round_index + "/" + game_rounds);
}
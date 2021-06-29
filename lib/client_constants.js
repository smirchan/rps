/*
 * constants library for rps client (this gets loaded in the browser)
 */
// const STUDY_CREDITS = 0.5;
// const STUDY_DURATION = 30;
// // const EXPERIMENT_ID = 1768; // extracted from SONA for posting SONA credit (20EV07)
// const EXPERIMENT_ID = 1996; // extracted from SONA for posting SONA credit (21EV01)
// // const CREDIT_TOKEN = "19421bc286424246b6b1e873e7a55a8e"; // extracted from SONA for posting SONA credit (20EV07)
// const CREDIT_TOKEN = "2a73382e8c16449f86f5b46dc02007e9"; // extracted from SONA for posting SONA credit (21EV01)

// const HTML_LOOKUP = { // lookup table with human-understandable html file keys and the path to those files as vals
//     "consent": "/static/consent.html",
//     "instructions": "/static/instructions.html",
//     "experiment": "/static/round_template.html",
//     "trust_experiment": "/static/trust_round_template.html",
//     "survey_free_resp": "/static/survey_free_resp.html",
//     "survey_slider": "/static/survey_slider.html"
// };

const HTML_LOOKUP = { // lookup table with human-understandable html file keys and the path to those files as vals
    "trust_experiment": "/static/trust_round_template.html",
    "trust_survey": "/static/trust_survey.html",
    "trust_instructions": "/static/trust_instructions.html"
};

// const ROUND_TIMEOUT = 10; // number of seconds for players to make a decision each round (includes some buffer for loading)

// // Messages for client display
// const SERVER_WAIT = "Waiting for server..."; // message to display when waiting for server
const SERVER_WAIT = "Waiting for server...";
const NEWGAME_READY = "Press Play Next Round to begin"
// const OPPONENT_WAIT_JOIN = "Waiting for an opponent to join..."; // message to display when waiting for opponent to join
// const OPPONENT_WAIT_MOVE = "Waiting for opponent to select a move..."; // message to display when waiting for opponent's move
// const OPPONENT_WAIT_CONTINUE = "Waiting for opponent to continue..."; // message to display when waiting for opponent to continue
// const ROUND_BEGIN = "Choose a move!"; // message to display when beginning a round
// const ENDGAME_MESSAGE = "Game over. Please click the button below to answer a few questions about your experience."; // message to display when game is over

// Array of instruction elements (with embedded html formatting) used to present instructions in instructions.js
const INSTRUCTION_ARRAY = [
    {
        // ORIGINAL TEXT
        // top_text: "<p>In today’s experiment, you’ll be playing the Rock, Paper, Scissors game " +
        //     "against another human player.</p>",
        // V2 TEXT
        top_text: "<p>In today’s experiment, you’ll be playing a version of the Rock, Paper, Scissors game.</p>",
        canvas_img: "",
        bottom_text: "<p>Please do not refresh the browser at any point during the experiment or " +
            "the task will restart. Please complete the task in one sitting.</p>"
    },
    {
        top_text: "<p>In Rock, Paper, Scissors, the rules are simple:</p>" +
            "<p>- <b><i>Rock beats scissors</i></b> (to remember, imagine the rock breaking the scissors).</p>" +
            "<p>- <b><i>Scissors beats paper</i></b> (to remember, imagine the scissors cutting the paper).</p>" +
            "<p>- <b><i>Paper beats rock</i></b> (to remember, imagine the paper wrapping around the rock).</p>" +
            "<p>- If both players play the same card, the round is a tie.</p>",
        canvas_img: "",
        bottom_text: ""
    },
    {
        top_text: "<p>Rather than playing the game yourself, you're going to watch an AI agent play several rounds against an AI opponent.</p>",
        canvas_img: "",
        bottom_text: "<p>The opponent's strategy is based on the outcomes of the previous couple rounds, and the moves it made. The agent may or may not learn the opponent's strategy over time.</p>"
    },
    {
        top_text: "<p>Your job is to assess the ability of these agents against the opponent. Click through each round, paying attention to how well each agent is doing.  Every 5 rounds, you will be asked to provide an estimate of how likely the agent is to win its next round.</p>",
        canvas_img: "",
        bottom_text: ""
    },
    {
        top_text: "<p>Ready? Click the button below to get started!</p>",
        canvas_img: "",
        bottom_text: ""
    }
];


// // Exit survey messages
// const SURVEY_SLIDER_MESSAGE = "On the slider below, please indicate how much you agree with the following statement:";
// const SURVEY_FREE_RESPONSE = "In the text box below, please describe any strategies you used to try and beat your opponent.";

// // Exit survey slider questions
// const SURVEY_ARRAY = [
//     "My opponent was a real person and not a robot.",
//     "I was trying to win each round against my opponent.",
//     "I was focused on winning for the entire time I was playing.",
//     "I paid attention to my opponent’s moves in order to try and predict their next move.",
//     "There were noticeable patterns in my opponent’s moves that allowed me to predict their next move."
// ];

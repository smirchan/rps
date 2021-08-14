/*
 * constants library for rps client (this gets loaded in the browser)
 */
const STUDY_CREDITS = 0.5;
const STUDY_DURATION = 30;
// const EXPERIMENT_ID = 1768; // extracted from SONA for posting SONA credit (20EV07)
// const EXPERIMENT_ID = 1996; // extracted from SONA for posting SONA credit (21EV01)
// const CREDIT_TOKEN = "19421bc286424246b6b1e873e7a55a8e"; // extracted from SONA for posting SONA credit (20EV07)
// const CREDIT_TOKEN = "2a73382e8c16449f86f5b46dc02007e9"; // extracted from SONA for posting SONA credit (21EV01)
const EXPERIMENT_ID = 2129; // extracted from SONA for posting SONA credit (21EV06)
const CREDIT_TOKEN = "87e1942a617d4527b50309a2467746fd"; // extracted from SONA for posting SONA credit (21EV06)




// Lookup table with human-understandable html file keys and the path to those files as vals
const HTML_LOOKUP = {
    "consent": "/static/consent.html",
    "trust_experiment": "/static/trust_round_template.html",
    "trust_survey": "/static/trust_survey.html",
    "trust_instructions": "/static/trust_instructions.html"
};


// Countdown when players are "thinking"
const COUNTDOWN = 3;
const COUNTDOWN_PAUSE = 500; // ms


// Messages for client display
const SERVER_WAIT = "Waiting for server...";
const NEWGAME_READY = "Press Play Next Round to begin"
const SURVEY_SLIDER_HEADER = "Evaluate this matchup";
const SURVEY_SLIDER_MESSAGE_1 = "How likely do you think it is that Agent * will win the next round against Opponent A?";
const SURVEY_SLIDER_MESSAGE_2 = "How likely do you think it is that you (the participant) would win the next round against Opponent A?";
const FINISHED_GAME_HEADER = "Agent * vs. Opponent A: Match Complete"
const FINISHED_GAME_SUBHEADER = "Press Continue to proceed to the next agent's <br> matchup against Opponent A."
const THANK_YOU = "All done. Thank you for playing! <br> You may now close this window."


// Array of instruction elements (with embedded html formatting) used to present instructions in instructions.js
const INSTRUCTION_ARRAY_NOVICE = [
    {
        top_text: "<p>Welcome to the Rock, Paper, Scissors Olympics!</p>",
        canvas_img: "",
        bottom_text: "<p>Please do not refresh the browser at any point during the experiment or " +
            "the task will restart.</p> </p>Please complete the task in one sitting.</p>"
    },
    {
        top_text: "<p>In Rock, Paper, Scissors, each player chooses one of the 3 " +
                    "moves in the diagram below (Rock, Paper, or Scissors).</p>" +
            "<p>The rules are simple:</p>" +
            "<p>- <b><i>Rock beats Scissors</i></b> (to remember, imagine the rock breaking the scissors).</p>" +
            "<p>- <b><i>Scissors beats Paper</i></b> (to remember, imagine the scissors cutting the paper).</p>" +
            "<p>- <b><i>Paper beats Rock</i></b> (to remember, imagine the paper wrapping around the rock).</p>" +
            "<p>- If both players play the same card, the round is a tie.</p>",
        canvas_img: "../img/schematic.jpg",
        bottom_text: ""
    },
    {
        top_text: "<p>Rather than playing the game yourself, your job is to evaluate 3 AI assistants " +
                    "(Agents 1, 2, and 3) as they each play against the same AI opponent (Opponent A).</p>",
        canvas_img: "",
        bottom_text: "<p>Agents 1, 2, and 3 will each compete in 100 rounds against Opponent A. " +
                    "Click through each round, paying attention to how well the agent is doing " +
                    "against its opponent. Each agent may or may not learn the opponent's " +
                    "strategy over time.</p>"
    },
    {
        top_text: "<p>Every 5 rounds, you will be asked to provide an estimate of how likely the " +
                    "current agent is to win its next round and how well you think <em>you</em> " +
                    "could do against the same opponent.</p>",
        canvas_img: "",
        bottom_text: ""
    },
    {
        top_text: "<p>First up against Opponent A will be Agent 1.</p>" +
                    "<p>Opponent A is a novice agent with a simple strategy. Its move each round " +
                    "will depend on the previous round.</p>",
        canvas_img: "",
        bottom_text: "Ready? Click the button below to get started!"
    }
];

var INSTRUCTION_ARRAY_EXPERT = JSON.parse(JSON.stringify(INSTRUCTION_ARRAY_NOVICE));
INSTRUCTION_ARRAY_EXPERT[4]['top_text'] = "<p>We'll start with a matchup between Agent 1 and Opponent A.</p>" +
                                            "<p>Opponent A is an expert agent with a complex strategy. Its move each round " +
                                             "will depend on the previous round's outcome as well as the moves it made over the previous " +
                                             "two rounds.</p>"

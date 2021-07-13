# Pregistration for RPS-based trust experiment

## Study information
**Title**: 

### Research questions
*How do humans build up trust in an agent over time in dynamic learning environments?*
In this experiment, we test the broad idea that human trust judgments reflect (learned) expectations about how well other agents will support joint goals in new environments.


### Hypotheses
Specifically, we hypothesize that in building trust relationships with agents, people are sensitive to all of the following features of the agent and the environment: 
a) task difficulty,
b) the agent’s baseline ability, and
c) the agent’s learning ability.

Therefore, when presented with a novel task in which participants and AI agents have joint goals, differences in the agents' abilities and learning rates, as well as environmental differences reflected in the task difficulty, will lead to differing levels of trust in the agents.


## Design Plan
###   Study type
 <!-- indicate whether your study will be experimental or correlational -->
 Experimental
###   Study design
 <!-- describe the overall design of the study (what will be manipulated and/or measured, specify whether manipulations will be between- or within-participants, etc.) -->
The experiment will be divided into a `training` and `test` phase (using these terms loosely).
In the training phase, participants will monitor the behavior of three different agents in a simulated Rock, Paper, Scissors (RPS) tournament against a common opponent. 
Each agent will play **100** rounds against their opponent. 
The agents will vary in their baseline ability (high/low) and learning rate (flat/positive) against the opponent. 
The opponent will be a novice or expert, reflecting task difficulty for the agents.
During training, participants will be prompted to evaluate each agent's competence and the difficulty of the task over time. 
In the test phase, participants will be prompted to indicate how likely each agent would be to win against a new, unseen opponent. 

**Stimulus dimensions**
Agents will be implemented as noisy oracles against their AI opponent. Each agent's RPS games will have the following attributes:

 | Attribute | Distribution | Notes |
 | --- | --- | --- |
 | Opponent competence | Discrete: novice or expert | Novice strategy will follow a repeating sequence in **90%** of rounds. Expert strategy will appear random. |
 | Agent competence | Discrete: low or high baseline  | Low baseline: agent will beat the opponent at chance levels. High baseline: agent will beat the opponent in approx. 2/3 of rounds |
 | Agent learning rate | Discrete: 0 or linear interpolation from low baseline win rate to high baseline win rate | --- |


####   Independent variables
Participants will be assigned to an *opponent competence* level and then evaluate three agents performing against that opponent: 
*low competence, no learning* agent; *high competence, no learning* agent; and *low competence, positive learning* agent. 
The order of the agent evaluation will be randomized. In short, evaluations of different agents will be within subjects, 
while opponent competence (task difficulty) will be between subjects.

####   Dependent variables
Participants will evaluate agents by responding to prompts about the agent and opponent competence every **5** rounds. 
The evaluation prompts will be two continuous Likert scales asking participants: 
a) How likely is Agent {1, 2, 3} to beat the opponent in the next round? 
b) How likely would you (the participant) be to beat the opponent in the next round?


###   Study design: evaluation protocol 

**Sequence of events in a session**\
The experiment is expected to last around 20-30 minutes.

1. Consent form and instructions

2. *Training phase*: for each of the three agents outlined above (`low competence`, `high competence`, `learning`), participants will click to view 
**100** rounds of play between the agent and their selected opponent (`novice` or `expert`). They will see the agent and its opponent's move choice,
as well as the outcome of the round.
![image](https://user-images.githubusercontent.com/25757255/125358408-b3800380-e31d-11eb-8601-5a5a9a5cd3e0.png)
![image](https://user-images.githubusercontent.com/25757255/125358527-da3e3a00-e31d-11eb-94ed-1739b83e6438.png)

3. Every **5** rounds, participants will be prompted to evaluate the agent and its opponent using slider scales that indicate the probability 
that the agent will win the next round and the probability that the participant would win the next round against the same opponent.
![image](https://user-images.githubusercontent.com/25757255/125358733-28ebd400-e31e-11eb-88db-08ed9f2f831a.png)

4. *Test phase*: After completing the evaluation of all three agents, participants will be prompted to indicate how likely each agent would be to win
against a new, unseen opponent that is of the same or opposite skill level as the opponent they've already seen.

###   Measured variables
 <!-- Precisely define each variable that you will measure. This includes outcome measures, as well as other measured predictor variables. -->
Our *outcome variables* for each participant are:
- The ratings of **agent win likelihood** for each agent, after every **5** rounds of play during the training phase
- The ratings of **participant win likelihood** after every **5** rounds of play during the training phase
- The ratings of **agent win likelihood** against each type of new opponent (`expert`, `novice`) during the testing phase

Our *predictor variables* for each participant are:
- The moves chosen and outcomes of the previous **5** rounds between the agent and its opponent
- The ability level of the opponent 
- The competence and learning rate of the agent


## Analysis Plan
Our analysis focuses on how judgments of an agent's ability and subsequent trustworthiness differ across varying levels of baseline competence, learning, and opponent ability. 
Specifically, we test whether participants are sensitive to an agent's competence, learning, and task difficulty when deciding how much they can trust the agent.

### 1. How well do participants assess an agent's competence in this environment?
To understand how well people evaluate competence in this environment, we will examine average responses to the slider scales indicating each agent's likelihood 
of beating the AI opponent over time and the participant's own ability to beat the AI opponent during the training phase.
*If people are sensitive to baseline differences in competence:* The win probability should be different for the high and low baseline agents.
*If people are sensitive to learning:* The reported win probability should increase for the learning agent, but stay relatively stable for the baseline agents.
*If people are sensitive to task difficulty:* The reported probability that participants would beat the AI opponent should be different for those
viewing the `novice` opponent and those viewing the `expert` opponent.

### 2. How do trust judgments reflect information about an agent's competence, learning, and task difficulty?
To understand how people's trust in an agent incorporates information about the agent's competence, learning, and task difficulty, we will examine average responses
to the slider scales indicating each agent's likelihood of beating a *new* opponent during the test phase.

As with the competence judgments over time, we expect the *one-shot* judgments about new opponents to incorporate what participants know about each agent's 
baseline ability, learning, and the environments in which they have viewed the agents perform (difficult or easy). 
Here, our primary question concerns whether people's generalizations about the `learning` agent will differ from the more static (high competence) agent. 


## Model
Our modeling approach will try to capture each of the two empirical analyses described above: how people estimate latent ability or competence, 
and how these estimates inform subsequent generalizations about trustworthiness in new environments.

### Modeling ability with ELO ratings
We will model participant judgments of each agent's competence using ELO ratings as a proxy for latent ability estimates. 
An ELO rating is a continuous numerical value that can be used to estimate an agent's likelihood of beating another agent with a known ELO rating.
The ELO rating for a given player is updated each round using the rating of the opponent and the outcome of that round. 
ELO rating can be estimated based on each player's outcomes across repeated rounds.

The ELO model takes as its input the outcomes of each game between the agent and its opponent and their estimated ratings, then updates the ratings for each player.
Updated ratings are used to estimate the agent's likelihood of beating the opponent in the next round. 
These estimates are compared to people's reported agent win probabilities every **5** rounds. 

The ELO model for each agent's ability has three free parameters: the agent's ELO rating, the opponent's ELO rating, and a parameter *k* indicating 
how much ratings are updated for each player after a given round. 

The model estimates these parameter values at every time *t* by minimizing the loss between the estimated win probability for the agent and the reported 
win probabilities in the empirical data.

**The goal of the ELO model is to develop a predictive account of how people incorporate information about an agent's game outcomes into their
latent estimate of the agent's ability.**


### Modeling trust judgemnts...






# rps
Repo for rock, paper, scissors experiments

## To run experiment locallly:
1. Clone repo
2. This requires `node.js` and the node package manager `npm`. Google these to download and run locally :)
3. cd to `rps/` directory
2. Start server: `node app.js`
3. In browser, navigate to URL below that matches the version you'd like to play (http://localhost:3000/?ver={version})

### Versions
Opponents:
- N1 -> Novice-Same (Strategy: Favored Choice, with Noise)
- N2 -> Novice-Sequence (Strategy: Cycle through RPS, with Noise)
- EX -> Expert (Strategy: Outcome Transition Dual Dependency, with Noise)

Agents:
- LC -> Low Competence: (Oracle Choice Percentage from 0% to 0%)
- LA -> Learning Agent: (Oracle Choice Percentage from 0% to 50%)
- HC -> High Competence (Oracle Choice Percentage from 50% to 50%)

Version Codes:

- 1: N1, LC
- 2: N1, LA
- 3: N1, HC
- 4: N2, LC
- 5: N2, LA
- 6: N2, HC
- 7: EX, LC
- 8: EX, LA
- 9: EX, HC
- pilot: Series of 3 games -- choose opponent randomly from {N2, EX}, then randomly order the 3 agents {LC, LA, HC}


### Admin functions
- Visit `http://localhost:3000/admin` to view the state of games currently in play (helpful when running this as an experiment)


## Data
Participant data is in the `/data` directory
- Naming format: {client-id}_{game_index}.json

### Main Folders

- hardhat
    - The core smart-contract code.
- research
    - A open storage of research conducted by the team
- rfcs
    - Where proposals for the project will live.
- sdk
    - This folder will be published to NPM.



## Core library functions

## Ranking Algos for Reputation

### Recursive rank and prune
Allows for the stratification of individuals.
Idea from @jackryanservia
1. Rank based on in-edges
2. Prune bottom 90%
3. Recompute in-edges
4. Top 10% become strata
5. Reconduct prune recursively 


### Shortest Path
Just finding the shortest path between individual A and B. Using distance to make point estimate of B's reputation to A.

### Cut Edges
The k-connectedness of A and B. Using the minimal number of edges needed to be cut to place A & B in seperate components.
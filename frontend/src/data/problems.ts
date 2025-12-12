export interface Problem {
    id: string; // unique slug
    name: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    category: string;
    description: string;
    exampleInput: string;
    exampleOutput: string;
    concepts: string[];
    greedyWorks: boolean;
    visualizationType: 'sequence' | 'graph' | 'tree' | 'matrix' | 'timeline' | 'gauge' | 'rod';
}

export const problems: Problem[] = [
    // --- EASY ---
    {
        id: 'activity-selection',
        name: 'Activity Selection',
        difficulty: 'Easy',
        category: 'Greedy',
        description: 'Select the maximum number of activities that can be performed by a single person, assuming that a person can only work on a single activity at a time.',
        exampleInput: 'Start: [1, 3, 0, 5, 8, 5], End: [2, 4, 6, 7, 9, 9]',
        exampleOutput: 'Selected Activities: [0, 1, 3, 4]',
        concepts: ['Greedy Choice', 'Sorting', 'Non-overlapping'],
        greedyWorks: true,
        visualizationType: 'timeline'
    },
    {
        id: 'fractional-knapsack',
        name: 'Fractional Knapsack',
        difficulty: 'Easy',
        category: 'Greedy',
        description: 'Given weights and values of N items, put these items in a knapsack of capacity W to get the maximum total value. Items can be broken.',
        exampleInput: 'Values: [60, 100, 120], Weights: [10, 20, 30], Capacity: 50',
        exampleOutput: 'Max Value: 240',
        concepts: ['Greedy', 'Sorting', 'Ratio'],
        greedyWorks: true,
        visualizationType: 'gauge'
    },
    {
        id: 'coin-change-min',
        name: 'Coin Change (Min Coins)',
        difficulty: 'Easy',
        category: 'Dynamic Programming',
        description: 'Find the minimum number of coins that make a given value.',
        exampleInput: 'Coins: [1, 2, 5], Amount: 11',
        exampleOutput: 'Min Coins: 3 (5 + 5 + 1)',
        concepts: ['DP', 'Substructure'],
        greedyWorks: false,
        visualizationType: 'matrix'
    },
    {
        id: 'rod-cutting',
        name: 'Rod Cutting',
        difficulty: 'Easy',
        category: 'Dynamic Programming',
        description: 'Given a rod of length n and prices for pieces of size 1 to n, find the optimal way to cut the rod to maximize profit.',
        exampleInput: 'Length: 8, Prices: [1, 5, 8, 9, 10, 17, 17, 20]',
        exampleOutput: 'Max Profit: 22',
        concepts: ['DP', 'Unbounded Knapsack'],
        greedyWorks: false,
        visualizationType: 'rod'
    },
    {
        id: 'lcs',
        name: 'Longest Common Subsequence',
        difficulty: 'Easy',
        category: 'Dynamic Programming',
        description: 'Find the length of the longest subsequence present in both of two sequences.',
        exampleInput: 'S1: "AGGTAB", S2: "GXTXAYB"',
        exampleOutput: 'LCS Length: 4 ("GTAB")',
        concepts: ['DP', 'Matrix', 'String'],
        greedyWorks: false,
        visualizationType: 'matrix'
    },

    // --- MEDIUM ---
    {
        id: '0-1-knapsack',
        name: '0/1 Knapsack',
        difficulty: 'Medium',
        category: 'Dynamic Programming',
        description: 'Given weights and values of N items, put these items in a knapsack of capacity W to get the maximum total value. Items cannot be broken.',
        exampleInput: 'Values: [60, 100, 120], Weights: [10, 20, 30], Capacity: 50',
        exampleOutput: 'Max Value: 220',
        concepts: ['DP', 'Combinatorial'],
        greedyWorks: false,
        visualizationType: 'matrix'
    },
    {
        id: 'job-sequencing',
        name: 'Job Sequencing with Deadlines',
        difficulty: 'Medium',
        category: 'Greedy',
        description: 'Given a set of jobs with deadlines and profits, find the sequence of jobs that maximizes total profit.',
        exampleInput: 'Jobs: {(1, 2, 100), (2, 1, 19), (3, 2, 27), (4, 1, 25), (5, 3, 15)}',
        exampleOutput: 'Selected: c, a, e',
        concepts: ['Greedy', 'Sorting', 'Disjoint Set'],
        greedyWorks: true,
        visualizationType: 'timeline'
    },
    {
        id: 'matrix-chain',
        name: 'Matrix Chain Multiplication',
        difficulty: 'Medium',
        category: 'Dynamic Programming',
        description: 'Given a sequence of matrices, find the most efficient way to multiply these matrices together.',
        exampleInput: 'Dimensions: [40, 20, 30, 10, 30]',
        exampleOutput: 'Min Mults: 26000',
        concepts: ['DP', 'Partition'],
        greedyWorks: false,
        visualizationType: 'matrix'
    },
    {
        id: 'lis',
        name: 'Longest Increasing Subsequence',
        difficulty: 'Medium',
        category: 'Dynamic Programming',
        description: 'Find the length of the longest strictly increasing subsequence in an array.',
        exampleInput: 'Arr: [10, 22, 9, 33, 21, 50, 41, 60, 80]',
        exampleOutput: 'Length: 6',
        concepts: ['DP', 'Binary Search'],
        greedyWorks: false,
        visualizationType: 'sequence'
    },
    {
        id: 'edit-distance',
        name: 'Edit Distance',
        difficulty: 'Medium',
        category: 'Dynamic Programming',
        description: 'Find individual operations (insert, replace, delete) required to convert string A to string B.',
        exampleInput: 'S1: "sunday", S2: "saturday"',
        exampleOutput: 'Distance: 3',
        concepts: ['DP', 'String'],
        greedyWorks: false,
        visualizationType: 'matrix'
    },
    {
        id: 'interval-scheduling',
        name: 'Interval Scheduling',
        difficulty: 'Medium',
        category: 'Greedy',
        description: 'Select the maximum set of non-overlapping intervals.',
        exampleInput: 'Intervals: [[1,3], [2,4], [3,5]]',
        exampleOutput: 'Max Intervals: 2',
        concepts: ['Greedy', 'Sorting'],
        greedyWorks: true,
        visualizationType: 'timeline'
    },


    // --- HARD ---
    {
        id: 'tsp-dp',
        name: 'Traveling Salesman (DP)',
        difficulty: 'Hard',
        category: 'DP on Subsets',
        description: 'Find the shortest possible route that visits each city exactly once and returns to the origin city.',
        exampleInput: 'Dist Matrix: [[0, 10, 15, 20], [10, 0, 35, 25]...]',
        exampleOutput: 'Min Cost: 80',
        concepts: ['DP', 'Bitmask', 'Graph'],
        greedyWorks: false,
        visualizationType: 'graph'
    },
    {
        id: 'weighted-interval',
        name: 'Weighted Interval Scheduling',
        difficulty: 'Hard',
        category: 'Dynamic Programming',
        description: 'Find the set of non-overlapping intervals that maximizes total weight/value.',
        exampleInput: 'Intervals: {(1,3,5), (2,4,6), (3,5,5)}',
        exampleOutput: 'Max Weight: 10',
        concepts: ['DP', 'Binary Search', 'Sorting'],
        greedyWorks: false,
        visualizationType: 'timeline'
    },
    {
        id: 'optimal-bst',
        name: 'Optimal Binary Search Tree',
        difficulty: 'Hard',
        category: 'Dynamic Programming',
        description: 'Given keys and frequencies, construct a BST tied to minimize the cost of searching.',
        exampleInput: 'Keys: [10, 12, 20], Freq: [34, 8, 50]',
        exampleOutput: 'Min Cost: 142',
        concepts: ['DP', 'Tree'],
        greedyWorks: false,
        visualizationType: 'tree'
    },
    {
        id: 'assignment-bitmask',
        name: 'Assignment Problem (Bitmask DP)',
        difficulty: 'Hard',
        category: 'DP on Subsets',
        description: 'Assign N people to N jobs to minimize total cost.',
        exampleInput: 'Cost Matrix: 4x4',
        exampleOutput: 'Min Cost: 13',
        concepts: ['DP', 'Bitmask'],
        greedyWorks: false,
        visualizationType: 'matrix'
    },
    {
        id: 'tree-dp-independent',
        name: 'Max Independent Set on Tree',
        difficulty: 'Hard',
        category: 'DP on Trees',
        description: 'Find the largest set of vertices in a tree such that no two are adjacent.',
        exampleInput: 'Tree Edges: [(1,2), (2,3)...]',
        exampleOutput: 'Size: 5',
        concepts: ['DP', 'Tree', 'DFS'],
        greedyWorks: false,
        visualizationType: 'tree'
    }
];

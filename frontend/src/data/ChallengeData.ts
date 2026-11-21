import { AlgorithmType } from '../types';
import type { KnapsackInput, CoinChangeInput, IntervalSchedulingInput } from '../types';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface TestCase {
    name: string;
    input: KnapsackInput | CoinChangeInput | IntervalSchedulingInput;
    expectedValue: number;
}

export interface Challenge {
    id: string;
    title: string;
    description: string;
    difficulty: Difficulty;
    algorithmType: 'knapsack' | 'coin-change' | 'interval-scheduling';
    greedyType: AlgorithmType;
    dpType: AlgorithmType;
    testCases: TestCase[];
    hints: string[];
    optimalValue: number;
    locked: boolean;
    prerequisite?: string; // ID of challenge that must be completed first
}

export const CHALLENGES: Challenge[] = [
    // ===== EASY CHALLENGES =====
    {
        id: 'easy-knapsack-1',
        title: 'Small Backpack',
        description: 'You have a small backpack with capacity 10. Pack items to maximize value. This is a perfect introduction to the knapsack problem!',
        difficulty: 'easy',
        algorithmType: 'knapsack',
        greedyType: AlgorithmType.KNAPSACK_GREEDY,
        dpType: AlgorithmType.KNAPSACK_DP,
        testCases: [
            {
                name: 'Basic Test',
                input: {
                    capacity: 10,
                    items: [
                        { id: '1', weight: 3, value: 4 },
                        { id: '2', weight: 4, value: 5 },
                        { id: '3', weight: 5, value: 6 }
                    ]
                },
                expectedValue: 11
            }
        ],
        hints: [
            'Think about the value-to-weight ratio of each item.',
            'The greedy approach picks items by best ratio first.',
            'DP builds a table to find the truly optimal solution.'
        ],
        optimalValue: 11,
        locked: false
    },
    {
        id: 'easy-coin-1',
        title: 'Making Change',
        description: 'Make change for $11 using coins of denominations [1, 3, 4]. Use the minimum number of coins!',
        difficulty: 'easy',
        algorithmType: 'coin-change',
        greedyType: AlgorithmType.COIN_CHANGE_GREEDY,
        dpType: AlgorithmType.COIN_CHANGE_DP,
        testCases: [
            {
                name: 'Basic Test',
                input: {
                    amount: 11,
                    coins: [1, 3, 4]
                },
                expectedValue: 3
            }
        ],
        hints: [
            'Greedy picks the largest coin that fits repeatedly.',
            'This can sometimes use more coins than optimal.',
            'DP finds the minimum coins needed for each amount up to 11.'
        ],
        optimalValue: 3,
        locked: false
    },
    {
        id: 'easy-interval-1',
        title: 'Simple Scheduling',
        description: 'You have 4 tasks with different start and end times. Schedule as many non-overlapping tasks as possible!',
        difficulty: 'easy',
        algorithmType: 'interval-scheduling',
        greedyType: AlgorithmType.INTERVAL_SCHEDULING,
        dpType: AlgorithmType.INTERVAL_SCHEDULING, // Same for intervals
        testCases: [
            {
                name: 'Basic Test',
                input: {
                    intervals: [
                        { id: '1', start: 0, end: 3 },
                        { id: '2', start: 2, end: 5 },
                        { id: '3', start: 4, end: 7 },
                        { id: '4', start: 6, end: 9 }
                    ]
                },
                expectedValue: 2
            }
        ],
        hints: [
            'Try sorting intervals by their end time.',
            'Pick the interval that ends earliest and doesn\'t conflict.',
            'For interval scheduling, greedy is actually optimal!'
        ],
        optimalValue: 2,
        locked: false
    },

    // ===== MEDIUM CHALLENGES =====
    {
        id: 'medium-knapsack-1',
        title: 'Greedy Trap',
        description: 'This knapsack has capacity 7. The greedy algorithm will fail here - can you see why?',
        difficulty: 'medium',
        algorithmType: 'knapsack',
        greedyType: AlgorithmType.KNAPSACK_GREEDY,
        dpType: AlgorithmType.KNAPSACK_DP,
        testCases: [
            {
                name: 'Greedy Fails',
                input: {
                    capacity: 7,
                    items: [
                        { id: '1', weight: 1, value: 1 },
                        { id: '2', weight: 3, value: 4 },
                        { id: '3', weight: 4, value: 5 },
                        { id: '4', weight: 5, value: 7 }
                    ]
                },
                expectedValue: 9
            }
        ],
        hints: [
            'Calculate the value-to-weight ratio for each item.',
            'Notice that item 1 has the best ratio but low total value.',
            'DP considers all combinations to find items 2 and 3.'
        ],
        optimalValue: 9,
        locked: false,
        prerequisite: 'easy-knapsack-1'
    },
    {
        id: 'medium-coin-1',
        title: 'Large Denominations',
        description: 'Make change for $6 using [1, 3, 4]. Largest-first Greedy uses 3 coins, while the optimal solution uses 2.',
        difficulty: 'medium',
        algorithmType: 'coin-change',
        greedyType: AlgorithmType.COIN_CHANGE_GREEDY,
        dpType: AlgorithmType.COIN_CHANGE_DP,
        testCases: [
            {
                name: 'Unusual Denominations',
                input: {
                    amount: 6,
                    coins: [1, 3, 4]
                },
                expectedValue: 2
            }
        ],
        hints: [
            'Greedy chooses 4 first, then two 1 coins.',
            'The optimal solution is 3 + 3.',
            'DP explores the combinations of smaller amounts.'
        ],
        optimalValue: 2,
        locked: false,
        prerequisite: 'easy-coin-1'
    },
    {
        id: 'medium-interval-1',
        title: 'Overlapping Meetings',
        description: 'Schedule 10 meetings with various conflicts. Maximize the number of meetings you can attend!',
        difficulty: 'medium',
        algorithmType: 'interval-scheduling',
        greedyType: AlgorithmType.INTERVAL_SCHEDULING,
        dpType: AlgorithmType.INTERVAL_SCHEDULING,
        testCases: [
            {
                name: 'Many Conflicts',
                input: {
                    intervals: [
                        { id: '1', start: 0, end: 6 },
                        { id: '2', start: 1, end: 4 },
                        { id: '3', start: 3, end: 5 },
                        { id: '4', start: 3, end: 8 },
                        { id: '5', start: 4, end: 7 },
                        { id: '6', start: 5, end: 9 },
                        { id: '7', start: 6, end: 10 },
                        { id: '8', start: 8, end: 11 },
                        { id: '9', start: 8, end: 12 },
                        { id: '10', start: 11, end: 14 }
                    ]
                },
                expectedValue: 4
            }
        ],
        hints: [
            'Sort by end time first.',
            'Always pick the next meeting that starts after the current one ends.',
            'The greedy choice (earliest end time) is optimal for intervals!'
        ],
        optimalValue: 4,
        locked: false,
        prerequisite: 'easy-interval-1'
    },

    // ===== HARD CHALLENGES =====
    {
        id: 'hard-knapsack-1',
        title: 'Optimal Packing',
        description: 'A challenging knapsack with 12 items and capacity 50. Many local optima exist - find the global one!',
        difficulty: 'hard',
        algorithmType: 'knapsack',
        greedyType: AlgorithmType.KNAPSACK_GREEDY,
        dpType: AlgorithmType.KNAPSACK_DP,
        testCases: [
            {
                name: 'Complex Packing',
                input: {
                    capacity: 50,
                    items: [
                        { id: '1', weight: 5, value: 10 },
                        { id: '2', weight: 4, value: 40 },
                        { id: '3', weight: 6, value: 30 },
                        { id: '4', weight: 3, value: 50 },
                        { id: '5', weight: 10, value: 35 },
                        { id: '6', weight: 9, value: 45 },
                        { id: '7', weight: 12, value: 60 },
                        { id: '8', weight: 7, value: 25 },
                        { id: '9', weight: 8, value: 38 },
                        { id: '10', weight: 4, value: 22 },
                        { id: '11', weight: 6, value: 28 },
                        { id: '12', weight: 5, value: 24 }
                    ]
                },
                expectedValue: 299
            }
        ],
        hints: [
            'With 12 items, there are 4096 possible combinations!',
            'Greedy by ratio will give a good but not optimal solution.',
            'DP builds a 50×12 table to explore all possibilities systematically.'
        ],
        optimalValue: 299,
        locked: false,
        prerequisite: 'medium-knapsack-1'
    },
    {
        id: 'hard-coin-1',
        title: 'Minimal Coins',
        description: 'Make change for $31 using [1, 5, 10, 21, 25]. Greedy uses 3 coins; the optimal solution uses 2.',
        difficulty: 'hard',
        algorithmType: 'coin-change',
        greedyType: AlgorithmType.COIN_CHANGE_GREEDY,
        dpType: AlgorithmType.COIN_CHANGE_DP,
        testCases: [
            {
                name: 'Large Amount',
                input: {
                    amount: 31,
                    coins: [1, 5, 10, 21, 25]
                },
                expectedValue: 2
            }
        ],
        hints: [
            'Greedy picks 25, then 5, then 1.',
            'Notice that the 21 coin combines with 10 to make exactly 31.',
            'The optimal solution uses only two coins: 21 + 10.'
        ],
        optimalValue: 2,
        locked: false,
        prerequisite: 'medium-coin-1'
    },
    {
        id: 'hard-interval-1',
        title: 'Maximum Intervals',
        description: 'Schedule 20 intervals with complex overlaps. This is a real-world scheduling problem!',
        difficulty: 'hard',
        algorithmType: 'interval-scheduling',
        greedyType: AlgorithmType.INTERVAL_SCHEDULING,
        dpType: AlgorithmType.INTERVAL_SCHEDULING,
        testCases: [
            {
                name: 'Maximum Scheduling',
                input: {
                    intervals: [
                        { id: '1', start: 0, end: 2 },
                        { id: '2', start: 1, end: 3 },
                        { id: '3', start: 2, end: 4 },
                        { id: '4', start: 3, end: 5 },
                        { id: '5', start: 4, end: 6 },
                        { id: '6', start: 5, end: 7 },
                        { id: '7', start: 6, end: 8 },
                        { id: '8', start: 7, end: 9 },
                        { id: '9', start: 8, end: 10 },
                        { id: '10', start: 9, end: 11 },
                        { id: '11', start: 0, end: 11 },
                        { id: '12', start: 2, end: 9 },
                        { id: '13', start: 3, end: 7 },
                        { id: '14', start: 5, end: 10 },
                        { id: '15', start: 1, end: 8 },
                        { id: '16', start: 4, end: 9 },
                        { id: '17', start: 6, end: 11 },
                        { id: '18', start: 0, end: 5 },
                        { id: '19', start: 3, end: 10 },
                        { id: '20', start: 7, end: 11 }
                    ]
                },
                expectedValue: 5
            }
        ],
        hints: [
            'Many intervals span the entire timeline - avoid those!',
            'Sort by end time and apply the greedy rule carefully.',
            'Even with 20 intervals, greedy finds the optimal solution efficiently.'
        ],
        optimalValue: 5,
        locked: false,
        prerequisite: 'medium-interval-1'
    },

    // ===== BONUS CHALLENGES =====
    {
        id: 'bonus-knapsack-1',
        title: 'The Ultimate Knapsack',
        description: 'BONUS: 15 items, capacity 100. This is the final test of your understanding!',
        difficulty: 'hard',
        algorithmType: 'knapsack',
        greedyType: AlgorithmType.KNAPSACK_GREEDY,
        dpType: AlgorithmType.KNAPSACK_DP,
        testCases: [
            {
                name: 'Ultimate Test',
                input: {
                    capacity: 100,
                    items: [
                        { id: '1', weight: 12, value: 24 },
                        { id: '2', weight: 7, value: 13 },
                        { id: '3', weight: 11, value: 23 },
                        { id: '4', weight: 8, value: 15 },
                        { id: '5', weight: 9, value: 16 },
                        { id: '6', weight: 13, value: 28 },
                        { id: '7', weight: 6, value: 11 },
                        { id: '8', weight: 14, value: 30 },
                        { id: '9', weight: 10, value: 20 },
                        { id: '10', weight: 5, value: 8 },
                        { id: '11', weight: 15, value: 32 },
                        { id: '12', weight: 4, value: 7 },
                        { id: '13', weight: 16, value: 35 },
                        { id: '14', weight: 11, value: 24 },
                        { id: '15', weight: 9, value: 18 }
                    ]
                },
                expectedValue: 211
            }
        ],
        hints: [
            'This requires a 100×15 DP table - that\'s 1500 cells!',
            'The greedy solution will be close but not perfect.',
            'Take your time and watch the DP table fill up systematically.'
        ],
        optimalValue: 211,
        locked: false,
        prerequisite: 'hard-knapsack-1'
    },
    {
        id: 'bonus-coin-1',
        title: 'The Coin Master',
        description: 'BONUS: Make change for $40 using [1, 5, 12, 20, 25]. Largest-first Greedy is not optimal.',
        difficulty: 'hard',
        algorithmType: 'coin-change',
        greedyType: AlgorithmType.COIN_CHANGE_GREEDY,
        dpType: AlgorithmType.COIN_CHANGE_DP,
        testCases: [
            {
                name: 'Master Level',
                input: {
                    amount: 40,
                    coins: [1, 5, 12, 20, 25]
                },
                expectedValue: 2
            }
        ],
        hints: [
            'Greedy chooses 25, then 12, then three 1 coins.',
            'Look for a pair that sums exactly to 40.',
            'The optimal solution is 20 + 20: just two coins.'
        ],
        optimalValue: 2,
        locked: false,
        prerequisite: 'hard-coin-1'
    },
    {
        id: 'bonus-interval-1',
        title: 'Conference Day',
        description: 'BONUS: Schedule 30 talks at a conference. Maximize your learning!',
        difficulty: 'hard',
        algorithmType: 'interval-scheduling',
        greedyType: AlgorithmType.INTERVAL_SCHEDULING,
        dpType: AlgorithmType.INTERVAL_SCHEDULING,
        testCases: [
            {
                name: 'Full Conference',
                input: {
                    intervals: Array.from({ length: 30 }, (_, i) => ({
                        id: `${i + 1}`,
                        start: Math.floor(i / 3) * 2,
                        end: Math.floor(i / 3) * 2 + (i % 3) + 2
                    }))
                },
                expectedValue: 10
            }
        ],
        hints: [
            'With 30 intervals, visualization will be dense!',
            'Remember: sort by end time, pick greedily.',
            'The greedy algorithm scales beautifully to large inputs.'
        ],
        optimalValue: 10,
        locked: false,
        prerequisite: 'hard-interval-1'
    }
];

// Utility functions
export const getChallengeById = (id: string): Challenge | undefined => {
    return CHALLENGES.find(c => c.id === id);
};

export const getChallengesByDifficulty = (difficulty: Difficulty): Challenge[] => {
    return CHALLENGES.filter(c => c.difficulty === difficulty);
};

export const getChallengesByAlgorithm = (algorithmType: string): Challenge[] => {
    return CHALLENGES.filter(c => c.algorithmType === algorithmType);
};

export const getUnlockedChallenges = (completedIds: string[]): Challenge[] => {
    return CHALLENGES.filter(challenge => {
        if (!challenge.prerequisite) return true;
        return completedIds.includes(challenge.prerequisite);
    });
};

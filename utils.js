/**
 * Utility functions for the Dijkstra simulator
 */

class Utils {
    /**
     * Calculate Manhattan distance between two points
     * @param {Object} p1 - First point {x, y}
     * @param {Object} p2 - Second point {x, y}
     * @returns {number} - Manhattan distance
     */
    static manhattanDistance(p1, p2) {
        return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
    }

    /**
     * Calculate Euclidean distance between two points
     * @param {Object} p1 - First point {x, y}
     * @param {Object} p2 - Second point {x, y}
     * @returns {number} - Euclidean distance
     */
    static euclideanDistance(p1, p2) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Get all neighbors of a cell (8-directional)
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} width - Grid width
     * @param {number} height - Grid height
     * @returns {Array} - Array of neighbor coordinates
     */
    static getNeighbors(x, y, width, height) {
        const neighbors = [];
        const directions = [
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 },
            { x: 1, y: 1 },
            { x: -1, y: -1 },
            { x: 1, y: -1 },
            { x: -1, y: 1 }
        ];

        for (const dir of directions) {
            const nx = x + dir.x;
            const ny = y + dir.y;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                neighbors.push({ x: nx, y: ny });
            }
        }

        return neighbors;
    }

    /**
     * Check if a point is valid and walkable
     * @param {Object} point - Point {x, y}
     * @param {number[][]} grid - 2D grid
     * @returns {boolean} - True if valid and walkable
     */
    static isWalkable(point, grid) {
        return point.y >= 0 && point.y < grid.length &&
               point.x >= 0 && point.x < grid[0].length &&
               grid[point.y][point.x] === 0;
    }

    /**
     * Clone a 2D array
     * @param {number[][]} grid - Grid to clone
     * @returns {number[][]} - Cloned grid
     */
    static cloneGrid(grid) {
        return grid.map(row => [...row]);
    }

    /**
     * Find connected components in a grid
     * @param {number[][]} grid - 2D grid
     * @returns {Array} - Array of connected components
     */
    static findConnectedComponents(grid) {
        const rows = grid.length;
        const cols = grid[0].length;
        const visited = Array(rows).fill(null).map(() => Array(cols).fill(false));
        const components = [];

        const dfs = (y, x, component) => {
            if (y < 0 || y >= rows || x < 0 || x >= cols || visited[y][x] || grid[y][x] === 1) {
                return;
            }
            visited[y][x] = true;
            component.push({ x, y });

            // Check 4 neighbors
            dfs(y - 1, x, component);
            dfs(y + 1, x, component);
            dfs(y, x - 1, component);
            dfs(y, x + 1, component);
        };

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                if (!visited[y][x] && grid[y][x] === 0) {
                    const component = [];
                    dfs(y, x, component);
                    if (component.length > 0) {
                        components.push(component);
                    }
                }
            }
        }

        return components;
    }

    /**
     * Format time in milliseconds
     * @param {number} ms - Time in milliseconds
     * @returns {string} - Formatted time
     */
    static formatTime(ms) {
        if (ms < 1000) {
            return ms.toFixed(2) + 'ms';
        } else if (ms < 60000) {
            return (ms / 1000).toFixed(2) + 's';
        } else {
            return (ms / 60000).toFixed(2) + 'm';
        }
    }

    /**
     * Shuffle an array (Fisher-Yates shuffle)
     * @param {Array} array - Array to shuffle
     * @returns {Array} - Shuffled array
     */
    static shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
}
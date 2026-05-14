class MazeGenerator {
    /**
     * Generate a maze using recursive backtracking algorithm
     * @param {number} width - Width of maze
     * @param {number} height - Height of maze
     * @returns {number[][]} - 2D grid with 1 = wall, 0 = path
     */
    static generateMaze(width, height) {
        // Initialize grid with all walls
        const grid = Array(height).fill(null).map(() => Array(width).fill(1));
        
        // Recursive backtracking
        const directions = [
            { x: 2, y: 0 },  // Right
            { x: -2, y: 0 }, // Left
            { x: 0, y: 2 },  // Down
            { x: 0, y: -2 }  // Up
        ];
        
        const carvePath = (x, y) => {
            grid[y][x] = 0; // Carve current cell
            
            // Shuffle directions
            const shuffled = directions.sort(() => Math.random() - 0.5);
            
            for (const dir of shuffled) {
                const nx = x + dir.x;
                const ny = y + dir.y;
                
                if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && grid[ny][nx] === 1) {
                    // Carve the wall between current cell and next cell
                    grid[y + dir.y / 2][x + dir.x / 2] = 0;
                    carvePath(nx, ny);
                }
            }
        };
        
        // Start from (1, 1)
        carvePath(1, 1);
        
        // Add outer border
        for (let x = 0; x < width; x++) {
            grid[0][x] = 1;
            grid[height - 1][x] = 1;
        }
        for (let y = 0; y < height; y++) {
            grid[y][0] = 1;
            grid[y][width - 1] = 1;
        }
        
        return grid;
    }

    /**
     * Generate a map with random obstacles
     * @param {number} width - Width of map
     * @param {number} height - Height of map
     * @returns {number[][]} - 2D grid with 1 = wall, 0 = path
     */
    static generateRandomMap(width, height) {
        const grid = Array(height).fill(null).map(() => Array(width).fill(0));
        
        // Add borders
        for (let x = 0; x < width; x++) {
            grid[0][x] = 1;
            grid[height - 1][x] = 1;
        }
        for (let y = 0; y < height; y++) {
            grid[y][0] = 1;
            grid[y][width - 1] = 1;
        }
        
        // Add random obstacles
        const obstacleChance = 0.2; // 20% chance for each cell
        
        for (let y = 2; y < height - 2; y++) {
            for (let x = 2; x < width - 2; x++) {
                if (Math.random() < obstacleChance) {
                    grid[y][x] = 1;
                }
            }
        }
        
        // Ensure start and end areas are clear
        const clearRadius = 3;
        for (let y = 1; y < 1 + clearRadius; y++) {
            for (let x = 1; x < 1 + clearRadius; x++) {
                if (y < height && x < width) {
                    grid[y][x] = 0;
                }
            }
        }
        
        for (let y = height - 1 - clearRadius; y < height - 1; y++) {
            for (let x = width - 1 - clearRadius; x < width - 1; x++) {
                if (y >= 0 && x >= 0) {
                    grid[y][x] = 0;
                }
            }
        }
        
        // Smooth the map
        return this.smoothMap(grid);
    }

    /**
     * Smooth the map by removing isolated walls
     * @param {number[][]} grid - 2D grid
     * @returns {number[][]} - Smoothed grid
     */
    static smoothMap(grid) {
        const height = grid.length;
        const width = grid[0].length;
        const smoothed = grid.map(row => [...row]);
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                if (grid[y][x] === 1) {
                    // Check neighbors
                    let wallCount = 0;
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            if (dx !== 0 || dy !== 0) {
                                if (grid[y + dy][x + dx] === 1) {
                                    wallCount++;
                                }
                            }
                        }
                    }
                    
                    // If isolated wall, convert to path
                    if (wallCount <= 2) {
                        smoothed[y][x] = 0;
                    }
                } else if (grid[y][x] === 0) {
                    // Check if single walkable cell surrounded by walls
                    let pathCount = 0;
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            if (dx !== 0 || dy !== 0) {
                                if (grid[y + dy][x + dx] === 0) {
                                    pathCount++;
                                }
                            }
                        }
                    }
                    
                    // If very isolated, convert to wall (but not start/end area)
                    if (pathCount === 0 && x > 5 && y > 5) {
                        smoothed[y][x] = 1;
                    }
                }
            }
        }
        
        return smoothed;
    }
}
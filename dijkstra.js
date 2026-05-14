class Dijkstra {
    /**
     * Find shortest path using Dijkstra's algorithm
     * @param {number[][]} grid - 2D grid where 0 = walkable, 1 = wall
     * @param {Object} start - Start position {x, y}
     * @param {Object} end - End position {x, y}
     * @param {Function} callback - Callback function for visualization
     * @returns {Object} - {path: [], exploredNodes: Set}
     */
    static findShortestPath(grid, start, end, callback = null) {
        const rows = grid.length;
        const cols = grid[0].length;
        const distances = Array(rows).fill(null).map(() => Array(cols).fill(Infinity));
        const parent = Array(rows).fill(null).map(() => Array(cols).fill(null));
        const visited = Array(rows).fill(null).map(() => Array(cols).fill(false));
        const exploredNodes = new Set();
        
        distances[start.y][start.x] = 0;
        
        for (let i = 0; i < rows * cols; i++) {
            // Find unvisited node with minimum distance
            let minDist = Infinity;
            let current = null;
            
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    if (!visited[y][x] && distances[y][x] < minDist) {
                        minDist = distances[y][x];
                        current = { x, y };
                    }
                }
            }
            
            if (!current || minDist === Infinity) break;
            
            visited[current.y][current.x] = true;
            exploredNodes.add(`${current.x},${current.y}`);
            
            if (current.x === end.x && current.y === end.y) {
                break;
            }
            
            // Check all 8 neighbors
            const neighbors = [
                { x: current.x + 1, y: current.y, dist: 1 },
                { x: current.x - 1, y: current.y, dist: 1 },
                { x: current.x, y: current.y + 1, dist: 1 },
                { x: current.x, y: current.y - 1, dist: 1 },
                { x: current.x + 1, y: current.y + 1, dist: 1.414 },
                { x: current.x - 1, y: current.y - 1, dist: 1.414 },
                { x: current.x + 1, y: current.y - 1, dist: 1.414 },
                { x: current.x - 1, y: current.y + 1, dist: 1.414 }
            ];
            
            for (const neighbor of neighbors) {
                if (neighbor.x >= 0 && neighbor.x < cols &&
                    neighbor.y >= 0 && neighbor.y < rows &&
                    !visited[neighbor.y][neighbor.x] &&
                    grid[neighbor.y][neighbor.x] === 0) {
                    
                    const newDist = distances[current.y][current.x] + neighbor.dist;
                    
                    if (newDist < distances[neighbor.y][neighbor.x]) {
                        distances[neighbor.y][neighbor.x] = newDist;
                        parent[neighbor.y][neighbor.x] = current;
                    }
                }
            }
        }
        
        // Reconstruct path
        let path = [];
        let current = end;
        
        if (parent[current.y][current.x] !== null || (current.x === start.x && current.y === start.y)) {
            while (current !== null) {
                path.unshift(current);
                current = parent[current.y][current.x];
            }
        } else {
            path = []; // No path found
        }
        
        if (callback) {
            callback(exploredNodes, path);
        }
        
        return {
            path: path,
            exploredNodes: exploredNodes,
            distances: distances
        };
    }
    
    /**
     * Find shortest path with animation
     * @param {number[][]} grid - 2D grid
     * @param {Object} start - Start position
     * @param {Object} end - End position
     * @param {Function} callback - Callback with (exploredSet, path, isComplete)
     * @param {number} speed - Animation speed in ms
     * @param {Object} cancellationToken - Token to cancel animation
     */
    static findShortestPathAnimated(grid, start, end, callback, speed = 50, cancellationToken = null) {
        const rows = grid.length;
        const cols = grid[0].length;
        const distances = Array(rows).fill(null).map(() => Array(cols).fill(Infinity));
        const parent = Array(rows).fill(null).map(() => Array(cols).fill(null));
        const visited = Array(rows).fill(null).map(() => Array(cols).fill(false));
        const exploredNodes = new Set();
        
        distances[start.y][start.x] = 0;
        
        let step = 0;
        const totalSteps = rows * cols;
        
        const animate = () => {
            if (cancellationToken && cancellationToken.cancel) return;
            
            if (step >= totalSteps) {
                // Animation complete
                let path = [];
                let current = end;
                
                if (parent[current.y][current.x] !== null || (current.x === start.x && current.y === start.y)) {
                    while (current !== null) {
                        path.unshift(current);
                        current = parent[current.y][current.x];
                    }
                }
                
                callback(exploredNodes, path, true);
                return;
            }
            
            // Find unvisited node with minimum distance
            let minDist = Infinity;
            let current = null;
            
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    if (!visited[y][x] && distances[y][x] < minDist) {
                        minDist = distances[y][x];
                        current = { x, y };
                    }
                }
            }
            
            if (!current || minDist === Infinity) {
                let path = [];
                let c = end;
                
                if (parent[c.y][c.x] !== null || (c.x === start.x && c.y === start.y)) {
                    while (c !== null) {
                        path.unshift(c);
                        c = parent[c.y][c.x];
                    }
                }
                
                callback(exploredNodes, path, true);
                return;
            }
            
            visited[current.y][current.x] = true;
            exploredNodes.add(`${current.x},${current.y}`);
            
            callback(exploredNodes, null, false);
            
            if (current.x === end.x && current.y === end.y) {
                let path = [];
                let c = end;
                
                if (parent[c.y][c.x] !== null || (c.x === start.x && c.y === start.y)) {
                    while (c !== null) {
                        path.unshift(c);
                        c = parent[c.y][c.x];
                    }
                }
                
                callback(exploredNodes, path, true);
                return;
            }
            
            // Check all 8 neighbors
            const neighbors = [
                { x: current.x + 1, y: current.y, dist: 1 },
                { x: current.x - 1, y: current.y, dist: 1 },
                { x: current.x, y: current.y + 1, dist: 1 },
                { x: current.x, y: current.y - 1, dist: 1 },
                { x: current.x + 1, y: current.y + 1, dist: 1.414 },
                { x: current.x - 1, y: current.y - 1, dist: 1.414 },
                { x: current.x + 1, y: current.y - 1, dist: 1.414 },
                { x: current.x - 1, y: current.y + 1, dist: 1.414 }
            ];
            
            for (const neighbor of neighbors) {
                if (neighbor.x >= 0 && neighbor.x < cols &&
                    neighbor.y >= 0 && neighbor.y < rows &&
                    !visited[neighbor.y][neighbor.x] &&
                    grid[neighbor.y][neighbor.x] === 0) {
                    
                    const newDist = distances[current.y][current.x] + neighbor.dist;
                    
                    if (newDist < distances[neighbor.y][neighbor.x]) {
                        distances[neighbor.y][neighbor.x] = newDist;
                        parent[neighbor.y][neighbor.x] = current;
                    }
                }
            }
            
            step++;
            setTimeout(animate, speed);
        };
        
        animate();
    }
}
class DijkstraSimulator {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.grid = null;
        this.start = null;
        this.end = null;
        this.path = null;
        this.secondPath = null;
        this.exploredNodes = new Set();
        this.exploredNodesSecond = new Set();
        this.animationRunning = false;
        this.animationPaused = false;
        this.cancellationToken = { cancel: false };
        
        this.visualizer = new Visualizer(this.canvas, this.ctx);
        this.initializeEventListeners();
        this.generateMap();
    }

    initializeEventListeners() {
        // Map controls
        document.getElementById('generateBtn').addEventListener('click', () => this.generateMap());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetVisualization());
        
        // Algorithm controls
        document.getElementById('shortestPathBtn').addEventListener('click', () => this.findShortestPath());
        document.getElementById('animateBtn').addEventListener('click', () => this.showAnimation());
        document.getElementById('secondPathBtn').addEventListener('click', () => this.findSecondPath());
        
        // Animation controls
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseAnimation());
        document.getElementById('resumeBtn').addEventListener('click', () => this.resumeAnimation());
        
        // Speed control
        document.getElementById('speed').addEventListener('input', (e) => {
            document.getElementById('speedValue').textContent = e.target.value + 'ms';
        });
    }

    generateMap() {
        if (this.animationRunning) {
            this.cancellationToken.cancel = true;
            return;
        }

        this.resetVisualization();
        
        const mapType = document.getElementById('mapType').value;
        const mapSize = parseInt(document.getElementById('mapSize').value);
        
        if (mapType === 'maze') {
            this.grid = MazeGenerator.generateMaze(mapSize, mapSize);
        } else {
            this.grid = MazeGenerator.generateRandomMap(mapSize, mapSize);
        }
        
        // Set start and end points
        this.start = { x: 1, y: 1 };
        this.end = { x: mapSize - 2, y: mapSize - 2 };
        
        // Make sure start and end are not walls
        this.grid[this.start.y][this.start.x] = 0;
        this.grid[this.end.y][this.end.x] = 0;
        
        this.visualizer.setGrid(this.grid);
        this.visualizer.setStartEnd(this.start, this.end);
        this.visualizer.render(this.exploredNodes, this.path, this.exploredNodesSecond, this.secondPath);
    }

    resetVisualization() {
        this.path = null;
        this.secondPath = null;
        this.exploredNodes.clear();
        this.exploredNodesSecond.clear();
        this.animationRunning = false;
        this.animationPaused = false;
        this.cancellationToken.cancel = false;
        
        // Reset UI
        document.getElementById('pauseBtn').style.display = 'none';
        document.getElementById('resumeBtn').style.display = 'none';
        document.getElementById('loadingIndicator').style.display = 'none';
        
        // Reset stats
        document.getElementById('distance').textContent = '-';
        document.getElementById('pathLength').textContent = '-';
        document.getElementById('distance2').textContent = '-';
        document.getElementById('nodesExplored').textContent = '-';
        document.getElementById('execTime').textContent = '-';
        
        if (this.visualizer && this.grid) {
            this.visualizer.render(this.exploredNodes, this.path, this.exploredNodesSecond, this.secondPath);
        }
    }

    findShortestPath() {
        if (!this.grid || !this.start || !this.end) return;
        if (this.animationRunning) return;
        
        this.resetVisualization();
        document.getElementById('loadingIndicator').style.display = 'flex';
        
        const startTime = performance.now();
        
        setTimeout(() => {
            const result = Dijkstra.findShortestPath(
                this.grid,
                this.start,
                this.end,
                (exploredSet, path) => {
                    this.exploredNodes = exploredSet;
                    this.path = path;
                }
            );
            
            const execTime = (performance.now() - startTime).toFixed(2);
            
            this.exploredNodes = result.exploredNodes;
            this.path = result.path;
            
            // Update stats
            if (this.path && this.path.length > 0) {
                const distance = this.calculateDistance(this.path);
                document.getElementById('distance').textContent = distance.toFixed(2);
                document.getElementById('pathLength').textContent = this.path.length;
            }
            document.getElementById('nodesExplored').textContent = this.exploredNodes.size;
            document.getElementById('execTime').textContent = execTime + 'ms';
            
            this.visualizer.render(this.exploredNodes, this.path, this.exploredNodesSecond, this.secondPath);
            document.getElementById('loadingIndicator').style.display = 'none';
        }, 10);
    }

    showAnimation() {
        if (!this.grid || !this.start || !this.end) return;
        if (this.animationRunning) return;
        
        this.resetVisualization();
        this.animationRunning = true;
        this.cancellationToken.cancel = false;
        
        document.getElementById('pauseBtn').style.display = 'block';
        document.getElementById('animateBtn').disabled = true;
        document.getElementById('shortestPathBtn').disabled = true;
        document.getElementById('generateBtn').disabled = true;
        
        const speed = parseInt(document.getElementById('speed').value);
        const showSteps = document.getElementById('showSteps').checked;
        
        const startTime = performance.now();
        let stepCount = 0;
        
        Dijkstra.findShortestPathAnimated(
            this.grid,
            this.start,
            this.end,
            (exploredSet, path, isComplete) => {
                if (this.cancellationToken.cancel) return;
                
                if (!this.animationPaused) {
                    this.exploredNodes = new Set(exploredSet);
                    if (isComplete) {
                        this.path = path;
                        this.visualizer.render(this.exploredNodes, this.path, this.exploredNodesSecond, this.secondPath);
                        this.animationCompleted(startTime, stepCount);
                    } else if (showSteps) {
                        this.visualizer.render(this.exploredNodes, null, this.exploredNodesSecond, this.secondPath);
                        stepCount++;
                    }
                }
            },
            speed,
            this.cancellationToken
        );
    }

    findSecondPath() {
        if (!this.grid || !this.start || !this.end || !this.path) {
            alert('Please find the shortest path first!');
            return;
        }
        if (this.animationRunning) return;
        
        // Create a modified grid with first path excluded
        const modifiedGrid = this.grid.map(row => [...row]);
        
        // Remove first path from grid
        for (const point of this.path) {
            if (!(point.x === this.start.x && point.y === this.start.y) &&
                !(point.x === this.end.x && point.y === this.end.y)) {
                modifiedGrid[point.y][point.x] = 1; // Mark as wall
            }
        }
        
        document.getElementById('loadingIndicator').style.display = 'flex';
        const startTime = performance.now();
        
        setTimeout(() => {
            const result = Dijkstra.findShortestPath(
                modifiedGrid,
                this.start,
                this.end,
                (exploredSet, path) => {
                    this.exploredNodesSecond = exploredSet;
                    this.secondPath = path;
                }
            );
            
            const execTime = (performance.now() - startTime).toFixed(2);
            
            if (result.path) {
                this.secondPath = result.path;
                this.exploredNodesSecond = result.exploredNodes;
                
                // Update stats
                const distance2 = this.calculateDistance(this.secondPath);
                document.getElementById('distance2').textContent = distance2.toFixed(2);
            } else {
                alert('No alternative path found!');
            }
            
            document.getElementById('execTime').textContent = execTime + 'ms';
            this.visualizer.render(this.exploredNodes, this.path, this.exploredNodesSecond, this.secondPath);
            document.getElementById('loadingIndicator').style.display = 'none';
        }, 10);
    }

    animationCompleted(startTime, stepCount) {
        const execTime = (performance.now() - startTime).toFixed(2);
        
        if (this.path && this.path.length > 0) {
            const distance = this.calculateDistance(this.path);
            document.getElementById('distance').textContent = distance.toFixed(2);
            document.getElementById('pathLength').textContent = this.path.length;
        }
        document.getElementById('nodesExplored').textContent = this.exploredNodes.size;
        document.getElementById('execTime').textContent = execTime + 'ms';
        
        this.animationRunning = false;
        document.getElementById('pauseBtn').style.display = 'none';
        document.getElementById('animateBtn').disabled = false;
        document.getElementById('shortestPathBtn').disabled = false;
        document.getElementById('generateBtn').disabled = false;
    }

    pauseAnimation() {
        this.animationPaused = true;
        document.getElementById('pauseBtn').style.display = 'none';
        document.getElementById('resumeBtn').style.display = 'block';
    }

    resumeAnimation() {
        this.animationPaused = false;
        document.getElementById('resumeBtn').style.display = 'none';
        document.getElementById('pauseBtn').style.display = 'block';
    }

    calculateDistance(path) {
        if (!path || path.length < 2) return 0;
        let distance = 0;
        for (let i = 0; i < path.length - 1; i++) {
            const dx = path[i + 1].x - path[i].x;
            const dy = path[i + 1].y - path[i].y;
            distance += Math.sqrt(dx * dx + dy * dy);
        }
        return distance;
    }
}

// Initialize simulator on page load
window.addEventListener('DOMContentLoaded', () => {
    new DijkstraSimulator();
});
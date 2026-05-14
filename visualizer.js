class Visualizer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.grid = null;
        this.start = null;
        this.end = null;
        this.cellSize = 20;
        this.colors = {
            wall: '#888888',
            walkable: '#ffffff',
            explored: '#3F51B5',
            path: '#FF9800',
            pathSecond: '#9C27B0',
            start: '#4CAF50',
            end: '#F44336'
        };
        
        window.addEventListener('resize', () => this.resizeCanvas());
        this.resizeCanvas();
    }

    setGrid(grid) {
        this.grid = grid;
        this.resizeCanvas();
    }

    setStartEnd(start, end) {
        this.start = start;
        this.end = end;
    }

    resizeCanvas() {
        if (!this.grid) return;
        
        const rows = this.grid.length;
        const cols = this.grid[0].length;
        
        // Calculate cell size to fit in container
        const containerWidth = this.canvas.parentElement.clientWidth - 40;
        const containerHeight = window.innerHeight * 0.8;
        
        this.cellSize = Math.min(
            Math.floor(containerWidth / cols),
            Math.floor(containerHeight / rows),
            30
        );
        
        this.canvas.width = cols * this.cellSize;
        this.canvas.height = rows * this.cellSize;
    }

    render(exploredNodes, path, exploredNodesSecond, pathSecond) {
        if (!this.grid) return;
        
        const rows = this.grid.length;
        const cols = this.grid[0].length;
        
        // Clear canvas
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const key = `${x},${y}`;
                
                if (this.grid[y][x] === 1) {
                    // Wall
                    this.drawCell(x, y, this.colors.wall);
                } else if (pathSecond && pathSecond.some(p => p.x === x && p.y === y)) {
                    // Second shortest path
                    this.drawCell(x, y, this.colors.pathSecond);
                } else if (path && path.some(p => p.x === x && p.y === y)) {
                    // Shortest path
                    this.drawCell(x, y, this.colors.path);
                } else if (exploredNodesSecond && exploredNodesSecond.has(key)) {
                    // Explored nodes (second search)
                    const alpha = 0.2;
                    this.drawCellWithAlpha(x, y, this.colors.pathSecond, alpha);
                } else if (exploredNodes && exploredNodes.has(key)) {
                    // Explored nodes (first search)
                    const alpha = 0.4;
                    this.drawCellWithAlpha(x, y, this.colors.explored, alpha);
                }
            }
        }
        
        // Draw start and end
        if (this.start) {
            this.drawCircle(this.start.x, this.start.y, this.colors.start, 'S');
        }
        if (this.end) {
            this.drawCircle(this.end.x, this.end.y, this.colors.end, 'E');
        }
        
        // Draw grid lines (optional)
        this.drawGridLines();
    }

    drawCell(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(
            x * this.cellSize,
            y * this.cellSize,
            this.cellSize,
            this.cellSize
        );
    }

    drawCellWithAlpha(x, y, color, alpha) {
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = color;
        this.ctx.fillRect(
            x * this.cellSize,
            y * this.cellSize,
            this.cellSize,
            this.cellSize
        );
        this.ctx.globalAlpha = 1.0;
    }

    drawCircle(x, y, color, text = '') {
        const centerX = x * this.cellSize + this.cellSize / 2;
        const centerY = y * this.cellSize + this.cellSize / 2;
        const radius = this.cellSize / 2 - 2;
        
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        if (text) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = `bold ${this.cellSize * 0.6}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(text, centerX, centerY);
        }
        
        // Draw border
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    drawGridLines() {
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 0.5;
        
        const rows = this.grid.length;
        const cols = this.grid[0].length;
        
        // Vertical lines
        for (let x = 0; x <= cols; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.cellSize, 0);
            this.ctx.lineTo(x * this.cellSize, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= rows; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.cellSize);
            this.ctx.lineTo(this.canvas.width, y * this.cellSize);
            this.ctx.stroke();
        }
    }
}
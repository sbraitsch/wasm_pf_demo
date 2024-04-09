interface GridNode {
    idx: number;
    tentCost: number;
    cost: number;
}

export function shortestPath(start: number, end: number, dimX: number, dimY: number, walls: number[], heuristic: boolean, diagonals: boolean): number[] {
    let openList = [];
    let visited = new Set();
    let search_trace = [];
    let prevMap = new Map();

    let startNode: GridNode = {
        idx: start,
        tentCost: manhattan(start, end, dimX),
        cost: 0
    }
    openList.push(startNode);
    visited.add(start);
    prevMap.set(start, undefined);

    while (openList.length > 0) {
        openList = openList.sort((a, b) => b.tentCost - a.tentCost);
        let current =  openList.pop()!;
        search_trace.push(current.idx);

        if (current.idx === end) {
            let n = prevMap.get(current.idx);
            while (n !== undefined) {
                search_trace.push(n);
                n = prevMap.get(n);
            }
            return search_trace;
        } else {
            let adjacents = getAdjacent(current.idx, dimX, dimY, diagonals);
            for (let i = 0; i < adjacents.length; i++) {
                let ad = adjacents[i];
                if (walls.includes(ad)) {
                    continue;
                } else if (!visited.has(ad)) {
                    visited.add(ad);
                    let newNode: GridNode = {
                        idx: ad,
                        cost: current.cost + 1,
                        tentCost: heuristic ? current.cost + manhattan(ad, end, dimX) : current.cost + 1
                    }
                    openList.push(newNode);
                    prevMap.set(ad, current.idx);
                    search_trace.push(ad);
                }
            }
        }
    }
    return search_trace;
}

function getAdjacent(idx: number, dimX: number, dimY: number, diagonals: boolean): number[] {
    let [x, y] = indexToCoords(idx, dimX);

    let adjacent = [];
    if (x > 0) {
        adjacent.push(idx - 1);
        if (diagonals) {
            if (y > 0) {
                adjacent.push(idx - 1 - dimX);
            }
            if (y < dimY - 1) {
                adjacent.push(idx - 1 + dimX);
            }
        }
    }
    if (x < dimX - 1) {
        adjacent.push(idx + 1);
        if (diagonals) {
            if (y > 0) {
                adjacent.push(idx + 1 - dimX);
            }
            if (y < dimY - 1) {
                adjacent.push(idx + 1 + dimX);
            }
        }
    }
    if (y > 0) {
        adjacent.push(idx - dimX);
    }
    if (y < dimY - 1) {
        adjacent.push(idx + dimX);
    }
    return adjacent;
}

function manhattan(start: number, end: number, dimX: number): number {
    let [x1, y1] = indexToCoords(start, dimX);
    let [x2, y2] = indexToCoords(end, dimX);

    let xDif = Math.abs(x2 - x1);
    let yDif = Math.abs(y2 - y1);

    return xDif + yDif;

}

function indexToCoords(idx: number, dimX: number): number[] {
    return [idx % dimX, Math.floor(idx / dimX)]
}
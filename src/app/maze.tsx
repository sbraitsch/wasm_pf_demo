"use client";

import React, { useEffect, useState } from "react";
import Square from "./square";
import { Slider, Typography, Button, ToggleButton, ToggleButtonGroup, createTheme, ThemeProvider, Switch, FormGroup, FormControlLabel } from "@mui/material";
import styles from "./page.module.css";
import init, { find_path } from "../wasm/wasm_pf";

let mouseDown = false;
document.body.onmousedown = function () {
  mouseDown = true;
};
document.body.onmouseup = function () {
  mouseDown = false;
};

interface GridNode {
  visited: boolean;
  isStart: boolean;
  isEnd: boolean;
  isPath: boolean;
  isWall: boolean;
  registered: boolean;
}

const theme = createTheme({
    palette: {
      primary: {
        main: '#ffffff',
        dark: '#ffffff',
        light: '#ffffff'
      },
    },
  });

const Maze: React.FC = () => {
  init();
  const sizes = [
    { x: 5, y: 5, s: 100 },
    { x: 40, y: 28, s: 25 },
    { x: 100, y: 60, s: 10 },
  ];
  const [mazeScale, setMazeScale] = useState<number>(2);
  const [heuristic, setHeuristic] = useState(false);
  const [diagonals, setDiagonals] = useState(false);
  const [start, setStart] = useState(-1);
  const [end, setEnd] = useState(-1);
  const [walls, setWalls] = useState<number[]>([]);
  let [nodes, setNodes] = useState<GridNode[][]>(
    [...Array(sizes[mazeScale - 1].y)].map((e) =>
      Array(sizes[mazeScale - 1].x).fill({
        visited: false,
        isStart: false,
        isEnd: false,
        isPath: false,
        isWall: false,
        registered: false,
      })
    )
  );

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${sizes[mazeScale - 1].x}, ${
      sizes[mazeScale - 1].s
    }px)`,
    gap: "3px",
    animation: 'fadeIn 1s'
  };

  let [assignMode, setAssignMode] = useState(0);

  const handleScaleChange = (newScale: number) => {
    setMazeScale(newScale);
    setNodes(
      [...Array(sizes[newScale - 1].y)].map((e) =>
        Array(sizes[newScale - 1].x).fill({
          visited: false,
          isStart: false,
          isEnd: false,
          isPath: false,
          isWall: false,
          registered: false,
        })
      )
    );
    setAssignMode(0);
  };

  const triggerWasm = async () => {
    setAssignMode(3);
    let dimX = sizes[mazeScale - 1].x;
    let dimY = sizes[mazeScale - 1].y;

    let path = find_path(start, end, dimX, dimY, Uint32Array.from(walls), heuristic, diagonals);

    let batchSize = 10;

    for (let i = 0; i < path.length; i += batchSize) {
        let gridState = [...nodes];
        if ((path.length - i) < batchSize) {
            batchSize = path.length - i;
        }
        for(let j = i; j < i + batchSize; j++) {
            let x = path[j] % dimX;
            let y = Math.floor(path[j] / dimX);
            let nodeCopy = { ...gridState[y][x] };
            if (nodeCopy.visited) {
                nodeCopy.isPath = true;
            } else if (nodeCopy.registered) {
                nodeCopy.visited = true;
            } else {
                nodeCopy.registered = true;
            }
            gridState[y][x] = nodeCopy;
        }
        await new Promise(res => setTimeout(res, 10));
        setNodes(gridState);
    }
  };

  let button;
  switch (assignMode) {
    case 0:
      button = (
        <Button
          variant="contained"
          color="error"
        >
          {"Set Start"}
        </Button>
      );
      break;
    case 1:
      button = (
        <Button
          variant="contained"
          color="error"
        >
          {"Set Target"}
        </Button>
      );
      break;
    case 2:
      button = (
        <Button
          variant="contained"
          color="success"
          onClick={() => triggerWasm()}
        >
          {"Add Walls and Go"}
        </Button>
      );
      break;
    case 3:
      button = (
        <Button
            variant="contained"
            color="success"
            onClick={() => handleScaleChange(mazeScale)}
        >
            {"Reset"}
        </Button>
        );
      break;
  }

  const getColor = (node: GridNode) => {
    if (node.isStart) {
      return "lightblue";
    } else if (node.isEnd) {
      return "yellow";
    } else if (node.isWall) {
      return "#190D32";
    } else if (node.isPath) {
      return "#9d4f0f";
    } else if (node.visited) {
      return "#a5ea5f";
    } else if (node.registered) {
      return "#53504f";
    }
    return "#453bd1";
  };

  const handleClick = (y: number, x: number) => {
    let gridState = [...nodes];
    switch (assignMode) {
      case 0: {
        let nodeCopy = { ...gridState[y][x] };
        nodeCopy.isStart = true;
        gridState[y][x] = nodeCopy;
        setStart(getIndex(x, y));
        setNodes(gridState);
        setAssignMode(1);
        break;
      }
      case 1: {
        let nodeCopy = { ...gridState[y][x] };
        nodeCopy.isEnd = true;
        gridState[y][x] = nodeCopy;
        setEnd(getIndex(x, y));
        setNodes(gridState);
        setAssignMode(2);
        break;
      }
      case 2: {
        let nodeCopy = { ...gridState[y][x] };
        nodeCopy.isWall = true;
        gridState[y][x] = nodeCopy;
        let newWalls = [...walls];
        newWalls.push(getIndex(x, y));
        setWalls(newWalls);
        setNodes(gridState);
        break;
      }
      case 3: {
        handleScaleChange(mazeScale);
        break;
      }
      default:
        return;
    }
  };

  const handleDrag = (y: number, x: number) => {
    if (assignMode === 2 && mouseDown) {
      let gridState = [...nodes];
      let nodeCopy = { ...gridState[y][x] };
      nodeCopy.isWall = true;
      gridState[y][x] = nodeCopy;
      walls.push(getIndex(x, y));
      setNodes(gridState);
    }
  };

  const getIndex = (x: number, y: number) => {
    return sizes[mazeScale-1].x * y + x;
  }

  return (
    <ThemeProvider theme={theme}>
      <div className={styles.sliderGrid}>
        <Typography id="x-slider" gutterBottom color={"white"}>
          Maze Scale:
        </Typography>
        <Slider
          aria-label="Scale"
          aria-labelledby="x-slider"
          valueLabelDisplay="on"
          min={1}
          max={3}
          step={1}
          marks
          value={mazeScale}
          onChange={(_, v) => handleScaleChange(v as number)}
        />
        <FormGroup>
            <FormControlLabel control={<Switch color="primary" checked={heuristic} onChange={() => setHeuristic(!heuristic)}/>} label="Heuristic" />
            <FormControlLabel control={<Switch color="primary" checked={diagonals} onChange={() => setDiagonals(!diagonals)}/>} label="Diagonals" />
        </FormGroup>
        {button}
      </div>

      <div style={gridStyle} className={styles.maze}>
        {nodes.map((row, rInd) =>
          row.map((col, cInd) => (
            <Square
              key={rInd + "-" + cInd}
              color={getColor(col)}
              size={sizes[mazeScale - 1].s}
              onClick={() => handleClick(rInd, cInd)}
              onMouseOver={() => handleDrag(rInd, cInd)}
            />
          ))
        )}
      </div>
    </ThemeProvider>
  );
};

export default Maze;

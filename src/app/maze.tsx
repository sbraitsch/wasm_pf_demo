"use client";

import React, { useState } from "react";
import Square from "./square";
import {
  Slider,
  Typography,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  createTheme,
  ThemeProvider,
  Switch,
  FormGroup,
  FormControlLabel,
} from "@mui/material";
import styles from "./page.module.css";
import init, { find_path } from "../wasm/wasm_pf";
import { shortestPath } from "./pathfinder";

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
      main: "#000",
      dark: "#000",
      light: "#000",
      contrastText: "#000",
    },
  },
});

const Maze: React.FC = () => {
  init();
  const sizes = [
    { x: 6, y: 5, s: 100 },
    { x: 40, y: 28, s: 25 },
    { x: 100, y: 60, s: 10 },
  ];
  const [mazeScale, setMazeScale] = useState<number>(2);
  const [heuristic, setHeuristic] = useState(false);
  const [diagonals, setDiagonals] = useState(true);
  const [wasm, setWasm] = useState(false);
  const [start, setStart] = useState(-1);
  const [end, setEnd] = useState(-1);
  const [walls, setWalls] = useState<number[]>([]);
  const [resData, setResData] = useState("");
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
    animation: "fadeIn 1s",
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
    setWalls([]);
    setResData("");
  };

  const triggerSearch = async () => {
    setAssignMode(3);
    let dimX = sizes[mazeScale - 1].x;
    let dimY = sizes[mazeScale - 1].y;

    let timerStart = performance.now();
    let path = wasm
      ? find_path(
          start,
          end,
          dimX,
          dimY,
          Uint32Array.from(walls),
          heuristic,
          diagonals
        )
      : shortestPath(start, end, dimX, dimY, walls, heuristic, diagonals);
    let executionTime = (performance.now() - timerStart).toFixed(1);

    let batchSize = mazeScale === 3 ? 100 : 10;
    let pl = 0;
    for (let i = 0; i < path.length; i += batchSize) {
      let gridState = [...nodes];
      if (path.length - i < batchSize) {
        batchSize = path.length - i;
      }
      for (let j = i; j < i + batchSize; j++) {
        let x = path[j] % dimX;
        let y = Math.floor(path[j] / dimX);
        let nodeCopy = { ...gridState[y][x] };
        if (nodeCopy.visited) {
          nodeCopy.isPath = true;
          pl++;
        } else if (nodeCopy.registered) {
          nodeCopy.visited = true;
        } else {
          nodeCopy.registered = true;
        }
        gridState[y][x] = nodeCopy;
      }
      await new Promise((res) => setTimeout(res, 10));
      setNodes(gridState);
      setResData(`Path: ${pl}, Time: ${executionTime}ms`);
    }
  };

  let button;
  switch (assignMode) {
    case 0:
      button = (
        <Button variant="contained" color="error">
          {"Click Start Node"}
        </Button>
      );
      break;
    case 1:
      button = (
        <Button variant="contained" color="error">
          {"Click Target Node"}
        </Button>
      );
      break;
    case 2:
      button = (
        <Button
          variant="contained"
          color="success"
          onClick={() => triggerSearch()}
        >
          {"Draw Walls and Start"}
        </Button>
      );
      break;
    case 3:
      button = (
        <Button
          variant="contained"
          color="warning"
          onClick={() => handleScaleChange(mazeScale)}
        >
          {`${resData} | Reset`}
        </Button>
      );
      break;
  }

  const getColor = (node: GridNode) => {
    if (node.isStart) {
      return "cyan";
    } else if (node.isEnd) {
      return "#62f97b";
    } else if (node.isWall && assignMode !== 3) {
      return "whitesmoke";
    } else if (node.isWall) {
      return "#000";
    } else if (node.isPath) {
      return "red";
    } else if (node.visited) {
      return "#ffe925";
    } else if (node.registered) {
      return "#b2a7a7";
    } else if (assignMode === 3) {
      return "whitesmoke";
    }
    return "#000";
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
    return sizes[mazeScale - 1].x * y + x;
  };

  const presetWall = () => {
    let wl: number[] = [];
    let x = sizes[mazeScale - 1].x;
    let y = sizes[mazeScale - 1].y;

    let x1 = Math.floor(x / 3);
    let count = Math.floor(y / 3) * 2;

    let gridState = [...nodes];

    for (let i = 0; i < count; i++) {
      let idx1 = x * i + x1;
      let idx2 = x * (y - i - 1) + x1 * 2;
      let nodeCopy1 = { ...gridState[i][x1] };
      let nodeCopy2 = { ...gridState[y - i - 1][x1 * 2] };
      nodeCopy1.isWall = true;
      nodeCopy2.isWall = true;
      gridState[i][x1] = nodeCopy1;
      gridState[y - i - 1][x1 * 2] = nodeCopy2;
      wl.push(idx1);
      wl.push(idx2);
    }
    setNodes(gridState);
    setWalls(wl);
  };

  const wallPresetButton = (
    <Button variant="contained" color="warning" onClick={() => presetWall()}>
      {"Add Wall Preset"}
    </Button>
  );

  return (
    <ThemeProvider theme={theme}>
      <div className={styles.sliderGrid}>
        <Typography id="x-slider" gutterBottom color={"black"}>
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
        <FormGroup color="primary" row>
          <FormControlLabel
            color="primary"
            control={
              <Switch
                color="primary"
                checked={heuristic}
                onChange={() => setHeuristic(!heuristic)}
              />
            }
            label={<Typography color="primary">Heuristic</Typography>}
          />
          <FormControlLabel
            color="primary"
            control={
              <Switch
                color="primary"
                checked={diagonals}
                onChange={() => setDiagonals(!diagonals)}
              />
            }
            label={<Typography color="primary">Diagonal</Typography>}
          />
          <FormControlLabel
            color="primary"
            control={
              <Switch
                color="primary"
                checked={wasm}
                onChange={() => setWasm(!wasm)}
              />
            }
            label={<Typography color="primary">WASM</Typography>}
          />
        </FormGroup>
        {wallPresetButton}
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

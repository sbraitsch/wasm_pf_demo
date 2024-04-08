mod pathfinding;

use pathfinding::shortest_path;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn find_path(
    start_idx: usize,
    end_idx: usize,
    dim_x: usize,
    dim_y: usize,
    walls: &[usize],
    heuristic: bool,
    diagonals: bool,
) -> Vec<usize> {
    shortest_path(
        walls, start_idx, end_idx, dim_x, dim_y, heuristic, diagonals,
    )
}

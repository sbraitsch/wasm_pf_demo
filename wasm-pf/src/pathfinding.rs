use std::{
    cmp::Ordering,
    collections::{BinaryHeap, HashMap, HashSet},
};

#[derive(Eq, PartialEq, Debug, Clone)]
struct Node {
    idx: usize,
    tent_cost: usize,
    cost: usize,
}

// reverse natural order to create minheap
impl Ord for Node {
    fn cmp(&self, other: &Self) -> Ordering {
        other.tent_cost.cmp(&self.tent_cost)
    }
}

impl PartialOrd for Node {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

pub fn shortest_path(
    walls: &[usize],
    start: usize,
    target: usize,
    dim_x: usize,
    dim_y: usize,
    heuristic: bool,
    diagonals: bool,
) -> Vec<usize> {
    let mut open_list = BinaryHeap::new();
    let mut visited: HashSet<usize> = HashSet::new();
    let mut search_trace: Vec<usize> = Vec::new();
    let mut prev_map: HashMap<usize, Option<usize>> = HashMap::new();

    open_list.push(Node {
        idx: start,
        cost: 0,
        tent_cost: manhattan(start, target, dim_x),
    });
    visited.insert(start);
    prev_map.insert(start, None);

    while let Some(Node {
        idx,
        cost,
        tent_cost,
    }) = open_list.pop()
    {
        search_trace.push(idx);
        if idx == target {
            let mut current = prev_map.get(&idx);
            while let Some(Some(prev_node)) = current {
                search_trace.push(*prev_node);
                current = prev_map.get(prev_node);
            }
            return search_trace;
        } else {
            for adj in get_adjacent(idx, dim_x, dim_y, diagonals) {
                if walls.contains(&adj) {
                    continue;
                }
                if visited.insert(adj) {
                    open_list.push(Node {
                        idx: adj,
                        cost: cost + 1,
                        tent_cost: if heuristic {
                            cost + manhattan(adj, target, dim_x)
                        } else {
                            cost + 1
                        },
                    });
                    prev_map.insert(adj, Some(idx));
                    search_trace.push(adj)
                }
            }
        }
    }
    search_trace
}

fn get_adjacent<'a>(idx: usize, dim_x: usize, dim_y: usize, diagonals: bool) -> Vec<usize> {
    let x = idx % dim_x;
    let y = idx / dim_x;

    let mut adj = Vec::new();
    if x > 0 {
        adj.push(idx - 1);
        if diagonals {
            if y > 0 {
                adj.push(idx - 1 - dim_x);
            }
            if y < dim_y - 1 {
                adj.push(idx - 1 + dim_x);
            }
        }
    }
    if x < dim_x - 1 {
        adj.push(idx + 1);
        if diagonals {
            if y > 0 {
                adj.push(idx + 1 - dim_x);
            }
            if y < dim_y - 1 {
                adj.push(idx + 1 + dim_x);
            }
        }
    }
    if y > 0 {
        adj.push(idx - dim_x);
    }
    if y < dim_y - 1 {
        adj.push(idx + dim_x);
    }

    adj
}

fn manhattan(idx: usize, target: usize, dim_x: usize) -> usize {
    let (x1, y1) = idx_to_coords(idx, dim_x);
    let (x2, y2) = idx_to_coords(target, dim_x);

    ((x2 - x1).abs() + (y2 - y1).abs()) as usize
}

fn idx_to_coords(idx: usize, dim_x: usize) -> (i32, i32) {
    ((idx % dim_x) as i32, (idx / dim_x) as i32)
}

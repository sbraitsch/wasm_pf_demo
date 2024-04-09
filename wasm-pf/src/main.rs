use pathfinding::shortest_path;

mod pathfinding;

fn main() {
    let path = shortest_path(&[], 0, 5999, 100, 60, true, true);
}

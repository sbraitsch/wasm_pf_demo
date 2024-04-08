use pathfinding::shortest_path;

mod pathfinding;

fn main() {
    let path = shortest_path(&[], 6, 18, 5, 5, true, true);
}

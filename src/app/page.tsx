import Maze from "./maze";
import styles from "./page.module.css";


export default function Home() {

  return (
    <div className={styles.main}>
        <Maze/>
    </div>
  );
}

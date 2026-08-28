import type { ReactNode } from "react";
import { store, asset } from "../app-store";
import styles from "./Shell.module.scss";
export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.masthead}>
        <a className={styles.brand} href="#/" aria-label="Chronicles of Orrin">
          <img src={asset("logo.png")} alt="Chronicles of Orrin" />
        </a>
      </header>
      {store.warning && (
        <div className={styles.warning} role="alert">
          {store.warning}
        </div>
      )}
      <main className={styles.content}>{children}</main>
      <footer className={styles.footer}>
        Made for the wastes ·{" "}
        <a
          href="https://www.dndbeyond.com/srd"
          target="_blank"
          rel="noreferrer"
        >
          SRD 5.2 · CC BY 4.0
        </a>
      </footer>
    </div>
  );
}

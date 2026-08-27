import type { ReactNode } from "react";
import { store, asset } from "../app-store";
export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell">
      <header className="masthead">
        <a className="brand" href="#/" aria-label="Chronicles of Orrin">
          <img src={asset("logo.png")} alt="Chronicles of Orrin" />
        </a>
      </header>
      {store.warning && (
        <div className="warning" role="alert">
          {store.warning}
        </div>
      )}
      <main>{children}</main>
      <footer>
        Made for the wastes ·{" "}
        <a
          href="https://www.dndbeyond.com/srd"
          target="_blank"
          rel="noreferrer"
        >
          SRD 5.1 · CC BY 4.0
        </a>
      </footer>
    </div>
  );
}

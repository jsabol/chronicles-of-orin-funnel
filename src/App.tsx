import { useEffect, useState } from "react";
import { store } from "./app-store";
import { Shell } from "./components/Shell";
import { Roster } from "./components/Roster";
import { Editor } from "./components/CharacterEditor";
import "choices.js/public/assets/styles/choices.min.css";
import "./App.module.scss";

export default function App() {
  const [state, setState] = useState(store.getState());
  const [route, setRoute] = useState(location.hash || "#/");
  useEffect(() => {
    const update = () => setRoute(location.hash || "#/");
    addEventListener("hashchange", update);
    if (!location.hash) location.hash = "#/";
    return () => removeEventListener("hashchange", update);
  }, []);
  const refresh = () => setState(store.getState());
  const match = route.match(/^#\/characters\/([^/]+)$/);
  return (
    <Shell>
      {match ? (
        <Editor id={match[1]} state={state} refresh={refresh} />
      ) : (
        <Roster state={state} refresh={refresh} />
      )}
    </Shell>
  );
}

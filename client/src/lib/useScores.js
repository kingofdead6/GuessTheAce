import { useEffect, useState } from "react";
import { topScores } from "./leaderboard.js";

// status: loading | ready | error
export function useScores({ difficulty, series = "all", limit = 10 } = {}) {
  const [state, setState] = useState({ status: "loading", rows: [], error: "" });

  useEffect(() => {
    const ctrl = new AbortController();
    setState((s) => ({ ...s, status: "loading" }));
    topScores({ difficulty, series, limit, signal: ctrl.signal })
      .then((rows) => setState({ status: "ready", rows, error: "" }))
      .catch((err) => {
        if (!ctrl.signal.aborted) setState({ status: "error", rows: [], error: err.message });
      });
    return () => ctrl.abort();
  }, [difficulty, series, limit]);

  return state;
}

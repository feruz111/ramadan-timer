import { useState, useEffect, useRef } from "react";
import type { CountdownState } from "../types";

export function useCountdown(target: Date | null): CountdownState {
  const [state, setState] = useState<CountdownState>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isComplete: false,
  });

  const targetRef = useRef(target);
  targetRef.current = target;

  useEffect(() => {
    if (!target) return;

    function tick() {
      const now = Date.now();
      const diff = (targetRef.current?.getTime() ?? 0) - now;

      if (diff <= 0) {
        setState({ hours: 0, minutes: 0, seconds: 0, isComplete: true });
        return;
      }

      const totalSec = Math.floor(diff / 1000);
      setState({
        hours: Math.floor(totalSec / 3600),
        minutes: Math.floor((totalSec % 3600) / 60),
        seconds: totalSec % 60,
        isComplete: false,
      });
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return state;
}

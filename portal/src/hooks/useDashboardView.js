import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export default function useDashboardView(views) {
  const fallback = views[0].id;
  const [params, setParams] = useSearchParams();
  const raw = params.get("view");
  const view = views.some((item) => item.id === raw) ? raw : fallback;

  const setView = useCallback(
    (id) => {
      setParams((previous) => {
        const next = new URLSearchParams(previous);
        if (id === fallback) next.delete("view");
        else next.set("view", id);
        return next;
      });
    },
    [fallback, setParams]
  );

  return [view, setView];
}
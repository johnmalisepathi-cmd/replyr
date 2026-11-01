import { useEffect, useState } from "react";

// Hash routing (#/dashboard) so the static build works on any host.
export function useRoute() {
  const get = () => window.location.hash.replace(/^#/, "") || "/";
  const [route, setRoute] = useState(get);
  useEffect(() => {
    const on = () => {
      setRoute(get());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
}

export function go(path) {
  window.location.hash = path;
}

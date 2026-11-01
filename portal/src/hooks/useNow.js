import { useEffect, useState } from "react";

export default function useNow(offsetMs = 0) {
  const [now, setNow] = useState(() => new Date(Date.now() + offsetMs));
  useEffect(() => {
    setNow(new Date(Date.now() + offsetMs));
    const id = setInterval(() => setNow(new Date(Date.now() + offsetMs)), 1000);
    return () => clearInterval(id);
  }, [offsetMs]);
  return now;
}
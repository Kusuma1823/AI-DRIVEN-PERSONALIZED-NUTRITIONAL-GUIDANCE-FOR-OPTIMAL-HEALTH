import { useEffect, useState } from "react";
import { getSession } from "../features/auth/authStorage";

export function useSession() {
  const [session, setSession] = useState(() => getSession());

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === "efood.session") {
        setSession(getSession());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return session;
}


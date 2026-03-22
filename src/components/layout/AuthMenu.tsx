import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getSession, signOut } from "../../features/auth/authStorage";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";

export function AuthMenu() {
  const navigate = useNavigate();
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

  return (
    <div className="flex items-center gap-3">
      {session ? (
        <>
          <Badge tone="green">Hi, {session.name}</Badge>
          <Button
            variant="secondary"
            onClick={() => {
              signOut();
              setSession(null);
              navigate("/login");
            }}
          >
            Sign out
          </Button>
        </>
      ) : (
        <>
          <Link to="/login">
            <Button variant="secondary">Login</Button>
          </Link>
          <Link to="/signup">
            <Button>Create account</Button>
          </Link>
        </>
      )}
    </div>
  );
}


import { useEffect } from "react";
import { useParams } from "react-router-dom";

const PROMOTEUR_URL = import.meta.env.VITE_PROMOTEUR_URL || "http://localhost:8081";

const AcceptInvitationRedirect = () => {
  const { token } = useParams<{ token: string }>();

  useEffect(() => {
    if (!token) {
      window.location.replace("/");
      return;
    }

    const localToken = localStorage.getItem("token");
    const destination = new URL(`/accept-invitation/${token}`, PROMOTEUR_URL);

    if (localToken) {
      destination.searchParams.set("token", localToken);
    }

    window.location.replace(destination.toString());
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-sm text-gray-600">Redirection en cours...</p>
    </div>
  );
};

export default AcceptInvitationRedirect;

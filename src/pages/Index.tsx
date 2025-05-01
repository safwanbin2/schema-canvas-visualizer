
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to dashboard or login
    const user = localStorage.getItem("erd-user");
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
    </div>
  );
};

export default Index;

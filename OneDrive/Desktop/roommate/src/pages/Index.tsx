import { LandingPage } from "@/components/landing/LandingPage";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const handleHostelJoined = () => {
    navigate("/lobby");
  };

  return <LandingPage onHostelJoined={handleHostelJoined} />;
};

export default Index;

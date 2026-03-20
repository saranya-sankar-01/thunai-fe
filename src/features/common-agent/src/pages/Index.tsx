import { AgentCreationTabs } from "../components/AgentCreationTabs";
import MyAgents from "./MyAgents";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-1 py-8">
        <AgentCreationTabs />
        {/* <MyAgents/> */}
      </div>
    </div>
  );
};

export default Index;
import { AgentCreationTabs } from "../components/AgentCreationTabs";
import { useParams } from "react-router-dom";

const EditAgent = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* <div className="space-y-2 mb-6">
          <h1 className="text-3xl font-bold text-thunai-text-primary">Edit Agent</h1>
          <p className="text-thunai-text-secondary">
            Modify instructions, workflows, security, and logs for Agent ID: {id}
          </p>
        </div> */}
        <AgentCreationTabs />
      </div>
    </div>
  );
};

export default EditAgent;
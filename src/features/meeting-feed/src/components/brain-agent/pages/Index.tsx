import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Settings, Bell, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
// import "@/components/brain-agent/agent.css"

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto py-16 px-4">
          <div className="mb-8">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => navigate("/meeting-feed/MeetingAssistants")}
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Button>
        </div>
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="h-12 w-12 text-primary" />
            <h1 className="text-5xl font-bold text-foreground">Thunai Brain Agents</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Intelligent meeting management with AI-powered content curation and approval workflows
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="border-2 hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg">
            <CardHeader>
              <Brain className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Agent Configuration</CardTitle>
              <CardDescription>
                Create and manage agents that define criteria and format for adding meeting content to your Brain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate("/meeting-feed/agent-config")} 
                className="w-full gap-2"
              >
                <Settings className="h-4 w-4" />
                Manage Agents
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-accent/50 transition-all cursor-pointer hover:shadow-lg">
            <CardHeader>
              <Bell className="h-8 w-8 text-accent mb-2" />
              <CardTitle>Approval Workflow</CardTitle>
              <CardDescription>
                Review, edit, and approve meeting content before it's added to your Brain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate("/meeting-feed/approvals")} 
                variant="secondary"
                className="w-full gap-2"
              >
                <Bell className="h-4 w-4" />
                View Approvals
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Card className="max-w-3xl mx-auto bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-3 text-foreground">How It Works</h2>
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">1</span>
                    Configure
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Create agents with meeting criteria and content format templates
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-accent font-semibold">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-accent-foreground text-sm">2</span>
                    Review
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for meetings that match your criteria
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-success font-semibold">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-success text-white text-sm">3</span>
                    Approve
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Review, edit, and approve content before adding to your Brain
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;

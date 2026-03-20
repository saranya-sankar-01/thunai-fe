
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Users, MessageSquare, Calendar, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-white font-semibold text-xl">thunai</span>
            </div>
            <Link to="/companion/revai/contacts">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Open Contacts
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            AI-Powered CRM for
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {" "}Modern Teams
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Automatically track conversations, extract action items, and get AI assistance 
            for all your customer interactions. Save time and never miss a follow-up.
          </p>
          <Link to="/companion/revai/contacts">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
              Explore Contacts
              <ArrowRight size={20} className="ml-2" />
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <Brain className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">AI Assistant</h3>
            <p className="text-slate-300">
              Natural language prompts for scheduling, email drafting, and action item management.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Conversation Tracking</h3>
            <p className="text-slate-300">
              Automatically capture and organize meeting transcripts, emails, and chat conversations.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
              <Users className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Smart Contact Management</h3>
            <p className="text-slate-300">
              Engagement scoring, interaction history, and automated contact insights.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Meeting Intelligence</h3>
            <p className="text-slate-300">
              Extract action items from meetings and automatically create follow-up tasks.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Analytics & Insights</h3>
            <p className="text-slate-300">
              Track engagement patterns and get recommendations for next best actions.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mb-4">
              <ArrowRight className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Workflow Automation</h3>
            <p className="text-slate-300">
              Automate follow-ups, reminders, and routine tasks to save valuable time.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Customer Relationships?
          </h2>
          <p className="text-slate-300 mb-8 text-lg">
            Experience the power of AI-driven contact management and never miss an opportunity again.
          </p>
          <Link to="/companion/revai/contacts">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
              Get Started Now
              <ArrowRight size={20} className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;

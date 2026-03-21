import React from "react";
import Features from "../components/Features";
import CaseStudies from "../components/CaseStudies";
import OverviewSkeleton from "../components/OverviewSkeleton";
import { Casestudy, Feature } from "../types/ApplicationItem";

interface DisconnectedAppSectionProps {
  loading: boolean;
  features: Feature[];
  caseStudies: Casestudy[];
}

const DisconnectedAppSection: React.FC<DisconnectedAppSectionProps> = ({
  loading,
  features,
  caseStudies,
}) => {
  if (loading) {
    return <OverviewSkeleton />;
  }
  return (
    <div className="bg-white rounded-lg shadow-sm w-full mx-auto">
      {/* Description */}
      <div className="mb-6">
        <p className="text-gray-700 text-base leading-relaxed">
          Thunai AI’s integration with Amazon Connect delivers real-time contact
          center metrics, empowering teams with live dashboards and insights.
        </p>
      </div>

      {/* Features Section */}
      <Features features={features} />

      {/* Case Studies Section */}
      <CaseStudies caseStudies={caseStudies} />
    </div>
  );
};

export default DisconnectedAppSection;

import React from "react";
import { Feature } from "../types/ApplicationItem";

interface FeaturesProps {
  features: Feature[];
}

const Features: React.FC<FeaturesProps> = ({ features }) => {
  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Key Features</h3>
      <div className="space-y-3">
        {features?.map((feature) => (
          <div className="bg-gray-50 p-4 rounded-lg" key={feature.title}>
            <div className="flex items-start">
              <span className="material-icons text-blue-500 mr-3 w-6 h-6 flex-shrink-0">
                check_circle
              </span>
              <div>
                <h4 className="text-lg font-medium text-gray-800">
                  {feature.title}
                </h4>
                <p className="text-gray-600 text-sm mt-1">
                  {feature.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;

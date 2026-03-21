import { Casestudy } from "../types/ApplicationItem";

interface CaseStudyProps {
  caseStudies: Casestudy[];
}

const CaseStudies: React.FC<CaseStudyProps> = ({ caseStudies }) => {
  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Case Studies</h3>
      <div className="space-y-3">
        {caseStudies?.map((study) => (
          <div className="bg-gray-50 p-4 rounded-lg" key={study.team}>
            <div className="flex items-start">
              <span className="material-icons text-green-500 mr-3 w-6 h-6 flex-shrink-0">
                assignment
              </span>
              <div>
                <h4 className="text-lg font-medium text-gray-800">
                  {study?.team}
                </h4>
                <p className="text-gray-600 text-sm mt-1">
                  {study?.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaseStudies;

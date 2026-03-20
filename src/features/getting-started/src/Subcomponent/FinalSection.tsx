// import React from "react";
import {
  Check,
  ArrowRight,
  Folder,
  MessageSquare,
  Link,
  Users,
  Video,
} from "lucide-react";

const FinalSection = () => {
  return (
    <div className=" flex items-center justify-center sm:py-10">
      <div className="w-full max-w-3xl border border-gray-200 rounded-sm p-5 bg-white">
        <div className="flex justify-center mb-2 sm:mb-3">
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="text-green-600" size={28} />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold text-center text-gray-800">
          Setup Complete!
        </h1>

        <p className="text-center text-gray-600 mt-2 sm:mt-3 text-sm sm:text-base max-w-xl mx-auto">
          You've successfully set up Thunai. You're now ready to experience the
          full power of AI assistance.
        </p>

        <div className="mt-6 sm:mt-10 bg-blue-100/60 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <ArrowRight className="text-blue-600 flex-shrink-0" size={18} />
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">
              What's Next?
            </h2>
          </div>

          <div className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base">
            <div className="flex items-start sm:items-center gap-2 sm:gap-3">
              <Folder className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
              <p>Explore your Brain to organize and access your knowledge</p>
            </div>

            <div className="flex items-start sm:items-center gap-2 sm:gap-3">
              <MessageSquare className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
              <p>Chat with your agents to get assistance on specific tasks</p>
            </div>

            <div className="flex items-start sm:items-center gap-2 sm:gap-3">
              <Link className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
              <p>Connect more applications to enhance your workflow</p>
            </div>

            <div className="flex items-start sm:items-center gap-2 sm:gap-3">
              <Users className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
              <p>Invite team members to collaborate with Thunai</p>
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 p-4 sm:p-6 md:p-8 text-center">
          <div className="bg-gray-50 rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-center sm:justify-start items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white flex-shrink-0">
                <Video size={20} />
              </div>

              <div className="flex flex-col items-center sm:items-start gap-1">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                  Schedule a Demo
                </h3>

                <p className="text-gray-600 mt-0 sm:mt-2 text-sm sm:text-base capitalize text-center sm:text-left">
                  Get a personalized walkthrough of Thunai's advanced features
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                window.open(
                  "https://meetings-na2.hubspot.com/thunai/demo",
                  "_blank",
                )
              }
              className="mt-4 sm:mt-6 w-full sm:w-auto px-6 sm:px-12 md:px-20 py-3 rounded-lg text-sm sm:text-base text-white font-medium bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 transition cursor-pointer"
            >
              Book Demo
            </button>

            <div className="flex justify-center items-center mt-2">
                <button className="mt-2 w-full sm:w-auto px-6 sm:px-12 md:px-20 py-3 rounded-lg text-sm sm:text-base text-white font-medium bg-blue-500 hover:opacity-90 transition flex items-center cursor-pointer justify-center gap-1" onClick={() => window.open("https://app.thunai.ai/salesEnablement/meetingAssistants")}> Go to Dashboard <ArrowRight className="text-white" size={18} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalSection;

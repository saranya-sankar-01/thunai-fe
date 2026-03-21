import React from "react";
interface SetupGuideButtonProps {
  docsUrl: string;
}
const SetupGuideButton: React.FC<SetupGuideButtonProps> = ({ docsUrl }) => {
  const openDocs = () => {
    if (docsUrl) window.open(docsUrl, "_blank", "noopener, noreferrer");
  };
  return (
    <button
      onClick={openDocs}
      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-0 text-sm text-[#4056F4] hover:bg-blue-50 rounded transition-colors min-h-[32px]"
    >
      <span>View Setup guide</span>
      <img
        src="/svg/open_in_new.svg"
        alt="Setup Guide"
        className="w-4 h-4 sm:w-5 sm:h-5"
      />
    </button>
  );
};

export default SetupGuideButton;

import { FC } from "react";
import { useState, useEffect } from "react";

interface Step4AuthorizationProps {
  isAuthEnabled: boolean;
  setIsAuthEnabled: (enabled: boolean) => void;
  authType: string;
  setAuthType: (type: string) => void;
  instruction: string;
  setInstruction: (instruction: string) => void;
}

const Step4Authorization: FC<Step4AuthorizationProps> = ({
  isAuthEnabled,
  setIsAuthEnabled,
  authType,
  setAuthType,
  instruction,
  setInstruction,
}) => {
  const handleAuthTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedAuthType = event.target.value;
    setAuthType(selectedAuthType);
    setInstruction("");
 };

  useEffect(() => {
  console.log("Step4Authorization props: ", {
    isAuthEnabled,
    authType,
    instruction,
  });
}, [isAuthEnabled, authType, instruction]);


  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold text-gray-800">
          Enable Authorization
        </span>
        {/* --- CORRECTED TOGGLE SWITCH --- */}
        <label htmlFor="auth-toggle" className="relative inline-flex items-center cursor-pointer ml-3">
          <input
            type="checkbox"
            id="auth-toggle"
            checked={isAuthEnabled}
            onChange={() => setIsAuthEnabled(!isAuthEnabled)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:bg-blue-600 transition-colors"></div>
          <div className="absolute top-0.5 left-[2px] w-5 h-5 bg-white border-gray-300 border rounded-full peer-checked:translate-x-full peer-checked:border-white transition-transform"></div>
        </label>
      </div>

      {isAuthEnabled && (
        <div className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="auth-type-select"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Authentication Type
            </label>
            <select
              id="auth-type-select"
              value={authType}
              onChange={handleAuthTypeChange}
              className="text-black w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            >
              <option value="" className="text-black">Select Authentication Method</option>
              <option value="magic_auth" className="text-black">Magic Auth</option>
              <option value="otp_auth" className="text-black">OTP Auth</option>
            </select>
          </div>

          {authType != "" && (
            <div>
              <label
                htmlFor="instruction-input"
                className="block mb-2 text-sm font-medium text-gray-700 "
              >
                Instruction
              </label>
              <input
                id="instruction-input"
                type="text"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder={`Enter instruction for ${
                  authType === "magic_auth" ? "Magic Auth" : "OTP Auth"
                }`}
                className="text-black w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Step4Authorization;
// WebCrawlConfig.tsx
import React from 'react';
import { Label } from "@/components/ui/label"; 

interface WebCrawlProps {
  enableCrawl: boolean;
  setEnableCrawl: (enabled: boolean) => void;
  selectedCrawlLevel: number;
  setSelectedCrawlLevel: (level: number) => void;
}

export const WebCrawl: React.FC<WebCrawlProps> = ({
  enableCrawl,
  setEnableCrawl,
  selectedCrawlLevel,
  setSelectedCrawlLevel,
}) => {
  const getProgressWidth = () => {
    if (selectedCrawlLevel === 1) return '0%';
    if (selectedCrawlLevel === 2) return '42.5%';
    return '85%';
  };

  return (
    <div className="mt-2">
      <label className="inline-flex mt-2 my-4 items-center cursor-pointer">
        <p className="mr-2 text-gray-800">Enable Crawl</p>
        <div
          onClick={() => setEnableCrawl(!enableCrawl)}
          className={`w-10 h-5 rounded-full relative transition-all ${
            enableCrawl ? 'bg-blue-500' : 'bg-gray-200'
          }`}
        >
          <div
            className={`w-4 h-4 bg-white border border-gray-300 rounded-full absolute top-0.5 left-0.5 transition-all ${
              enableCrawl ? 'translate-x-5' : ''
            }`}
          ></div>
        </div>
      </label>

      {enableCrawl && (
        <div className="mb-6">
          <Label className="text-sm text-gray-700 font-semibold">Select Crawl Level</Label>
          <div className="mt-4 flex items-center justify-between relative w-full max-w-md mx-auto">
            <div
              className="absolute top-1/2 w-[85%] left-[7.5%] h-1 bg-gray-300 -z-10 -translate-y-1/2 rounded-full"
            ></div>
            
            <div
              className="absolute top-1/2 left-[7.5%] -z-10 w-[85%] h-4 transition-all duration-700 ease-in-out rounded-full"
              style={{
                width: getProgressWidth(),
                left: '7.5%',
                background: 'linear-gradient(to right, #00d2ff, #3a7bd5)',
                transform: 'translateY(-50%)'
              }}
            ></div>
            
            {[1, 2, 3].map((level, i) => (
              <div
                key={level}
                className="relative flex flex-col items-center w-1/3"
              >
                {i !== 0 && (
                  <div
                    className="absolute -left-1/2 h-1 transition-all duration-500"
                    style={{
                      width: '100%',
                      marginTop: '10px',
                      height: '6px',
                      background:
                        selectedCrawlLevel >= level
                          ? 'linear-gradient(to right, #00d2ff, #3a7bd5)'
                          : '#d1d5db',
                    }}
                  ></div>
                )}

                <div
                  onClick={() => setSelectedCrawlLevel(level)}
                  className="w-7 h-7 flex items-center justify-center rounded-full border-2 transition cursor-pointer relative z-10"
                  style={{
                    background: selectedCrawlLevel >= level ? '#3a7bd5' : '#d1d5db',
                    color: selectedCrawlLevel >= level ? 'white' : 'black',
                    borderColor: selectedCrawlLevel >= level ? '#3a7bd5' : '#d1d5db',
                  }}
                >
                  {level}
                </div>

                <span className="text-sm mt-2">Depth {level}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

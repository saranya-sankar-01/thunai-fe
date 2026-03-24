import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { Search, Send, Calendar, Edit2, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import thunaiLogoFull from "@/assets/thunai-logo-full.png";
import { SchedulerModal } from "./SchedularModel";
import type {
  NewResearchFormProps,
  ScheduleConfig,
  ScheduleType,
} from "../../components/Research/ResearchTypes";

export const NewResearchForm = ({
  onSubmit,
  initialSchedule,
}: NewResearchFormProps) => {
  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  };

  const [query, setQuery] = useState("");
  const [enableScheduler, setEnableScheduler] = useState(!!initialSchedule);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>(
    initialSchedule || { type: "only_once", time: getCurrentTime() },
  );
  const [schedulerInitialValues, setSchedulerInitialValues] =
    useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isQueryExpanded, setIsQueryExpanded] = useState(false);

  useEffect(() => {
    if (showSchedule && scheduleConfig) {
      setSchedulerInitialValues({
        frequency: scheduleConfig.type.toUpperCase(),
        time: scheduleConfig.time,
        days: scheduleConfig.days,
        dates: scheduleConfig.dates,
      });
    }
  }, [showSchedule, scheduleConfig]);

  const handleSchedulerConfirm = (config: {
    frequency: string;
    selectedDates?: Date[];
    time: string;
  }) => {
    const type = config.frequency.toLowerCase() as ScheduleType;
    const newConfig: ScheduleConfig = {
      type,
      time: config.time,
    };

    if (config.selectedDates?.length) {
      if (config.frequency === "WEEKLY") {
        const dayNames = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        newConfig.days = [
          ...new Set(config.selectedDates.map((d) => dayNames[d.getDay()])),
        ];
      }

      if (config.frequency === "MONTHLY") {
        newConfig.dates = [
          ...new Set(config.selectedDates.map((d) => d.getDate())),
        ].sort();
      }
    }

    setScheduleConfig(newConfig);
    setShowSchedule(false);
  };

  const handleRemoveSchedule = () => {
    setEnableScheduler(false);
    setScheduleConfig({
      type: "only_once",
      time: getCurrentTime(),
    });
  };

  const handleSubmit = async () => {
    if (!query.trim()) return;

    setIsLoading(true);

    try {
      await onSubmit(query, scheduleConfig);
      setIsSuccess(true);
    } catch (error) {
      console.error("Error submitting research:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      {!isSuccess && (
        <div className="border-b p-5">
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Input */}
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What would you like to research?"
                className="pl-12 pr-4 py-3 min-h-[48px] max-h-[180px] text-base rounded-xl resize-none overflow-y-auto [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400"
                rows={1}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height =
                    Math.min(target.scrollHeight, 200) + "px";
                }}
              />
            </div>

            {/* Toggle */}
            <div className="flex items-center justify-between bg-gray-50 border rounded-xl px-4 py-3">
              <div>
                <p className="text-sm font-semibold">Schedule research</p>
                <p className="text-xs text-gray-500">Run at a specific time</p>
              </div>

              <button
                onClick={() => {
                  const next = !enableScheduler;
                  setEnableScheduler(next);

                  if (!next) {
                    setScheduleConfig({
                      type: "only_once",
                      time: getCurrentTime(),
                    });
                  } else {
                    setScheduleConfig({
                      type: "daily",
                      time: getCurrentTime(),
                    });
                    setShowSchedule(true);
                  }
                }}
                className={`w-12 h-6 rounded-full transition ${
                  enableScheduler ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <div
                  className={`h-5 w-5 bg-white rounded-full shadow transform transition ${
                    enableScheduler ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Schedule preview */}
            {enableScheduler && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                <div className="flex gap-3 items-center">
                  <Calendar className="text-blue-600 h-5 w-5  flex-shrink-0" />

                  <div className="flex-1">
                    <p className="text-sm font-semibold">
                      {scheduleConfig.type.replace("_", " ").toUpperCase()} at{" "}
                      {scheduleConfig.time}
                    </p>

                    {scheduleConfig.days && scheduleConfig.days.length > 0 && (
                      <p className="text-xs text-gray-600 ">
                        {scheduleConfig.days.join(", ")}
                      </p>
                    )}

                    {scheduleConfig.dates &&
                      scheduleConfig.dates.length > 0 && (
                        <p className="text-xs text-gray-600 ">
                          Date: {scheduleConfig.dates.join(", ")}
                        </p>
                      )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowSchedule(true)}
                      className="p-1.5 rounded-md hover:bg-blue-100 text-blue-600 transition"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleRemoveSchedule}
                      className="p-1.5 rounded-md hover:bg-red-100 text-red-600 transition"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-center pt-2">
              <Button
                onClick={handleSubmit}
                disabled={!query.trim() || isLoading}
                className="bg-blue-700 hover:bg-blue-800 rounded-full px-10 h-11 shadow-md"
              >
                <Send className="h-4 w-4 mr-2" />
                {isLoading ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex items-center justify-center">
        {isSuccess ? (
          /* Success State */
          <div className="h-[85vh] flex items-center justify-center">
            <div className="text-center max-w-2xl px-8">
              <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-3">
                Research Added Successfully!
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Your research has been scheduled and will run according to your
                configuration.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-600 font-medium mb-2">
                  Research Details
                </p>
                <div className="mb-1">
                  <div
                    className={cn(
                      "text-foreground font-medium overflow-y-auto",
                      !isQueryExpanded && "max-h-[4.5rem] line-clamp-3",
                      isQueryExpanded && "max-h-[300px]",
                      "[&::-webkit-scrollbar]:w-1.5",
                      "[&::-webkit-scrollbar-track]:bg-transparent",
                      "[&::-webkit-scrollbar-thumb]:bg-blue-300",
                      "[&::-webkit-scrollbar-thumb]:rounded-full",
                      "[&::-webkit-scrollbar-thumb]:hover:bg-blue-400",
                    )}
                  >
                    {query}
                  </div>
                  {query && query.length > 100 && (
                    <button
                      onClick={() => setIsQueryExpanded(!isQueryExpanded)}
                      className="text-xs text-blue-600 hover:text-blue-800 mt-1 font-medium flex items-center gap-1"
                    >
                      {isQueryExpanded ? "Show less" : "Show more"}
                      <ChevronDown
                        className={cn(
                          "h-3 w-3 transition-transform",
                          isQueryExpanded && "rotate-180",
                        )}
                      />
                    </button>
                  )}
                </div>
                {scheduleConfig && (
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      <span className="font-medium">Schedule:</span>{" "}
                      {scheduleConfig.type.charAt(0).toUpperCase() +
                        scheduleConfig.type.slice(1)}{" "}
                      at {scheduleConfig.time}
                    </p>
                    {scheduleConfig.days && scheduleConfig.days.length > 0 && (
                      <p>
                        <span className="font-medium">Day:</span>{" "}
                        {scheduleConfig.days.join(", ")}
                      </p>
                    )}
                    {scheduleConfig.dates &&
                      scheduleConfig.dates.length > 0 && (
                        <p>
                          <span className="font-medium">Date:</span>{" "}
                          {scheduleConfig.dates.join(", ")}
                        </p>
                      )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center max-w-lg px-6">
              <img
                src={thunaiLogoFull}
                alt="Thunai"
                className="h-20 mx-auto mb-6"
              />
              <h2 className="text-2xl font-semibold mb-2">
                Start Your Research
              </h2>
              <p className="text-gray-500">
                Enter a topic above to get detailed insights
              </p>
            </div>
          </div>
        )}
      </div>

      <SchedulerModal
        open={showSchedule}
        onClose={() => {
          setShowSchedule(false);
          setEnableScheduler(false);
        }}
        onConfirm={handleSchedulerConfirm}
        initialValues={
          schedulerInitialValues || {
            frequency: "daily",
            time: getCurrentTime(),
          }
        }
      />
    </div>
  );
};

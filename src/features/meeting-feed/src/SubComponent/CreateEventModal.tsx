import { useState } from "react";

import TeamMeet from "../assets/image/teams.png";
import GoogleMeet from "../assets/image/meet.png";
import ZoomMeet from "../assets/image/zoom-icone-svg-150px.png";
import {getLocalStorageItem, requestApi } from "@/services/authService";

// interface EventFormErrors {
//   summary?: string;
//   participants?: string;
// }


import { useAppDispatch } from "../redux/hooks";

import { fetchEventMeet } from "../features/EventMeetSlice";

const url = new URL(window.location.href);
const userInfo = getLocalStorageItem("user_info") || {};
    const tenant_id = userInfo?.default_tenant_id || url.searchParams.get("tenant_id") || localStorage.getItem("tenant_id");
    const Email= userInfo?.profile?.emailid;

interface CreateEventModalProps {
  setEventData: React.Dispatch<React.SetStateAction<boolean>>;
  // handleReload: () => void;
}


const CreateEventModal : React.FC<CreateEventModalProps> = ({ setEventData }) => {
  const [platform, setPlatform] = useState("gmeet");
  const [isLive, setIsLive] = useState(false);

  // const [errors, setErrors] = useState<EventFormErrors | any>({});

  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState({
    summary: "",
    start: "",
    end: "",
    meeting_link: "",
    meeting_id: "",
    passcode: "",
    participants: ""
    // email: "jebastin@entrans.io",
  });

  const handleChange = (e:any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

//  const validate = () => {
//   let temp: EventFormErrors = {};

//   if (!formData.summary.trim()) temp.summary = "EventName is required";

//   if (!formData.participants.trim()) {
//     temp.participants = "Email is required";
//   } else if (!/\S+@\S+\.\S+/.test(formData.participants)) {
//     temp.participants = "Enter a valid email";
//   }

//   setErrors(temp);

//   return Object.keys(temp).length === 0; 
// };


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // if (!validate()) {
  //   // console.log("Form invalid → API not called");
  //   return; 
  // }

  const now = new Date();
  const liveDuration = 30 * 60 * 1000;
  const oneHourLater = new Date(now.getTime() + liveDuration);

  function formatDate(date: Date) {
    const pad = (num: number) => String(num).padStart(2, "0");
    return (
      date.getUTCFullYear() +
      "-" +
      pad(date.getUTCMonth() + 1) +
      "-" +
      pad(date.getUTCDate()) +
      "T" +
      pad(date.getUTCHours()) +
      ":" +
      pad(date.getUTCMinutes()) +
      ":" +
      pad(date.getUTCSeconds()) +
      "+00:00"
    );
  }

  const payload = {
    summary: formData.summary,
    start: isLive ? formatDate(now) : formatDate(new Date(formData.start)),
    end: isLive ? formatDate(oneHourLater) : formatDate(new Date(formData.end)),
    meeting_link: formData.meeting_link,
    meeting_id: formData.meeting_id || null,
    passcode: platform === "teams" ? formData.passcode || null : null,
    platform: platform,
    participants:
      formData.participants.trim() !== ""
        ? [{ email: formData.participants }]
        : [{ email: "" }],
    email: Email,
  };

  try {
   const res = await requestApi("POST", `${tenant_id}/create/events`, payload, "CalendarService");
    dispatch(fetchEventMeet());
    setEventData(false);

    CallSheduleData(res);
    // handleReload();
  } catch (error) {
    console.error("Error creating event:", error);
  }
};

const CallSheduleData = async (eventData: any) => {
  const payload = {
    bot_events: eventData.bot_events || [],
    email: eventData.email,
    start: eventData.start,
    end: eventData.end,
    event_id: eventData.event_id,
    event_type: eventData.event_type,
    full_recurring_eventid: eventData.full_recurring_eventid,
    recurring_eventid: eventData.recurring_eventid,
    meeting_id: eventData.meeting_id,
    meeting_link: eventData.meeting_link,
    meeting_status: eventData.meeting_status,
    participants: eventData.participants,
    passcode: eventData.passcode,
    platform: eventData.platform,
    response_status: eventData.response_status,
    scheduled: eventData.scheduled,
    scheduled_details: eventData.scheduled_details,
    scheduled_id: eventData.scheduled_id,
    summary: eventData.summary,
    synced: eventData.synced,
    type: eventData.type
  };

  try {
    await requestApi(
      "POST",
      `${tenant_id}/call/agent/schedules/`,
      payload,
      "authService"
    );
  } catch (error) {
    console.error("Call schedule failed:", error);
  }
};



  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-3">
      <div className="bg-white w-full max-w-lg sm:max-w-2xl rounded-xl shadow-lg p-6 sm:p-8 relative overflow-y-auto max-h-[95vh]">
        <h2 className="text-xl sm:text-2xl font-semibold text-center sm:mb-4">
          Create Event
        </h2>

   
        <div className="flex justify-center flex-wrap gap-2 sm:gap-8 mb-5">
          {[
            { name: "gmeet", icon: GoogleMeet },
            { name: "teams", icon: TeamMeet },
            { name: "zoom", icon: ZoomMeet },
          ].map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => setPlatform(item.name)}
              className={`flex items-center outline-none justify-center gap-2 px-4 py-1 rounded-md font-medium border border-gray-100 transition w-[120px] sm:w-[140px] text-sm sm:text-base ${
                platform === item.name
                  ? "text-blue-600"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <img
                src={item.icon}
                alt={item.name}
                className="w-5 h-5 sm:w-6 sm:h-6 text-sm font-medium"
              />
              {item.name === "gmeet"
                ? "Google"
                : item.name === "teams"
                ? "Teams"
                : "Zoom"}
            </button>
          ))}
        </div>


        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600">Event Name</label>
            <input
              type="text"
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              className="w-full outline-none border border-gray-300 rounded-lg p-1 sm:p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
              placeholder="Enter Event Name"
              required
            />
          </div>
          {/* {errors.summary && <p className="text-red-500 text-sm">{errors.name}</p>} */}

                  {/* Live Meeting Checkbox */}
        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            id="isLive"
            checked={isLive}
            onChange={(e) => setIsLive(e.target.checked)}
            className="w-4 h-4 cursor-pointer"
          />
          <label htmlFor="isLive" className="block text-sm font-medium text-gray-600 cursor-pointer">
            Live Meeting
          </label>
        </div>

          {/* Hide Start/End Time if Live */}
          {!isLive && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-600">
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="start"
                  value={formData.start}
                  onChange={handleChange}
                  className="w-full outline-none border border-gray-300 rounded-lg p-1 sm:p-2 focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                  required
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-600">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="end"
                  value={formData.end}
                  onChange={handleChange}
                  className="w-full outline-none border border-gray-300 rounded-lg p-1 sm:p-2 focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                  required
                />
              </div>
            </div>
          )}

          {/* Meeting Link */}
          <div>
            <label className="block text-sm font-medium text-gray-600">Meeting Link</label>
            <input
              type="text"
              name="meeting_link"
              value={formData.meeting_link}
              onChange={handleChange}
              className="w-full outline-none border border-gray-300 rounded-lg p-1 sm:p-2 focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
              placeholder="Enter meeting link"
              required
            />
          </div>


          {platform === "teams" && (
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Meeting Passcode
              </label>
              <input
                type="text"
                name="passcode"
                value={formData.passcode}
                onChange={handleChange}
                className="outline-none w-full border border-gray-300 rounded-lg p-1 sm:p-2 focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                placeholder="Enter Teams meeting passcode"
              />
            </div>
          )}

          {/* Participants */}
          <div>
            <label className="block text-sm font-medium text-gray-600">Participants</label>
            <input
              type="email"
              name="participants"
              value={formData.participants}
              onChange={handleChange}
              className="w-full outline-none border border-gray-300 rounded-lg p-1 sm:p-2 focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
              placeholder="Enter participant email"
            />
            {/* {errors.participants && <p className="text-red-500 text-sm">{errors.participants}</p>} */}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-primary text-white rounded-md bg-blue-600"
            >
              Submit
            </button>

            <button
              type="button"
              className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition text-sm sm:text-base"
              onClick={() => setEventData((prev: boolean) => !prev)}

            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;

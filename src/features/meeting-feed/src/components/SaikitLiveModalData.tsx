import { getLocalStorageItem } from "@/services/authService";
import { useEffect, useRef, useState } from "react";

interface Message {
  participant_name: string;
  participant_id: string;
  text: string;
  timestamp: string;
}

interface Props {
  saikitId: string | number | null;
  callTitle?: string;
  setShowLiveScriptModal: (value: boolean) => void;
}
const SOCKET_ENDPOINT = import.meta.env.VITE_SOCKET_ENDPOINT || (window as any)['env']['SOCKET_ENDPOINT']; 

const SaikitLiveModalData = ({
  saikitId,
  callTitle = "Live Call",
  setShowLiveScriptModal,
}: Props) => {
  const socketRef = useRef<WebSocket | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [loadTranscript, setLoadTranscript] = useState(true);
  const [isMessageLoading, setIsMessageLoading] = useState(false);

  const colorMap = useRef<Map<string, string>>(new Map());
  const userInfo = getLocalStorageItem("user_info") || {};
  //  WebSocket Connection
  useEffect(() => {
    if (!saikitId) return;
    setLoadTranscript(true);

    const socket = new WebSocket(
      `wss://${SOCKET_ENDPOINT}/socket-service/meeting-agent-live/${saikitId}/?token=${userInfo?.access_token}`
    );

    socketRef.current = socket;

    socket.onmessage = (event) => {
      const response = JSON.parse(event.data);

      setIsMessageLoading(true);
      setMessages((prev) => [...prev, ...(response?.payload?.message || [])]);
      setLoadTranscript(false);
    };

    socket.onerror = () => {
      setLoadTranscript(false);
      setIsMessageLoading(false);
    };

    socket.onclose = () => {
      setLoadTranscript(false);
      setIsMessageLoading(false);
    };

    return () => socket.close();
  }, [saikitId]);

  //  Random color per participant
  const getRandomColor = (id: string) => {
    if (!colorMap.current.has(id)) {
      const colors = [
        "#E8CCFF",
        "#D1F09F",
        "#B9D1FF",
        "#FFC300",
        "#FF4500",
      ];
      colorMap.current.set(
        id,
        colors[Math.floor(Math.random() * colors.length)]
      );
    }
    return colorMap.current.get(id)!;
  };
  const processMessages = () => {
    const grouped: any[] = [];
    let last = "";

    messages.forEach((msg) => {
      if (msg.participant_name !== last) {
        grouped.push({ ...msg });
        last = msg.participant_name;
      } else {
        grouped[grouped.length - 1].text += " " + msg.text;
        grouped[grouped.length - 1].timestamp = msg.timestamp;
      }
    });

    return grouped;
  };

  const getInitials = (name: string) =>
    name ? name.charAt(0).toUpperCase() : "?";

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div className="fixed top-0 right-0 h-full w-full md:w-1/2 lg:w-1/3 bg-white p-6 shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center">
          <p className="text-xl font-medium">{callTitle}</p>
          <button
            onClick={() => setShowLiveScriptModal(false)}
            className="text-xl font-bold"
          >
             ✕
          </button>
        </div>

        <p className="mt-6 font-medium">Live transcripts</p>

        {/* Messages */}
        <div className="mt-4 overflow-y-auto flex-1">
          {processMessages().map((msg, i) => (
            <div key={i} className="flex gap-4 mb-5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white"
                style={{ background: getRandomColor(msg.participant_id) }}
              >
                {getInitials(msg.participant_name)}
              </div>

              <div>
                <div className="flex gap-2">
                  <span className="font-semibold text-sm">
                    {msg.participant_name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <p className="text-sm mt-1">{msg.text}</p>
              </div>
            </div>
          ))}

          {/* Typing Loader */}
          {isMessageLoading && (
            <div className="flex gap-1 ml-12 mt-2">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
            </div>
          )}

          {/* Spinner */}
          {loadTranscript && (
            <div className="flex flex-col items-center justify-center h-1/2">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-3 text-sm text-gray-600">
                Waiting for participants...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaikitLiveModalData;

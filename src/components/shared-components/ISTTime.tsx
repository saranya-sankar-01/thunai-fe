import React from "react";

interface ISTTimeProps {
  utcString: string; // e.g., "2025-10-06T13:22:47.817000"
  showDate?: boolean; // optional prop — to control whether to show date or just time
}

const ISTTime: React.FC<ISTTimeProps> = ({ utcString, showDate = true }) => {
  if (!utcString) return <span>-</span>;

  const utcDate = new Date(utcString);

  // Convert UTC → IST
  const istDate = new Date(utcDate.getTime() + 5.5 * 60 * 60 * 1000);

  // Format options
  const options: Intl.DateTimeFormatOptions = showDate
    ? {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      }
    : {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      };

  const formattedTime = istDate.toLocaleString("en-IN", options);

  return <span>{formattedTime}</span>;
};

export default ISTTime;

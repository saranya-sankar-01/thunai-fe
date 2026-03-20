import React from "react";

interface ISTTimeProps {
  utcString: string;
  showDate?: boolean;
}

const ISTTimeWithMin: React.FC<ISTTimeProps> = ({ utcString, showDate = true }) => {
  if (!utcString) return <span>-</span>;

  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    if (diffSec < 60) return "just now";
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    if (diffWeek < 4) return `${diffWeek} week${diffWeek > 1 ? 's' : ''} ago`;
    if (diffMonth < 12) return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`;
    return `${diffYear} year${diffYear > 1 ? 's' : ''} ago`;
  };

  const utcDate = new Date(utcString);
  const istDate = new Date(utcDate.getTime() + 5.5 * 60 * 60 * 1000);

  const relativeTime = getRelativeTime(istDate);

  if (!showDate) {
    return <span>{relativeTime}</span>;
  }

  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  };

  const formattedTime = istDate.toLocaleString("en-IN", options);

  return (
    <span title={formattedTime}>
      {relativeTime}
    </span>
  );
};

export default ISTTimeWithMin;

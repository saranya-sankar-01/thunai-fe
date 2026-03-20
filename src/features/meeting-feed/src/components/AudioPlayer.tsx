import React, { useEffect, useRef, useState } from "react";

import ForwardPlay from "../assets/svg/ForwardPlay.svg";
import BackwardPlay from "../assets/svg/BackwardPlay.svg";
import PlayArrow from "../assets/svg/PlayArrow.svg";
import PauseArrow from "../assets/svg/PauseArrow.svg";
import MuteIcon from "../assets/svg/Mute.svg";
import VolumeIcon from "../assets/svg/Muteup.svg";
import MoreDot from "../assets/svg/More_vert.svg";

interface AudioPlayerProps {
  filePath: string;
  token: string;
  startTime?: number;
  endTime?: number;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  filePath,
  token,
  startTime,
  endTime,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const pendingStartRef = useRef<number | null>(null);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [showMenu, setShowMenu] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || (window as any)['env']['API_ENDPOINT'];
  /* ------------------------------- AUDIO URL ------------------------------- */
  useEffect(() => {
    if (!filePath) return;

    const url = `${API_ENDPOINT}/document-service/ai/api/v1/cloud/storage/file/?path=${encodeURIComponent(
      filePath
    )}&option=read&authorization=Bearer%20${token}`;

    setAudioUrl(url);
  }, [filePath, token]);

  /* ------------------------------ START TIME ------------------------------- */
  useEffect(() => {
    if (typeof startTime === "number" && isFinite(startTime)) {
      pendingStartRef.current = startTime;
    }
  }, [startTime]);

  /* ------------------------------ FORMAT TIME ------------------------------ */
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" + s : s}`;
  };

  /* -------------------------------- PLAY ---------------------------------- */
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      audioRef.current.play().catch(() => {});
    }
  };

  /* -------------------------------- SKIP ---------------------------------- */
  const skipForward = () => {
    if (!audioRef.current) return;

    let newTime = audioRef.current.currentTime + 15;
    if (typeof endTime === "number") newTime = Math.min(endTime, newTime);

    audioRef.current.currentTime = newTime;
  };

  const skipBackward = () => {
    if (!audioRef.current) return;

    let newTime = audioRef.current.currentTime - 15;
    if (typeof startTime === "number") newTime = Math.max(startTime, newTime);

    audioRef.current.currentTime = newTime;
  };

  /* -------------------------------- SEEK ---------------------------------- */
  const handleSeek = (e: React.FormEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;

    let newTime = Number(e.currentTarget.value);

    if (typeof startTime === "number") newTime = Math.max(startTime, newTime);
    if (typeof endTime === "number") newTime = Math.min(endTime, newTime);

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  /* -------------------------------- MUTE ---------------------------------- */
  const toggleMute = () => {
    if (!audioRef.current) return;

    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  /* --------------------------- CLICK OUTSIDE MENU -------------------------- */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  /* ------------------------------ DOWNLOAD -------------------------------- */
  const downloadAudio = async () => {
    if (!audioUrl) return;

    try {
      setIsDownloading(true);
      const res = await fetch(audioUrl);
      const blob = await res.blob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "audio.mp3";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setShowMenu(false);
    } finally {
      setIsDownloading(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  return (
    <div className="w-full bg-blue-100 shadow-xl rounded-tr-2xl rounded-tl-2xl px-4 py-3 flex flex-wrap items-center gap-3">

      <button onClick={skipBackward}>
        <img src={BackwardPlay} className="w-6" />
      </button>

      <button
        onClick={togglePlay}
        className="bg-blue-700 text-white w-7 h-7 rounded-full flex items-center justify-center"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <img src={PauseArrow} className="w-5" />
        ) : (
          <img src={PlayArrow} className="size-6 pl-0.5" />
        )}
      </button>

      <button onClick={skipForward}>
        <img src={ForwardPlay} className="w-6" />
      </button>

      <div className="flex-1 flex items-center gap-2 min-w-[180px]">
        <span className="text-xs w-10 text-center">
          {formatTime(currentTime)}
        </span>

        <input
          type="range"
          min={startTime ?? 0}
          max={endTime ?? duration}
          value={currentTime}
          onInput={handleSeek}
          className="flex-1 accent-blue-600 h-2 rounded-lg cursor-pointer"
        />

        <span className="text-xs w-10 text-center">
          {formatTime(endTime ?? duration)}
        </span>
      </div>

      <button onClick={toggleMute}>
        <img src={isMuted ? MuteIcon : VolumeIcon} className="w-5 ml-1" />
      </button>

      <div className="relative">
        <button onClick={() => setShowMenu(v => !v)}>
          <img src={MoreDot} className="w-5" />
        </button>

        {showMenu && (
          <div
            ref={menuRef}
            className="absolute right-0 bottom-8 bg-white border border-gray-500 shadow-lg rounded-md text-sm min-w-[120px]"
          >
            <button
              disabled={isDownloading}
              onClick={downloadAudio}
              className="px-4 py-2 w-full text-left flex items-center gap-2 hover:bg-gray-100 hover:rounded-md"
            >
              {isDownloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  Downloading...
                </>
              ) : (
                "Download"
              )}
            </button>
          </div>
        )}
      </div>

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}

          onLoadStart={() => setIsLoading(true)}
          onWaiting={() => setIsLoading(true)}
          onPlaying={() => {
            setIsLoading(false);
            setIsPlaying(true);
          }}
          onCanPlay={() => setIsLoading(false)}

          onLoadedMetadata={() => {
            const audio = audioRef.current;
            if (!audio) return;

            setDuration(audio.duration);

            if (pendingStartRef.current !== null) {
              audio.currentTime = pendingStartRef.current;
              audio.play();
              setIsPlaying(true);
              pendingStartRef.current = null;
            }
          }}

          onTimeUpdate={() => {
            const audio = audioRef.current;
            if (!audio) return;

            if (typeof endTime === "number" && audio.currentTime >= endTime) {
              audio.pause();
              audio.currentTime = endTime;
              setIsPlaying(false);
              setCurrentTime(endTime);
              return;
            }

            setCurrentTime(audio.currentTime);
          }}

          onEnded={() => setIsPlaying(false)}
        />
      )}
    </div>
  );
};

export default AudioPlayer;

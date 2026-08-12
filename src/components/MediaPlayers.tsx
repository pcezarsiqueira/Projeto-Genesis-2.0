import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, FastForward, Film, Music, AlertCircle } from "lucide-react";

// Helper to convert standard YouTube links (watch, share, shorts) to embed format
export function getYouTubeEmbedUrl(url: string | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Already an embed URL
  if (trimmed.includes("youtube.com/embed/")) {
    return trimmed;
  }

  // Regex match for various YouTube URL forms
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = trimmed.match(regExp);

  if (match && match[2] && match[2].length === 11) {
    return `https://www.youtube-nocookie.com/embed/${match[2]}?rel=0&modestbranding=1`;
  }

  return null;
}

interface YouTubePlayerProps {
  videoUrl: string;
  title?: string;
}

export function YouTubeVideoPlayer({ videoUrl, title = "Vídeo do Desafio" }: YouTubePlayerProps) {
  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  if (!embedUrl) {
    return (
      <div className="bg-[#0B1220] border border-amber-600/40 p-4 rounded-xl flex items-center gap-3 text-amber-300 text-xs font-mono">
        <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
        <span>Link de vídeo inválido ou não reconhecido. Use o formato: https://youtube.com/watch?v=... ou https://youtu.be/...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-[#38BDF8] uppercase tracking-wider">
        <Film className="w-3.5 h-3.5 text-[#38BDF8]" />
        <span>Vídeo Explicativo Tático</span>
      </div>
      <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[#2563EB]/40 bg-[#0B1220] shadow-xl">
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  );
}

interface AudioPlayerProps {
  audioUrl: string;
  title?: string;
}

export function AudioPlayer({ audioUrl, title = "Áudio de Orientação" }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setHasError(false);
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.error("Error playing audio:", err);
        setHasError(true);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setHasError(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  const toggleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIndex = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const newSpeed = speeds[nextIndex];
    setPlaybackRate(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds <= 0) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
          <Music className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Áudio Tático de Orientação</span>
        </div>
        <span className="text-[9px] font-mono text-zinc-400">{title}</span>
      </div>

      <div className="bg-[#0B1220] border border-[#1E293B] p-3.5 rounded-xl space-y-3 shadow-lg">
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onError={() => setHasError(true)}
          preload="metadata"
        />

        {hasError ? (
          <div className="flex items-center gap-2 text-rose-400 text-xs font-mono p-2 bg-rose-950/40 rounded-lg border border-rose-800/40">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Não foi possível carregar o arquivo de áudio ({audioUrl}). Verifique o caminho.</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              {/* Play / Pause Button */}
              <button
                type="button"
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-95 text-white flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(37,99,235,0.4)] transition-all cursor-pointer"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              {/* Progress Slider & Time */}
              <div className="flex-1 space-y-1">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-[#1E293B] rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                />
                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 font-bold">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls: Speed & Mute */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={toggleSpeed}
                  className="px-2 py-1 rounded bg-[#111B2E] border border-[#1E293B] hover:border-[#2563EB] text-[10px] font-mono font-bold text-[#38BDF8] transition-colors cursor-pointer"
                  title="Alterar velocidade de reprodução"
                >
                  {playbackRate}x
                </button>
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-1.5 rounded bg-[#111B2E] border border-[#1E293B] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

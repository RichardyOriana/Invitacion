import React, { useState, useRef, useEffect } from "react";
import { Music, Music4, Volume2, VolumeX } from "lucide-react";

interface MusicPlayerProps {
  url: string;
}

export default function MusicPlayer({ url }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<number | null>(null);
  const [resolvedUrl, setResolvedUrl] = useState<string>("");
  const objectUrlRef = useRef<string | null>(null);
  const playTimeoutRef = useRef<number | null>(null);

  const clearFadeInterval = () => {
    if (fadeIntervalRef.current !== null) {
      window.clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  };

  const clearPlayTimeout = () => {
    if (playTimeoutRef.current !== null) {
      window.clearTimeout(playTimeoutRef.current);
      playTimeoutRef.current = null;
    }
  };

  const fadeIn = (audio: HTMLAudioElement, duration = 6000, targetVolume = 0.5) => {
    clearFadeInterval();
    audio.volume = 0;
    
    const steps = 40;
    const stepDuration = duration / steps;
    const increment = targetVolume / steps;
    let currentVolume = 0;
    
    fadeIntervalRef.current = window.setInterval(() => {
      if (!audio) {
        clearFadeInterval();
        return;
      }
      currentVolume = Math.min(currentVolume + increment, targetVolume);
      audio.volume = currentVolume;
      if (currentVolume >= targetVolume) {
        clearFadeInterval();
      }
    }, stepDuration);
  };

  // Convert raw base64 data URLs to browser Object URLs for maximum performance and compatibility with large files
  useEffect(() => {
    let active = true;

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (url && url.startsWith("data:")) {
      fetch(url)
        .then((res) => res.blob())
        .then((blob) => {
          if (!active) return;
          const objUrl = URL.createObjectURL(blob);
          objectUrlRef.current = objUrl;
          setResolvedUrl(objUrl);
        })
        .catch((e) => {
          console.error("Error creating object URL from data URL:", e);
          if (active) {
            setResolvedUrl(url); // Fallback to raw base64 if it fails
          }
        });
    } else {
      setResolvedUrl(url || "");
    }

    return () => {
      active = false;
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [url]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      clearFadeInterval();
      clearPlayTimeout();
    };
  }, []);

  useEffect(() => {
    // Whenever resolvedUrl changes, update source and reset play state
    if (audioRef.current && resolvedUrl) {
      clearFadeInterval();
      audioRef.current.src = resolvedUrl;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.volume = 0;
        audioRef.current.play().then(() => {
          fadeIn(audioRef.current!);
        }).catch((err) => {
          console.warn("Audio play blocked on URL change:", err);
          setIsPlaying(false);
        });
      }
    }
  }, [resolvedUrl]);

  // Attempt autoplay on first user interaction with the page
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasInteracted && audioRef.current) {
        setHasInteracted(true);
        // We don't force play, but we allow play to succeed
        document.removeEventListener("click", handleFirstInteraction);
        document.removeEventListener("touchstart", handleFirstInteraction);
      }
    };

    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("touchstart", handleFirstInteraction);

    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, [hasInteracted]);

  // Dispatch state change event to synchronize any inline players
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("wedding-music-state", { detail: { isPlaying } }));
  }, [isPlaying]);

  // Support triggering play/pause programmatically from inline players
  useEffect(() => {
    const handleToggle = () => {
      togglePlay();
    };
    window.addEventListener("toggle-wedding-music", handleToggle);
    return () => {
      window.removeEventListener("toggle-wedding-music", handleToggle);
    };
  }, [isPlaying]);

  // Support triggering play programmatically on envelope open click with a 3-second elegant delay
  useEffect(() => {
    const startPlaying = () => {
      clearPlayTimeout();
      playTimeoutRef.current = window.setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.volume = 0;
          audioRef.current.play()
            .then(() => {
              setIsPlaying(true);
              setHasInteracted(true);
              fadeIn(audioRef.current!);
            })
            .catch((err) => console.log("Auto-play on event blocked:", err));
        }
      }, 3000); // Wait 3 seconds before playing the song after opening the invitation
    };

    window.addEventListener("play-wedding-music", startPlaying);
    return () => {
      clearPlayTimeout();
      window.removeEventListener("play-wedding-music", startPlaying);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;

    clearPlayTimeout(); // Cancel any pending play timeout if manually toggled

    if (isPlaying) {
      clearFadeInterval();
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.volume = 0;
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          fadeIn(audioRef.current!);
        })
        .catch((error) => {
          console.error("Playback failed or was blocked:", error);
          alert("Por favor interactúa con la página antes de reproducir audio, o verifica que el enlace sea de un archivo de audio directo (.mp3).");
        });
    }
  };

  return (
    <div id="music-player-container" className="fixed bottom-6 right-6 z-40">
      <audio
        ref={audioRef}
        src={resolvedUrl || undefined}
        loop
        preload="auto"
      />
      
      {/* Visual notification suggesting music activation if not playing yet */}
      {!isPlaying && !hasInteracted && (
        <div className="absolute right-14 top-2 bg-white/95 text-sage-900 border border-sage-200 text-xs px-3 py-1.5 rounded-full shadow-md whitespace-nowrap animate-bounce font-sans font-medium">
          🎵 Activar música de fondo
        </div>
      )}

      <button
        id="btn-toggle-music"
        onClick={togglePlay}
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 border focus:outline-none ${
          isPlaying
            ? "bg-sage-600 text-white border-sage-500 hover:bg-sage-700 animate-pulse"
            : "bg-cream-100 text-sage-700 border-sage-200 hover:bg-cream-200"
        }`}
        title={isPlaying ? "Pausar música" : "Reproducir música"}
      >
        {isPlaying ? (
          <div className="relative flex items-center justify-center">
            <Volume2 size={20} className="animate-bounce" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cream-100 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cream-50"></span>
            </span>
          </div>
        ) : (
          <VolumeX size={20} />
        )}
      </button>
    </div>
  );
}

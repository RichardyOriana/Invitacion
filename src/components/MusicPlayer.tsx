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

  // Keep a ref of resolvedUrl to prevent stale closure bugs in event handlers
  const resolvedUrlRef = useRef<string>("");
  useEffect(() => {
    resolvedUrlRef.current = resolvedUrl;
  }, [resolvedUrl]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearFadeInterval();
      clearPlayTimeout();
    };
  }, []);

  // Update source and reload audio when URL changes
  useEffect(() => {
    if (audioRef.current && resolvedUrl) {
      clearFadeInterval();
      audioRef.current.src = resolvedUrl;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.volume = 0;
        audioRef.current.play()
          .then(() => {
            fadeIn(audioRef.current!, 6000);
          })
          .catch((err) => {
            console.warn("Audio play blocked on URL change:", err);
            setIsPlaying(false);
          });
      }
    }
  }, [resolvedUrl]);

  // Unified play function
  const playAudio = (withDelay = true) => {
    clearPlayTimeout();
    setIsPlaying(true);
    setHasInteracted(true);

    const audio = audioRef.current;
    const url = resolvedUrlRef.current;

    if (audio && url) {
      // Play immediately at volume 0 to authorize/bless playback in the user gesture context
      audio.volume = 0;
      audio.play()
        .then(() => {
          if (withDelay) {
            // Elegant delay: wait 3.5 seconds at volume 0, then fade in gradually over 6 seconds
            console.log("Audio blessed. Waiting 3.5s before starting 6s fade-in...");
            playTimeoutRef.current = window.setTimeout(() => {
              fadeIn(audio, 6000);
            }, 3500);
          } else {
            // Play immediately with a 6 seconds fade-in
            fadeIn(audio, 6000);
          }
        })
        .catch((err) => {
          console.log("Audio play failed/blocked inside playAudio:", err);
        });
    } else {
      console.log("Audio element or URL not ready yet when playAudio was requested.");
    }
  };

  // Autoplay attempt and global user interaction listener
  useEffect(() => {
    let hasPlayed = false;

    const attemptAutoplay = () => {
      if (hasPlayed) return;
      const audio = audioRef.current;
      const url = resolvedUrlRef.current;

      if (audio && url) {
        audio.volume = 0;
        audio.play()
          .then(() => {
            console.log("Autoplay succeeded!");
            hasPlayed = true;
            setIsPlaying(true);
            setHasInteracted(true);
            // Delay 3.5 seconds at volume 0, then fade in over 6 seconds
            playTimeoutRef.current = window.setTimeout(() => {
              fadeIn(audio, 6000);
            }, 3500);
            removeListeners();
          })
          .catch((err) => {
            console.log("Autoplay blocked by browser policy. Waiting for user interaction...");
          });
      }
    };

    const handleUserInteraction = () => {
      if (hasPlayed) return;
      console.log("User interaction detected (anywhere on page), playing background music...");
      const audio = audioRef.current;
      const url = resolvedUrlRef.current;

      if (audio && url) {
        audio.volume = 0;
        audio.play()
          .then(() => {
            hasPlayed = true;
            setIsPlaying(true);
            setHasInteracted(true);
            // Delay 3.5 seconds at volume 0, then fade in over 6 seconds
            playTimeoutRef.current = window.setTimeout(() => {
              fadeIn(audio, 6000);
            }, 3500);
            removeListeners();
          })
          .catch((err) => {
            console.log("Playback failed on user interaction:", err);
          });
      }
    };

    const removeListeners = () => {
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
      document.removeEventListener("scroll", handleUserInteraction);
      document.removeEventListener("mousedown", handleUserInteraction);
    };

    // Attempt to autoplay 1.5 seconds after resolvedUrl is ready
    const autoplayTimer = window.setTimeout(() => {
      attemptAutoplay();
    }, 1500);

    // Listen for any gesture on the document to guarantee playback as early as possible
    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("touchstart", handleUserInteraction);
    document.addEventListener("scroll", handleUserInteraction);
    document.addEventListener("mousedown", handleUserInteraction);

    return () => {
      window.clearTimeout(autoplayTimer);
      removeListeners();
    };
  }, [resolvedUrl]); // Re-runs when the URL is ready so we can play the loaded source

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

  // Listen to the play event dispatched when the envelope opens (instant responsive play)
  useEffect(() => {
    const startPlaying = () => {
      console.log("play-wedding-music event received");
      playAudio(true); // Play with delayed onset and 6s fade-in!
    };

    window.addEventListener("play-wedding-music", startPlaying);
    return () => {
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
      setIsPlaying(true);
      audioRef.current.volume = 0;
      audioRef.current.play()
        .then(() => {
          fadeIn(audioRef.current!, 6000);
        })
        .catch((error) => {
          console.error("Manual playback failed:", error);
          alert("Por favor interactúa con la página antes de reproducir audio, o verifica que el archivo de audio sea válido.");
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

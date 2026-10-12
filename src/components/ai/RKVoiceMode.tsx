"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  AlertCircle,
  Sparkles,
  Zap,
  Radio,
  CheckCircle2,
} from "lucide-react";

interface RKVoiceModeProps {
  onCommand: (spokenText: string) => void;
  active: boolean;
  onToggle: (active: boolean) => void;
  lang?: string;
}

export default function RKVoiceMode({
  onCommand,
  active,
  onToggle,
  lang = "en-IN",
}: RKVoiceModeProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [soundFeedback, setSoundFeedback] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  // References for Web Speech API & MediaRecorder fallback
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Play subtle acoustic chimes using Web Audio API
  const playAudioChime = (freq: number = 880, type: OscillatorType = "sine", duration: number = 0.12) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (_) {}
  };

  // Helper to cleanup media streams
  const cleanupStream = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  // Setup Web Speech API if supported
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = lang === "tamil" ? "ta-IN" : "en-IN";

        recognition.onstart = () => {
          setIsListening(true);
          setErrorMsg(null);
          setSoundFeedback("Listening for voice...");
          playAudioChime(660, "triangle", 0.15);
        };

        recognition.onresult = (event: any) => {
          let current = "";
          for (let i = 0; i < event.results.length; i++) {
            current += event.results[i][0].transcript;
          }
          setTranscript(current);

          if (event.results[0].isFinal) {
            playAudioChime(980, "sine", 0.12);
            setSoundFeedback("Command recognized!");
            setTimeout(() => {
              if (current.trim()) {
                onCommand(current.trim());
                setTranscript("");
                setSoundFeedback(null);
              }
            }, 300);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition notice:", event.error);
          setIsListening(false);
          setSoundFeedback(null);
          if (event.error === "not-allowed") {
            setErrorMsg("Microphone access was denied. Please allow microphone permissions in your browser URL bar.");
          } else if (event.error !== "no-speech") {
            // Silently fallback to MediaRecorder if SpeechRecognition has network or service issues
            startMediaRecorderFallback();
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          cleanupStream();
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn("Speech recognition init exception:", err);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      cleanupStream();
    };
  }, [lang, onCommand]);

  // Universal MediaRecorder + Web Audio API Fallback
  const startMediaRecorderFallback = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMsg("Please type in the chat or select one of the voice command buttons below.");
        return;
      }

      cleanupStream();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Connect Analyser to stream for real-time waveform animation
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;

        const updateWaveform = () => {
          if (!analyserRef.current) return;
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          const avg = dataArray.reduce((p, c) => p + c, 0) / dataArray.length;
          setAudioLevel(Math.min(100, Math.round(avg * 1.5)));
          animationFrameRef.current = requestAnimationFrame(updateWaveform);
        };
        updateWaveform();
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsListening(false);
        cleanupStream();
        playAudioChime(980, "sine", 0.12);

        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (audioBlob.size > 0) {
          try {
            setSoundFeedback("Processing voice...");
            const formData = new FormData();
            formData.append("audio", audioBlob);

            const res = await fetch("/api/ai/voice-transcribe", {
              method: "POST",
              body: formData,
            });
            const data = await res.json();
            if (data.success && data.text) {
              setTranscript(data.text);
              setTimeout(() => {
                onCommand(data.text);
                setTranscript("");
                setSoundFeedback(null);
              }, 300);
              return;
            }
          } catch (uploadErr) {
            console.error("Transcribe upload error:", uploadErr);
          }
        }
      };

      mediaRecorder.start();
      setIsListening(true);
      setErrorMsg(null);
      setSoundFeedback("Listening via microphone...");
      playAudioChime(660, "triangle", 0.15);

      // Auto-stop after 6 seconds of speech capture
      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
        }
      }, 6000);
    } catch (err: any) {
      console.warn("Microphone access error:", err);
      setIsListening(false);
      cleanupStream();
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setErrorMsg("Microphone access was denied. Please allow microphone permissions in your browser URL bar.");
      } else {
        setErrorMsg("Microphone could not be started. Tap a voice command button below to ask RK AI.");
      }
    }
  };

  // Main Toggle
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        try {
          mediaRecorderRef.current.stop();
        } catch (_) {}
      }
      setIsListening(false);
      onToggle(false);
      setSoundFeedback(null);
      cleanupStream();
      playAudioChime(440, "sine", 0.1);
    } else {
      setErrorMsg(null);
      onToggle(true);

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition && recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (err) {
          console.warn("Speech recognition start failed, using MediaRecorder fallback:", err);
          startMediaRecorderFallback();
        }
      } else {
        // Universal fallback for Firefox, Safari, Edge, Webviews
        startMediaRecorderFallback();
      }
    }
  };

  const handleQuickCommand = (text: string) => {
    playAudioChime(880, "sine", 0.1);
    onCommand(text);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {/* VOICE TOGGLE BUTTON */}
        <button
          type="button"
          onClick={toggleListening}
          aria-label={isListening ? "Stop voice recording" : "Start RK Voice recording"}
          className={`flex items-center gap-2 text-xs px-3.5 py-2 rounded-xl font-bold transition-all relative overflow-hidden ${
            isListening
              ? "bg-gradient-to-r from-cyan-500/30 via-violet-500/30 to-pink-500/30 text-cyan-300 border border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
              : "bg-[#0b1020] hover:bg-[#111630] text-cyan-400 border border-violet-500/30 hover:border-cyan-500/50 shadow-md"
          }`}
          title="RK AI Voice Interaction (Universal: Tamil, Tanglish, English)"
        >
          {isListening ? (
            <>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
              </span>
              <MicOff className="w-3.5 h-3.5 text-cyan-300" />
              <span>Listening... (Tap to Send)</span>
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5 text-cyan-400" />
              <span>RK Voice Mode</span>
            </>
          )}
        </button>

        {/* TTS AUDIO TOGGLE */}
        <button
          type="button"
          onClick={() => {
            const next = !ttsEnabled;
            setTtsEnabled(next);
            playAudioChime(next ? 700 : 350, "sine", 0.08);
          }}
          aria-label={ttsEnabled ? "Mute speech audio" : "Enable speech audio"}
          className={`p-2 rounded-xl border transition-all ${
            ttsEnabled
              ? "bg-[#0b1020] border-cyan-500/40 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
              : "bg-[#0b1020] border-slate-800 text-slate-500 hover:text-slate-300"
          }`}
          title={ttsEnabled ? "Text-to-Speech Output: Active" : "Text-to-Speech Output: Muted"}
        >
          {ttsEnabled ? (
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
          ) : (
            <VolumeX className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* LIVE AUDIO WAVEFORM & REAL-TIME PREVIEW */}
      {isListening && (
        <div className="p-3.5 bg-gradient-to-r from-[#0c1024] via-[#101535] to-[#0c1024] border border-cyan-500/40 rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.2)] space-y-2 animate-fadeIn">
          {/* Header pill with live waveform bars */}
          <div className="flex items-center justify-between text-xs border-b border-cyan-500/20 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shadow-[0_0_8px_#06b6d4]" />
              <span className="text-[11px] font-black uppercase tracking-wider text-cyan-300">
                {soundFeedback || "RK AI Neural Listening"}
              </span>
            </div>

            {/* LIVE 8-BAR AUDIO EQUALIZER WAVEFORM */}
            <div className="flex items-center gap-1 h-5 px-2 py-0.5 rounded-md bg-[#070914] border border-cyan-500/30">
              <span className="w-1 bg-cyan-400 rounded-full audio-bar-1 shadow-[0_0_4px_#06b6d4]" />
              <span className="w-1 bg-violet-400 rounded-full audio-bar-2 shadow-[0_0_4px_#8b5cf6]" />
              <span className="w-1 bg-pink-400 rounded-full audio-bar-3 shadow-[0_0_4px_#ec4899]" />
              <span className="w-1 bg-cyan-300 rounded-full audio-bar-4 shadow-[0_0_4px_#06b6d4]" />
              <span className="w-1 bg-violet-300 rounded-full audio-bar-5 shadow-[0_0_4px_#8b5cf6]" />
              <span className="w-1 bg-pink-300 rounded-full audio-bar-6 shadow-[0_0_4px_#ec4899]" />
              <span className="w-1 bg-cyan-400 rounded-full audio-bar-7 shadow-[0_0_4px_#06b6d4]" />
              <span className="w-1 bg-violet-400 rounded-full audio-bar-8 shadow-[0_0_4px_#8b5cf6]" />
            </div>
          </div>

          {/* Real-time transcription or listening feedback */}
          <div className="min-h-[1.5rem] flex items-center">
            <p className="text-xs text-white italic font-medium">
              {transcript ? (
                <span className="text-cyan-200">“{transcript}”</span>
              ) : (
                <span className="text-slate-400">
                  Speak now in Tamil, Tanglish, or English (e.g. &ldquo;Macha DJ list kaatu&rdquo;)...
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* QUICK SPOKEN COMMAND CHIPS (Always Available) */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
        <span className="text-slate-400 text-[10px] font-bold">Quick Voice Triggers:</span>
        {[
          { label: "Macha DJ venum", text: "Enakku marriage-ku oru DJ book pannanum" },
          { label: "Chengalpattu Catering", text: "Enakku Chengalpattu-la 15000 kulla Catering venum" },
          { label: "Wedding Decoration", text: "RK wedding decoration vendors kaatu" },
          { label: "RK stop", text: "RK stop" },
        ].map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleQuickCommand(item.text)}
            className="px-2.5 py-1 rounded-lg bg-[#0b1020] hover:bg-[#131b38] text-cyan-300 border border-cyan-500/25 hover:border-cyan-400/50 text-[10px] font-semibold transition-all shadow-sm"
          >
            &ldquo;{item.label}&rdquo;
          </button>
        ))}
      </div>

      {errorMsg && (
        <div className="p-2.5 bg-rose-950/40 border border-rose-500/30 rounded-xl text-[11px] text-rose-300 flex items-center gap-2 shadow-[0_0_12px_rgba(244,63,94,0.2)]">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}


import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Sparkles, X, FileText, Image as ImageIcon, Volume2, Volume1, VolumeX, Square, Settings2, Mic, MicOff, Trash2, RotateCcw, History, Download, Share2, Headset, MessageSquareText, Check, ChevronDown, Save, Calendar, Music, Zap, Heart, Settings, Paperclip, User, Wand2, Loader2, Play, Pause, ExternalLink, Link as LinkIcon, FileDown, FileJson, UploadCloud, Timer, Activity, FlaskConical, Target, GraduationCap, Fingerprint, CheckCircle2, CloudCheck, Cloud } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, DistributorData, SavedSession, UserAccount } from '../types';
import { getAI, analyzeMedicalDocument, textToSpeech, generateImage, analyzeVoiceSample } from '../services/geminiService';
import { playPcmAudio, stopAllAudio, setAudioVolume } from '../services/audioService';
import { MODELS, SYSTEM_INSTRUCTIONS, JOSE_ID, DEFAULT_NEOLIFE_LINK, VOICES } from '../constants';

interface ChatBotProps {
    distData: DistributorData | null;
    isOwner: boolean;
    initialIntent?: string | null;
}

interface Attachment {
  data: string; // base64
  mimeType: string;
  name: string;
}

const UserPlus = ({ size, className }: { size: number, className: string }) => <Heart size={size} className={className} />;

const SUGGESTED_PROMPTS = [
  { 
    label: 'Analyser Bilan Sanguin', 
    prompt: 'Je souhaite vous soumettre mes résultats de bilan sanguin pour une analyse de nutrition cellulaire. Que dois-je regarder en priorité pour ma vitalité ?', 
    icon: <FlaskConical size={14} className="text-red-500" /> 
  },
  { 
    label: 'Conseils Trio Nutrition', 
    prompt: 'Expliquez-moi les bienfaits du Trio de Relance NeoLife pour ma vitalité cellulaire et comment il fonctionne.', 
    icon: <Sparkles size={14} className="text-green-500" /> 
  },
  { 
    label: 'Opportunité NeoLife', 
    prompt: 'Comment fonctionne le système de duplication GMBC-OS avec NeoLife et comment puis-je générer un revenu ?', 
    icon: <Target size={14} className="text-blue-500" /> 
  },
  { 
    label: 'S\'inscrire maintenant', 
    prompt: 'Quelles sont les étapes pour devenir distributeur NeoLife avec votre équipe et rejoindre le système GMBC-OS ?', 
    icon: <UserPlus size={14} className="text-emerald-500" /> 
  },
  { 
    label: 'Liberté Financière', 
    prompt: 'Comment le concept de "Temps contre Argent" est-il résolu par le système de duplication NeoLife et NDSA ?', 
    icon: <Zap size={14} className="text-amber-500" /> 
  }
];

// Phrases courtes pour accusé de réception vocal aléatoire
const ACK_PHRASES = ["Compris !", "Bien reçu.", "J'écoute.", "C'est noté.", "Entendu.", "Je m'en occupe.", "Synergie reçue.", "J'analyse cela."];

const ChatBot: React.FC<ChatBotProps> = ({ distData, isOwner, initialIntent }) => {
  const currentId = distData?.id || JOSE_ID;
  const currentShop = distData?.shopUrl || DEFAULT_NEOLIFE_LINK;
  const storageKey = `jose_chat_history_${currentId}`;
  const archiveKey = `jose_session_archives_${currentId}`;
  const draftKey = `jose_chat_draft_${currentId}`;
  const userKey = 'jose_current_user';

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem(userKey);
    return saved ? JSON.parse(saved) : null;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }

    let welcomeText = `Bonjour, je suis Coach JOSÉ.\n\nJe suis l'assistant intelligent de **GMBC-OS** pour le partenaire NeoLife ID: ${currentId}.\n\nDites-moi : **qu'est-ce qui vous amène aujourd'hui ?**\n\n1. Cherchez-vous à améliorer votre **Santé** et votre vitalité ?\n2. Ou êtes-vous à la recherche d'une **Opportunité** capable de vous mener à la liberté financière ?`;
    
    return [{ role: 'model', text: welcomeText, timestamp: Date.now() }];
  });
  
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>(() => {
    const saved = localStorage.getItem(archiveKey);
    return saved ? JSON.parse(saved) : [];
  });

  const [input, setInput] = useState(() => {
    return localStorage.getItem(draftKey) || '';
  });

  const [isLoading, setIsLoading] = useState(false);
  const [activePlayback, setActivePlayback] = useState<{ index: number; progress: number; duration: number } | null>(null);
  const [volume, setVolume] = useState(1.0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isConversational, setIsConversational] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(currentUser?.preferredVoice || VOICES[0].id);
  const [showArchive, setShowArchive] = useState(false);
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);
  const [showVoiceStudio, setShowVoiceStudio] = useState(false);
  const [isAnalyzingVoice, setIsAnalyzingVoice] = useState(false);
  const [voiceAnalysisResult, setVoiceAnalysisResult] = useState<{recommendedVoice: string, analysis: string} | null>(null);
  const [isRecordingSample, setIsRecordingSample] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [isSavingSession, setIsSavingSession] = useState(false);
  const [saveSessionSuccess, setSaveSessionSuccess] = useState(false);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dropSuccess, setDropSuccess] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<number>(Date.now());
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const voiceMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const playbackIntervalRef = useRef<number | null>(null);
  const recordingTimerRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const dragCounter = useRef(0);
  const isHandsFreeRef = useRef(false);

  // Auto-save messages and draft periodically
  useEffect(() => {
    const handleAutoSave = () => {
        setIsAutoSaving(true);
        localStorage.setItem(storageKey, JSON.stringify(messages));
        localStorage.setItem(draftKey, input);
        setLastAutoSave(Date.now());
        setTimeout(() => setIsAutoSaving(false), 2000);
    };

    // Reactive save on message change
    handleAutoSave();

    // Periodic heartbeat save every 60 seconds
    const interval = setInterval(handleAutoSave, 60000);
    return () => clearInterval(interval);
  }, [messages, input, storageKey, draftKey]);

  useEffect(() => {
    localStorage.setItem(archiveKey, JSON.stringify(savedSessions));
  }, [savedSessions, archiveKey]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (voiceMenuRef.current && !voiceMenuRef.current.contains(event.target as Node)) {
        setShowVoiceMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      setRecordingSeconds(0);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; 
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'fr-FR';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
          else interimTranscript += event.results[i][0].transcript;
        }
        
        const currentTranscript = finalTranscript || interimTranscript;
        if (currentTranscript.trim()) setInput(currentTranscript);
        
        if (finalTranscript && isHandsFreeRef.current) {
          if (!activePlayback) {
             const capturedText = finalTranscript;
             setTimeout(() => {
               if (isHandsFreeRef.current) handleSend(capturedText);
             }, 800);
          }
        }
      };

      recognitionRef.current.onend = () => {
        if (isHandsFreeRef.current && !activePlayback && !isLoading && !isAcknowledging) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            // Silencieux
          }
        } else if (!isHandsFreeRef.current) {
          setIsRecording(false);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === 'not-allowed') {
          isHandsFreeRef.current = false;
          setIsRecording(false);
        }
      };
    }
    return () => {
        if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
    };
  }, [activePlayback, isLoading, isAcknowledging]);

  const processFile = useCallback((file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setAttachment({
        data: base64,
        mimeType: file.type,
        name: file.name
      });
      setDropSuccess(true);
      setTimeout(() => setDropSuccess(false), 2000);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current <= 0) {
      setIsDragging(false);
      dragCounter.current = 0;
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoice(voiceId);
    if (currentUser) {
      const updatedUser = { ...currentUser, preferredVoice: voiceId };
      setCurrentUser(updatedUser);
      localStorage.setItem(userKey, JSON.stringify(updatedUser));
    }
    setShowVoiceMenu(false);
  };

  const handlePreviewVoice = async (voiceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewingVoice === voiceId) {
      stopAllAudio();
      setPreviewingVoice(null);
      return;
    }
    
    stopAllAudio();
    setPreviewingVoice(voiceId);
    const sampleText = "Bonjour ! Je suis Coach JOSÉ. Je suis prêt à vous accompagner vers la vitalité cellulaire.";
    const audio = await textToSpeech(sampleText, voiceId);
    if (audio) {
      const source = await playPcmAudio(audio);
      if (source) {
        source.onended = () => setPreviewingVoice(null);
      } else {
        setPreviewingVoice(null);
      }
    } else {
      setPreviewingVoice(null);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setAudioVolume(newVol);
  };

  const handleSaveSession = () => {
    if (messages.length <= 1) return;
    setIsSavingSession(true);

    const firstUserMsg = messages.find(m => m.role === 'user')?.text || "Session Synergie";
    const title = prompt("Titre de la session :", firstUserMsg.substring(0, 30) + "...") || `Session ${new Date().toLocaleDateString()}`;

    const newSession: SavedSession = {
      id: `session_${Date.now()}`,
      title,
      timestamp: Date.now(),
      messages: [...messages]
    };

    setSavedSessions(prev => [newSession, ...prev]);
    
    setTimeout(() => {
      setIsSavingSession(false);
      setSaveSessionSuccess(true);
      setTimeout(() => setSaveSessionSuccess(false), 2000);
    }, 500);
  };

  const exportFullSession = (session: SavedSession, format: 'txt' | 'json') => {
    let content = "";
    let blob: Blob;
    let filename = `CoachJOSE_Session_${session.id}`;

    if (format === 'txt') {
      content = `=== ARCHIVE SYNERGIQUE COACH JOSÉ ===\n`;
      content += `ID Distributeur : ${currentId}\n`;
      content += `Titre : ${session.title}\n`;
      content += `Date : ${new Date(session.timestamp).toLocaleString()}\n`;
      content += `====================================\n\n`;
      
      session.messages.forEach((msg, i) => {
        const time = new Date(msg.timestamp).toLocaleString();
        content += `[${time}] ${msg.role === 'user' ? 'VOUS' : 'COACH JOSÉ'}:\n${msg.text}\n\n`;
      });
      
      blob = new Blob([content], { type: 'text/plain' });
      filename += ".txt";
    } else {
      const data = {
        ...session,
        metadata: {
          distId: currentId,
          version: "3.1",
          exporter: "GMBC-OS Synergy Engine"
        }
      };
      blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      filename += ".json";
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const startVoiceRecording = async () => {
    setIsRecordingSample(true);
    setRecordingProgress(0);
    audioChunksRef.current = [];
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          setIsAnalyzingVoice(true);
          const result = await analyzeVoiceSample(base64Audio, 'audio/webm');
          if (result) {
            setVoiceAnalysisResult(result);
            const matchedVoice = VOICES.find(v => v.id.toLowerCase().includes(result.recommendedVoice.toLowerCase()));
            if (matchedVoice) {
              handleVoiceChange(matchedVoice.id);
            }
          }
          setIsAnalyzingVoice(false);
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();

      let progress = 0;
      const interval = setInterval(() => {
        progress += 1;
        setRecordingProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          mediaRecorder.stop();
          setIsRecordingSample(false);
        }
      }, 50);

    } catch (err) {
      console.error(err);
      setIsRecordingSample(false);
    }
  };

  const playAckVocal = async () => {
    setIsAcknowledging(true);
    const phrase = ACK_PHRASES[Math.floor(Math.random() * ACK_PHRASES.length)];
    try {
      const audio = await textToSpeech(phrase, selectedVoice);
      if (audio) {
        const source = await playPcmAudio(audio);
        if (source) {
          return new Promise<void>((resolve) => {
            source.onended = () => {
              setIsAcknowledging(false);
              resolve();
            };
            setTimeout(resolve, 3000);
          });
        }
      }
    } catch (e) {
      console.error("Ack vocal error", e);
    }
    setIsAcknowledging(false);
  };

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() && !attachment) return;
    
    if (isHandsFreeRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
    }

    const wasVocal = !overrideInput && input.length > 0;
    
    const displayMessage = attachment 
      ? `${textToSend}\n\n📎 *Document joint : ${attachment.name}*`
      : textToSend;

    const userMessage: ChatMessage = { role: 'user', text: displayMessage, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    localStorage.removeItem(draftKey);
    setIsLoading(true);

    if (wasVocal || isConversational || isHandsFreeRef.current) {
      await playAckVocal();
    }

    try {
      let responseText = "";
      let sources: { title?: string, uri?: string }[] = [];
      const sysInst = SYSTEM_INSTRUCTIONS(currentId, currentShop, isOwner);

      if (attachment) {
        const promptWithContext = textToSend || "Veuillez analyser ce document médical ou cette étiquette produit selon les protocoles NeoLife.";
        responseText = await analyzeMedicalDocument(promptWithContext, attachment.data, attachment.mimeType, sysInst);
        setAttachment(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        const ai = getAI();
        const chat = ai.chats.create({
          model: MODELS.TEXT_COMPLEX,
          config: { 
            systemInstruction: sysInst,
            tools: [{ googleSearch: {} }]
          }
        });
        const response = await chat.sendMessage({ message: textToSend });
        responseText = response.text || "Désolé, j'ai rencontré une erreur.";
        
        sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
          ?.filter((chunk: any) => chunk.web)
          ?.map((chunk: any) => ({
            title: chunk.web?.title,
            uri: chunk.web?.uri
          })) || [];
      }
      
      const responseMsg: ChatMessage = { 
        role: 'model', 
        text: responseText, 
        timestamp: Date.now(),
        sources: sources.length > 0 ? sources : undefined
      };
      
      setMessages(prev => [...prev, responseMsg]);
      
      if (isConversational || isHandsFreeRef.current) {
        handleAudioPlayback(messages.length, responseMsg.text);
      } else if (isHandsFreeRef.current) {
          try { recognitionRef.current.start(); } catch(e) {}
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "Erreur lors de l'analyse. Veuillez réessayer.", timestamp: Date.now() }]);
      if (isHandsFreeRef.current) {
          try { recognitionRef.current.start(); } catch(e) {}
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAudioPlayback = async (idx: number, text: string) => {
      const isAlreadyPlaying = activePlayback?.index === idx;
      
      stopAllAudio();
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);

      if (isAlreadyPlaying) {
          setActivePlayback(null);
          if (isHandsFreeRef.current) {
            try { recognitionRef.current.start(); } catch(e) {}
          }
          return;
      }

      if (isHandsFreeRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
      }

      const msg = messages[idx];
      let audio = msg?.audio;

      if (!audio) {
          audio = await textToSpeech(text, selectedVoice) || undefined;
          if (audio) {
              setMessages(prev => {
                  const n = [...prev];
                  if (n[idx]) n[idx].audio = audio;
                  return n;
              });
          }
      }

      if (audio) {
          const source = await playPcmAudio(audio);
          if (source) {
              const duration = source.buffer?.duration || 0;
              let startTime = Date.now();
              setActivePlayback({ index: idx, progress: 0, duration });

              playbackIntervalRef.current = window.setInterval(() => {
                  const elapsed = (Date.now() - startTime) / 1000;
                  if (elapsed >= duration) {
                      setActivePlayback(null);
                      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
                  } else {
                      setActivePlayback(prev => prev ? { ...prev, progress: elapsed } : null);
                  }
              }, 100);

              source.onended = () => {
                  setActivePlayback(null);
                  if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
                  
                  if (isHandsFreeRef.current) {
                    setTimeout(() => {
                        if (isHandsFreeRef.current) {
                            try { recognitionRef.current.start(); } catch(e) {}
                        }
                    }, 500);
                  }
              };
          } else if (isHandsFreeRef.current) {
              try { recognitionRef.current.start(); } catch(e) {}
          }
      } else if (isHandsFreeRef.current) {
          try { recognitionRef.current.start(); } catch(e) {}
      }
  };

  const toggleRecording = () => {
    if (isRecording) {
      isHandsFreeRef.current = false;
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        isHandsFreeRef.current = true;
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (e) {
        console.error("Speech recognition error:", e);
      }
    }
  };

  const createWavFile = (base64Pcm: string) => {
    const binary = atob(base64Pcm);
    const len = binary.length;
    const buffer = new ArrayBuffer(44 + len);
    const view = new DataView(buffer);
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, 36 + len, true);
    view.setUint32(8, 0x57415645, false); // "WAVE"
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, 24000, true);
    view.setUint32(28, 48000, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, len, true);
    for (let i = 0; i < len; i++) {
        view.setUint8(44 + i, binary.charCodeAt(i));
    }
    return new Blob([buffer], { type: 'audio/wav' });
  };

  const exportSingleMessage = async (idx: number, format: 'txt' | 'audio') => {
    const msg = messages[idx];
    let blob: Blob;
    let filename: string;

    if (format === 'txt') {
      const content = `[${new Date(msg.timestamp).toLocaleString()}] ${msg.role === 'user' ? 'VOUS' : 'COACH JOSÉ'}\n\n${msg.text}`;
      blob = new Blob([content], { type: 'text/plain' });
      filename = `Message_${idx + 1}_${Date.now()}.txt`;
    } else {
      let audioBase64 = msg.audio;
      if (!audioBase64) {
        setIsLoading(true);
        audioBase64 = await textToSpeech(msg.text, selectedVoice) || undefined;
        setIsLoading(false);
        if (audioBase64) {
            setMessages(prev => {
                const n = [...prev];
                n[idx].audio = audioBase64;
                return n;
            });
        }
      }
      if (!audioBase64) return;
      blob = createWavFile(audioBase64);
      filename = `CoachJOSE_Vocal_${idx + 1}_${Date.now()}.wav`;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX size={14} />;
    if (volume < 0.5) return <Volume1 size={14} />;
    return <Volume2 size={14} />;
  };

  return (
    <div 
      ref={dropZoneRef}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative max-w-4xl mx-auto h-[calc(100vh-180px)] flex flex-col rounded-[3rem] shadow-2xl border-4 border-white overflow-hidden glass-effect transition-all duration-500"
    >
      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-600/30 backdrop-blur-md z-[60] flex items-center justify-center animate-in fade-in duration-300">
           <div className="w-[85%] h-[85%] border-8 border-dashed border-white rounded-[4rem] flex flex-col items-center justify-center gap-8 bg-blue-600/40 shadow-2xl scale-in-95 animate-in duration-300">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-2xl animate-bounce">
                <UploadCloud size={64} />
              </div>
              <div className="text-center px-10">
                <h3 className="text-4xl font-black text-white uppercase tracking-tighter drop-shadow-lg">Relâchez pour Analyser</h3>
                <p className="text-white/90 font-bold mt-4 text-lg">Coach JOSÉ est prêt à examiner votre document nutritionnel.</p>
              </div>
           </div>
        </div>
      )}

      {/* Drop Success Pulse */}
      {dropSuccess && (
        <div className="absolute inset-0 pointer-events-none z-[61] animate-in fade-in zoom-in duration-500">
            <div className="absolute inset-0 bg-green-500/10 backdrop-blur-[2px]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-6 shadow-2xl flex flex-col items-center gap-3 animate-bounce">
                <CheckCircle2 size={48} className="text-green-500" />
                <span className="text-xs font-black text-green-600 uppercase tracking-widest">Document Reçu !</span>
            </div>
        </div>
      )}

      {/* Header Synergy */}
      <div className="p-6 border-b flex items-center justify-between z-10 bg-white/50 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl synergy-bg flex items-center justify-center text-white font-black text-2xl relative transition-all duration-500 shadow-xl ${isRecording || isAcknowledging ? 'animate-pulse-synergy scale-110' : 'shadow-blue-500/20'}`}>
            J
            {(isAcknowledging || isRecording) && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
                <span className="text-[6px] font-black uppercase tracking-tighter text-white/80 whitespace-nowrap">
                    {isRecording ? 'ÉCOUTE...' : 'COMPRIS'}
                </span>
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-black text-slate-900 tracking-tight text-lg uppercase">Coach JOSÉ</p>
              <div className="flex gap-2">
                <div className="px-2 py-0.5 bg-blue-600 rounded-lg text-[8px] font-black text-white uppercase tracking-tighter">NDSA</div>
                <div className="px-2 py-0.5 bg-green-600 rounded-lg text-[8px] font-black text-white uppercase tracking-tighter">NEOLIFE</div>
                {/* Auto-save Indicator */}
                <div className={`flex items-center gap-1.5 px-2 py-0.5 bg-white border border-slate-100 rounded-lg text-[8px] font-black uppercase tracking-tighter transition-all ${isAutoSaving ? 'text-blue-600 animate-pulse' : 'text-slate-400'}`}>
                    {isAutoSaving ? <Cloud size={10} className="animate-bounce" /> : <CloudCheck size={10} />}
                    <span className="hidden sm:inline">{isAutoSaving ? 'Sauvegarde...' : 'Session synchronisée'}</span>
                </div>
              </div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-widest">
              <span className={`w-2 h-2 rounded-full ${activePlayback ? 'bg-green-500' : isRecording ? 'bg-red-500' : 'bg-blue-500'} animate-pulse`}></span>
              {isRecording ? 'CONVERSATION ACTIVE' : activePlayback ? 'LECTURE...' : 'SYNERGIE PRÊTE'}
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              ID: {currentId}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <button 
             onClick={handleSaveSession}
             disabled={messages.length <= 1 || isSavingSession}
             className={`p-3.5 rounded-2xl transition-all shadow-md active:scale-95 flex items-center gap-2 ${saveSessionSuccess ? 'bg-green-600 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:text-blue-600'} disabled:opacity-50`}
             title="Sauvegarder la session actuelle"
           >
             {isSavingSession ? <Loader2 size={20} className="animate-spin" /> : saveSessionSuccess ? <Check size={20} /> : <Save size={20} />}
           </button>

           <button onClick={() => setShowArchive(!showArchive)} className={`p-3.5 rounded-2xl transition-all shadow-md active:scale-95 flex items-center gap-2 ${showArchive ? 'synergy-bg text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`} title="Archives des sessions">
             <History size={20} />
             {savedSessions.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 synergy-bg text-white text-[10px] flex items-center justify-center rounded-full font-black border-2 border-white">{savedSessions.length}</span>}
           </button>

           <button onClick={() => setIsConversational(!isConversational)} className={`p-3.5 rounded-2xl transition-all shadow-md active:scale-95 ${isConversational ? 'bg-green-600 text-white shadow-green-200' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`} title="Mode Conversationnel (Auto-TTS)">
             <Headset size={20} />
           </button>
           
           <div className="relative" ref={voiceMenuRef}>
             <button onClick={() => setShowVoiceMenu(!showVoiceMenu)} className="p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 shadow-md active:scale-95 flex items-center gap-2" title="Réglages Voix">
               <Volume2 size={20} />
               <ChevronDown size={14} className={showVoiceMenu ? 'rotate-180' : ''} />
             </button>
             {showVoiceMenu && (
               <div className="absolute top-full right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                 <div className="p-4 bg-slate-50 border-b flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identité Vocale</p>
                    <button onClick={() => {setShowVoiceStudio(true); setShowVoiceMenu(false);}} className="text-[9px] font-black text-blue-600 uppercase hover:underline">Studio</button>
                 </div>
                 {VOICES.map(v => (
                   <div key={v.id} onClick={() => handleVoiceChange(v.id)} className={`p-4 flex items-center justify-between cursor-pointer hover:bg-blue-50 transition-colors ${selectedVoice === v.id ? 'bg-blue-50 text-blue-600' : 'text-slate-700'}`}>
                      <div className="flex items-center gap-3">
                        <button onClick={(e) => handlePreviewVoice(v.id, e)} className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 hover:bg-slate-100">
                           {previewingVoice === v.id ? <Square size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
                        </button>
                        <span className="text-xs font-bold">{v.name.split(' ')[0]}</span>
                      </div>
                      {selectedVoice === v.id && <Check size={14} />}
                   </div>
                 ))}
               </div>
             )}
           </div>

           <button onClick={() => { stopAllAudio(); setMessages([{ role: 'model', text: 'Nouvelle conversation initialisée.', timestamp: Date.now() }]); localStorage.removeItem(draftKey); setInput(''); }} className="p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:text-blue-600 shadow-md active:scale-95" title="Nouvelle session">
             <RotateCcw size={20} />
           </button>
        </div>
      </div>

      {/* Voice Studio Modal */}
      {showVoiceStudio && (
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-2xl z-50 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
          <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl relative overflow-hidden">
             <button onClick={() => setShowVoiceStudio(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors">
              <X size={24} />
            </button>
            <div className="flex flex-col items-center gap-8 text-center">
              <div className="w-16 h-16 synergy-bg rounded-2xl flex items-center justify-center text-white mx-auto">
                <Fingerprint size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Synchronisation Vocale</h3>
                <p className="text-sm text-slate-500 font-medium mt-2">Coach JOSÉ va analyser votre empreinte vocale pour synchroniser sa propre voix sur votre tonalité.</p>
              </div>

              <div className="w-full bg-slate-50 rounded-[2.5rem] p-10 flex flex-col items-center gap-6 relative border-2 border-slate-100">
                {isAnalyzingVoice ? (
                   <div className="flex flex-col items-center gap-4 animate-in fade-in">
                      <div className="flex gap-1.5 h-12 items-center">
                        {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 synergy-bg rounded-full animate-wave" style={{height: `${Math.random()*100}%`, animationDelay: `${i*0.1}s`}}></div>)}
                      </div>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Analyse Neuronale...</p>
                   </div>
                ) : voiceAnalysisResult ? (
                  <div className="text-left space-y-4 animate-in zoom-in">
                    <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                       <p className="text-[10px] font-black text-green-600 uppercase mb-1">Résultat : {voiceAnalysisResult.recommendedVoice}</p>
                       <p className="text-xs text-slate-700 italic leading-relaxed">"{voiceAnalysisResult.analysis}"</p>
                    </div>
                    <button onClick={() => setVoiceAnalysisResult(null)} className="w-full py-3 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Recommencer</button>
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={startVoiceRecording} 
                      disabled={isRecordingSample}
                      className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-xl ${isRecordingSample ? 'bg-red-500 scale-110 shadow-red-200 animate-pulse' : 'bg-blue-600 text-white hover:scale-105 active:scale-95'}`}
                    >
                      {isRecordingSample ? <Activity size={32} /> : <Mic size={32} />}
                    </button>
                    <div className="space-y-2">
                       <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{isRecordingSample ? 'Enregistrement...' : 'Cliquez pour parler'}</p>
                       <p className="text-[10px] text-slate-400 font-medium italic">"Bonjour Coach JOSÉ, synchronise notre synergie."</p>
                    </div>
                    {isRecordingSample && (
                      <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full synergy-bg transition-all duration-100" style={{ width: `${recordingProgress}%` }}></div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <button 
                onClick={() => setShowVoiceStudio(false)}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl"
              >
                Fermer le Studio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archives Overlay */}
      {showArchive && (
        <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-2xl z-40 p-10 flex flex-col animate-in fade-in duration-300">
           <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 synergy-bg rounded-2xl flex items-center justify-center text-white"><History size={24} /></div>
                 <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-widest">Archives Synergiques</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{savedSessions.length} sessions mémorisées</p>
                 </div>
              </div>
              <button onClick={() => setShowArchive(false)} className="p-3 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all"><X size={24} /></button>
           </div>
           
           <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-4">
              {savedSessions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-white/10 rounded-[3rem]">
                   <Save size={48} className="text-white/10 mb-6" />
                   <p className="text-white font-bold text-lg">Aucune archive pour le moment</p>
                   <p className="text-slate-500 text-sm mt-2 max-w-xs">Sauvegardez vos conversations importantes pour les consulter ou les exporter plus tard.</p>
                </div>
              ) : (
                savedSessions.map(s => (
                  <div key={s.id} className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:bg-white/10 transition-all group">
                    <div className="flex-1 cursor-pointer" onClick={() => { setMessages(s.messages); setShowArchive(false); }}>
                      <p className="text-white font-black text-lg group-hover:text-blue-400 transition-colors uppercase tracking-tight">{s.title}</p>
                      <div className="flex items-center gap-4 mt-2">
                         <p className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={12} /> {new Date(s.timestamp).toLocaleDateString()}</p>
                         <p className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><MessageSquareText size={12} /> {s.messages.length} messages</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                       <button 
                         onClick={() => exportFullSession(s, 'txt')}
                         className="p-3.5 bg-white/10 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-lg flex items-center gap-2"
                         title="Exporter en .TXT (Lecture)"
                       >
                         <FileText size={18} />
                         <span className="text-[10px] font-black uppercase hidden lg:block">Journal</span>
                       </button>
                       <button 
                         onClick={() => exportFullSession(s, 'json')}
                         className="p-3.5 bg-white/10 text-white rounded-2xl hover:bg-amber-600 transition-all shadow-lg flex items-center gap-2"
                         title="Exporter en .JSON (Données)"
                       >
                         <FileJson size={18} />
                         <span className="text-[10px] font-black uppercase hidden lg:block">Données</span>
                       </button>
                       <button 
                         onClick={() => setSavedSessions(prev => prev.filter(sess => sess.id !== s.id))}
                         className="p-3.5 bg-white/5 text-slate-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-lg"
                         title="Supprimer l'archive"
                       >
                         <Trash2 size={18} />
                       </button>
                    </div>
                  </div>
                ))
              )}
           </div>
        </div>
      )}

      {/* Chat Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-10 custom-scrollbar bg-slate-50/10">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className="shrink-0 pt-2">
              <div className={`w-10 h-10 rounded-xl shadow-md flex items-center justify-center overflow-hidden border-2 border-white ${msg.role === 'model' ? 'synergy-bg text-white font-black text-lg' : 'bg-white text-slate-400 border-slate-100'}`}>
                {msg.role === 'model' ? 'J' : (
                  currentUser?.avatarUrl ? <img src={currentUser.avatarUrl} alt="User" className="w-full h-full object-cover" /> : <User size={18} />
                )}
              </div>
            </div>

            <div className={`max-w-[80%] rounded-[2rem] p-8 shadow-xl relative group transition-all duration-300 ${
              msg.role === 'user' ? 'synergy-bg text-white rounded-tr-none' : 'bg-white border-2 border-slate-50 border-l-4 border-l-green-600 text-slate-800 rounded-tl-none'
            }`}>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown className={msg.role === 'user' ? 'text-white' : 'text-slate-700'}>{msg.text}</ReactMarkdown>
              </div>
              
              <div className={`mt-4 pt-4 border-t ${msg.role === 'user' ? 'border-white/10' : 'border-slate-100'} flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity`}>
                  <div className="flex gap-3">
                      <button onClick={() => exportSingleMessage(idx, 'txt')} className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 ${msg.role === 'user' ? 'hover:bg-white/10 text-white/60' : 'hover:bg-slate-50 text-slate-400'}`} title="Exporter en .txt">
                          <FileText size={14} />
                          <span className="text-[9px] font-black uppercase">TXT</span>
                      </button>
                      <button onClick={() => exportSingleMessage(idx, 'audio')} className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 ${msg.role === 'user' ? 'hover:bg-white/10 text-white/60' : 'hover:bg-slate-50 text-slate-400'}`} title="Exporter en .wav">
                          <Music size={14} />
                          <span className="text-[9px] font-black uppercase">AUDIO</span>
                      </button>
                  </div>
                  <span className={`text-[8px] font-bold uppercase tracking-widest ${msg.role === 'user' ? 'text-white/40' : 'text-slate-300'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
              </div>

              {msg.role === 'model' && (
                <div className="mt-6 flex flex-col gap-4">
                  {/* Integrated Audio Center */}
                  <div className={`p-6 rounded-[2rem] border-2 flex flex-col gap-4 transition-all shadow-lg ${activePlayback?.index === idx ? 'bg-blue-50 border-blue-200' : 'bg-slate-50/50 border-slate-100'}`}>
                    <div className="flex items-center gap-4">
                        <button onClick={() => handleAudioPlayback(idx, msg.text)} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-xl active:scale-95 ${activePlayback?.index === idx ? 'bg-red-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                            {activePlayback?.index === idx ? <Square size={20} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                        </button>
                        
                        <div className="flex-1 space-y-2">
                            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden relative shadow-inner">
                                <div className="h-full synergy-bg transition-all duration-100" style={{ width: `${activePlayback?.index === idx ? (activePlayback.progress / activePlayback.duration) * 100 : 0}%` }}></div>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                <span>{activePlayback?.index === idx ? formatTime(activePlayback.progress) : '0:00'}</span>
                                <span>{activePlayback?.index === idx ? formatTime(activePlayback.duration) : 'SYNERGIE VOCALE'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Volume & Details Center */}
                    <div className="flex items-center gap-6 pt-2 border-t border-slate-200/50">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="text-blue-600 shrink-0">{getVolumeIcon()}</div>
                            <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.01" 
                                value={volume} 
                                onChange={handleVolumeChange}
                                className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>
                        <div className="px-3 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">VOIX: {VOICES.find(v => v.id === selectedVoice)?.name.split(' ')[0]}</span>
                        </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4">
            <div className={`w-10 h-10 rounded-xl synergy-bg text-white font-black text-lg flex items-center justify-center shadow-md ${isAcknowledging ? 'animate-pulse' : 'animate-bounce'}`}>J</div>
            <div className="bg-white border-2 border-slate-50 border-l-4 border-l-blue-600 rounded-[2rem] p-8 shadow-xl flex items-center gap-6 animate-in fade-in">
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-2.5 h-2.5 bg-green-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <span className="text-[11px] text-slate-500 font-black uppercase tracking-widest">{isAcknowledging ? "Coach JOSÉ a compris..." : "Analyse en cours..."}</span>
            </div>
          </div>
        )}
      </div>

      {/* Attachment Preview Area */}
      {attachment && (
        <div className="mx-8 mb-4 animate-in slide-in-from-bottom-4">
           <div className={`bg-white border-2 rounded-2xl p-4 flex items-center justify-between shadow-lg transition-all duration-500 ${dropSuccess ? 'border-green-500 bg-green-50' : 'border-blue-100'}`}>
              <div className="flex items-center gap-4">
                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${dropSuccess ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                    <FileText size={24} />
                 </div>
                 <div>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{attachment.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {dropSuccess ? 'Document attaché avec succès' : 'Fichier prêt pour analyse'}
                    </p>
                 </div>
              </div>
              <button 
                onClick={() => setAttachment(null)}
                className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                title="Supprimer la pièce jointe"
              >
                <X size={20} />
              </button>
           </div>
        </div>
      )}

      {/* Controls Area */}
      <div className="p-8 border-t bg-white/95 backdrop-blur-xl relative flex flex-col gap-6">
        {/* Dynamic Voice Recording Info Bar */}
        {isRecording && (
          <div className="absolute -top-12 left-0 right-0 px-8 animate-in slide-in-from-bottom-2">
            <div className={`text-white rounded-full py-2 px-6 shadow-xl flex items-center justify-between border-2 border-white transition-colors duration-500 ${activePlayback ? 'bg-amber-600' : 'bg-red-600'}`}>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Activity size={12} className={!activePlayback ? "animate-pulse" : ""} /> 
                  {activePlayback ? "Coach JOSÉ Parle (Micro en pause)" : "Dialogue Actif : Coach JOSÉ vous écoute..."}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex gap-1 h-3 items-center px-4 border-l border-white/20">
                  {activePlayback ? (
                      <div className="text-[9px] font-black uppercase">Lecture en cours</div>
                  ) : (
                    [1,2,3,4,5,6].map(i => (
                        <div key={i} className="w-0.5 bg-white/60 rounded-full animate-wave" style={{height: `${Math.random()*100}%`, animationDelay: `${i*0.1}s`}}></div>
                    ))
                  )}
                </div>
                <span className="text-[11px] font-black font-mono flex items-center gap-1.5">
                  <Timer size={12} /> {formatTime(recordingSeconds)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto w-full flex items-center gap-4">
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className={`p-5 transition-all shadow-inner border-2 rounded-[1.5rem] flex items-center justify-center ${attachment ? 'bg-blue-600 text-white border-blue-600 shadow-blue-200 scale-105 animate-pulse-synergy' : 'bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 border-slate-100'}`} 
              title="Joindre document"
            >
                <Paperclip size={24} />
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
            </button>
            
            <div className="relative flex-1">
              <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                placeholder={isRecording ? (activePlayback ? "Attendez la fin de la réponse..." : "Parlez naturellement...") : "Dites quelque chose ou glissez un fichier..."} 
                className={`w-full px-8 py-5 rounded-[1.5rem] focus:outline-none text-sm font-black transition-all border-4 shadow-inner ${isRecording ? 'bg-red-50 border-red-200 text-red-900 pl-16 ring-4 ring-red-100' : 'bg-slate-50 border-slate-50 focus:bg-white focus:border-blue-500'}`} 
              />
              {isRecording && !activePlayback && (
                <div className="absolute left-6 top-1/2 -translate-y-1/2 flex gap-1 items-center">
                   <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping"></div>
                </div>
              )}
              <button 
                onClick={toggleRecording} 
                className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-xl transition-all ${isRecording ? 'bg-red-600 text-white shadow-lg shadow-red-200 scale-110' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                title={isRecording ? "Désactiver le mode mains libres" : "Activer la conversation naturelle"}
              >
                {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
            </div>
            
            <button 
              onClick={() => handleSend()} 
              disabled={isLoading || (!input.trim() && !attachment)} 
              className="p-6 rounded-[1.5rem] text-white shadow-2xl active:scale-95 transition-all group synergy-bg disabled:bg-slate-300"
            >
              <Send size={26} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
        </div>

        {/* Suggested Prompts Section */}
        <div className="flex flex-wrap gap-2.5 max-w-4xl mx-auto w-full px-2 justify-center">
          {SUGGESTED_PROMPTS.map((item, i) => (
            <button key={i} onClick={() => handleSend(item.prompt)} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-600 hover:border-blue-500 hover:bg-blue-50 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50">
              {item.icon}{item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatBot;

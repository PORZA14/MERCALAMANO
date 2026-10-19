import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare,
  X,
  Send,
  RotateCcw,
  Sparkles,
  Copy,
  Check,
  Bot,
  User,
  AlertCircle,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sendChatMessage } from '../api/client';
import type { ChatbotConfig } from '../types';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  isError?: boolean;
}

interface ChatbotWidgetProps {
  config?: ChatbotConfig;
  adminAvatarUrl?: string;
}

const STORAGE_KEY_MESSAGES = 'mercam_chat_history_v1';
const STORAGE_KEY_SESSION = 'mercam_chat_session_id';

const QUICK_ACTIONS = [
  { label: '✍️ Crear un copy', prompt: 'Ayúdame a redactar un copy llamativo para redes sociales de Mercadeo' },
  { label: '🎨 Idea de diseño', prompt: 'Dame 3 ideas creativas de diseño gráfico para un carrusel o post' },
  { label: '📱 Contenido redes', prompt: '¿Qué ideas de contenido podemos publicar esta semana en Instagram y TikTok?' },
  { label: '🚀 Crear una campaña', prompt: 'Quiero estructurar una campaña para convocatoria de nuevos integrantes' },
  { label: '📅 Calendario de contenido', prompt: '¿Cómo podemos organizar un calendario de contenido mensual efectivo?' },
  { label: '💡 Idea creativa', prompt: 'Dame una dinámica creativa e interactiva para involucrar a los estudiantes en EAFIT' },
];

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({
  config,
  adminAvatarUrl,
}) => {
  const isEnabled = config ? config.enabled !== false : true;
  const title = config?.title || 'Asistente de Mercadeo';
  const subtitle = config?.subtitle || 'Partners Campus EAFIT • n8n AI';
  const defaultWelcome =
    config?.welcomeMessage ||
    '¡Hola! Soy el asistente virtual de Mercadeo de Partners Campus EAFIT. ¿En qué te puedo ayudar hoy con copies, ideas creativas, campañas o diseño?';

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize session and restore messages
  useEffect(() => {
    let savedSession = localStorage.getItem(STORAGE_KEY_SESSION);
    if (!savedSession) {
      savedSession = `session-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem(STORAGE_KEY_SESSION, savedSession);
    }
    setSessionId(savedSession);

    try {
      const savedMessages = localStorage.getItem(STORAGE_KEY_MESSAGES);
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not load chat history:', e);
    }

    // Default initial greeting if no history
    setMessages([
      {
        id: 'welcome-msg',
        sender: 'bot',
        text: defaultWelcome,
        timestamp: new Date().toLocaleTimeString('es-CO', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ]);
  }, [defaultWelcome]);

  // Persist messages in localStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages.slice(-40)));
      } catch (e) {
        console.warn('Could not save chat history:', e);
      }
    }
  }, [messages]);

  // Auto-scroll to bottom of chat
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, scrollToBottom]);

  // Handle message sending
  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(text, sessionId);
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString('es-CO', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setMessages((prev) => [...prev, botMessage]);
      if (!isOpen) {
        setHasUnread(true);
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'No se pudo comunicar con el asistente. Verifica que el workflow de n8n esté activo.';

      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'bot',
        text: `⚠️ ${errorMsg}`,
        timestamp: new Date().toLocaleTimeString('es-CO', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleResetChat = () => {
    const newSession = `session-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    localStorage.setItem(STORAGE_KEY_SESSION, newSession);
    setSessionId(newSession);

    const initial: ChatMessage[] = [
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        text: defaultWelcome,
        timestamp: new Date().toLocaleTimeString('es-CO', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ];

    setMessages(initial);
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(initial));
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isEnabled) {
    return null;
  }

  // Format assistant text with clean basic markdown elements
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      // Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      // Headers
      if (line.startsWith('# ')) {
        return (
          <h4 key={idx} className="font-extrabold text-sm text-[#30456B] mt-2 mb-1">
            {line.replace('# ', '')}
          </h4>
        );
      }
      if (line.startsWith('## ') || line.startsWith('### ')) {
        return (
          <h5 key={idx} className="font-bold text-xs text-[#4E689B] mt-1.5 mb-1">
            {line.replace(/#{2,3} /, '')}
          </h5>
        );
      }

      // Bullet points
      const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
      const isNumbered = /^\d+\.\s/.test(line.trim());

      const content = line
        .replace(/^[-*]\s+/, '')
        .replace(/^\d+\.\s+/, '');

      // Parse bold **text**
      const parts = content.split(/(\*\*.*?\*\*)/g);
      const parsedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-bold text-black">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (isBullet || isNumbered) {
        return (
          <div key={idx} className="flex items-start gap-1.5 my-0.5 pl-1 text-xs">
            <span className="text-[#FD7C5E] font-bold shrink-0 mt-0.5">•</span>
            <div className="flex-1 leading-relaxed">{parsedParts}</div>
          </div>
        );
      }

      return (
        <p key={idx} className="my-1 leading-relaxed text-xs">
          {parsedParts}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`relative flex items-center gap-2.5 px-4 py-3 rounded-full shadow-xl transition-all duration-300 font-sans ${
            isOpen
              ? 'bg-[#30456B] text-white ring-2 ring-white/50'
              : 'bg-gradient-to-r from-[#4E689B] via-[#3B527E] to-[#FD7C5E] text-white ring-4 ring-[#4E689B]/20'
          }`}
          aria-label={isOpen ? 'Cerrar asistente' : 'Abrir Asistente de Mercadeo'}
        >
          {isOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <>
              <div className="relative">
                <Bot className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FD7C5E] rounded-full ring-2 ring-white animate-pulse" />
              </div>
              <span className="hidden sm:inline-block text-xs font-bold tracking-tight">
                Asistente Mercadeo
              </span>
            </>
          )}

          {/* Unread indicator */}
          {hasUnread && !isOpen && (
            <span className="absolute -top-1.5 -left-1.5 px-2 py-0.5 rounded-full bg-[#FD7C5E] text-white text-[10px] font-extrabold shadow-sm animate-bounce">
              Nuevo
            </span>
          )}
        </motion.button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-20 right-4 sm:bottom-22 sm:right-6 z-40 w-[calc(100vw-32px)] sm:w-[420px] h-[580px] max-h-[82vh] bg-white rounded-3xl shadow-2xl border border-[#90AED1]/30 flex flex-col overflow-hidden font-sans"
          >
            {/* Window Header */}
            <div className="bg-gradient-to-r from-[#30456B] via-[#4E689B] to-[#3B527E] text-white px-4 py-3.5 flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center overflow-hidden shrink-0">
                  {adminAvatarUrl ? (
                    <img
                      src={adminAvatarUrl}
                      alt="Logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#30456B]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs sm:text-sm font-extrabold tracking-tight leading-none">
                      {title}
                    </h3>
                    <span className="px-1.5 py-0.2 rounded bg-[#FD7C5E] text-white text-[9px] font-bold uppercase tracking-wider">
                      IA
                    </span>
                  </div>
                  <p className="text-[10px] text-white/75 mt-0.5 font-medium leading-none">
                    {subtitle}
                  </p>
                </div>
              </div>

              {/* Header Action buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="Nueva conversación / Reiniciar"
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Minimizar ventana"
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conversation Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#F8FAFD]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`relative max-w-[85%] rounded-2xl p-3 text-xs shadow-2xs group ${
                      msg.sender === 'user'
                        ? 'bg-[#4E689B] text-white rounded-br-xs'
                        : msg.isError
                        ? 'bg-red-50 border border-red-200 text-red-800 rounded-bl-xs'
                        : 'bg-white border border-[#90AED1]/25 text-slate-800 rounded-bl-xs'
                    }`}
                  >
                    {msg.sender === 'bot' && !msg.isError ? (
                      <div>{renderFormattedText(msg.text)}</div>
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    )}

                    {/* Copy action for bot messages */}
                    {msg.sender === 'bot' && !msg.isError && (
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.id, msg.text)}
                        title="Copiar texto"
                        className="absolute top-2 right-2 p-1 rounded-md bg-slate-100/80 hover:bg-slate-200 text-black/50 hover:text-black opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>

                  <span className="text-[10px] text-black/40 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {/* Bot Typing Indicator */}
              {isLoading && (
                <div className="flex items-start gap-2">
                  <div className="bg-white border border-[#90AED1]/30 rounded-2xl rounded-bl-xs px-3.5 py-2.5 shadow-2xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#4E689B] animate-bounce" />
                    <span
                      className="w-2 h-2 rounded-full bg-[#FD7C5E] animate-bounce"
                      style={{ animationDelay: '0.15s' }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-[#90AED1] animate-bounce"
                      style={{ animationDelay: '0.3s' }}
                    />
                    <span className="text-[11px] text-black/50 font-medium ml-1">
                      Generando respuesta...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Chips Carousel */}
            <div className="px-3 py-2 bg-white border-t border-[#90AED1]/20 overflow-x-auto flex gap-1.5 scrollbar-none shrink-0">
              {QUICK_ACTIONS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSend(item.prompt)}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-[#90AED1]/20 text-[11px] font-semibold text-black/75 hover:text-[#4E689B] whitespace-nowrap transition-colors shrink-0 disabled:opacity-50"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Message Input Box */}
            <div className="p-3 bg-white border-t border-slate-100 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-end gap-2"
              >
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe tu mensaje o pregunta..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4E689B] focus:bg-white resize-none max-h-24 leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 rounded-2xl bg-[#4E689B] hover:bg-[#3B527E] text-white disabled:opacity-40 transition-colors shadow-xs active:scale-95 shrink-0"
                  aria-label="Enviar mensaje"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="flex items-center justify-between mt-1 px-1 text-[10px] text-black/40">
                <span>Webhook conectado a n8n</span>
                <span>Enter para enviar</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

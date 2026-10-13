import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { chatWithAI } from '../services/api';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Copy, 
  Check, 
  Trash2, 
  HelpCircle, 
  Leaf, 
  ShieldCheck, 
  ArrowRight,
  Info
} from 'lucide-react';

export default function AIAssistant() {
  const { user, isAuthenticated } = useAuth();
  const { success, error, info } = useToast();

  const [messages, setMessages] = useState(() => [
    {
      id: 'init-1',
      sender: 'ai',
      text: "Hello! I am EcoCivic AI, your municipal environmental assistant powered by Google Gemini. How can I assist you today with sustainability inquiries, civic regulations, or reporting environmental hazards?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsgId = Date.now().toString();
    const newMessages = [
      ...messages,
      {
        id: userMsgId,
        sender: 'user',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];

    setMessages(newMessages);
    setInputMessage('');
    setLoading(true);

    try {
      const result = await chatWithAI(text);
      const aiResponseText = result.response || result.message || (typeof result === 'string' ? result : JSON.stringify(result));

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: aiResponseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      error(err.message || 'AI Assistant failed to respond. Please check your backend connection.');
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: "I apologize, but I was unable to connect to the EcoCivic AI engine. Please verify that the backend is running and the Gemini API key is configured.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    success('Message copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'init-1',
        sender: 'ai',
        text: "Chat cleared. What sustainability or municipal topic would you like to explore?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    info('Conversation reset');
  };

  const promptSuggestions = [
    {
      title: "Water Contamination",
      prompt: "How should a citizen report hazardous chemical dumping near an urban canal or water body?"
    },
    {
      title: "Tree Preservation",
      prompt: "What municipal permissions and environmental penalties apply to unauthorized tree cutting on public roads?"
    },
    {
      title: "Waste Segregation",
      prompt: "What are the recommended guidelines for segregating wet, dry, and sanitary waste in residential apartments?"
    },
    {
      title: "Resolution Timeline",
      prompt: "What is the expected municipal service level agreement (SLA) for high-priority environmental hazards?"
    }
  ];

  return (
    <div className="container" style={{ paddingBottom: '60px', paddingTop: '28px', maxWidth: '1000px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-accent-light)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          color: 'var(--color-accent)',
          fontSize: '0.82rem',
          fontWeight: 700,
          marginBottom: '14px',
          textTransform: 'uppercase',
          letterSpacing: '0.04em'
        }}>
          <Sparkles size={16} />
          <span>Gemini-Powered Environmental Intelligence</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>
          EcoCivic AI <span className="gradient-text">Conversational Assistant</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.96rem', maxWidth: '640px', margin: '0 auto' }}>
          Consult with our specialized AI for community environmental guidelines, grievance framing assistance, and sustainability policy insights.
        </p>
      </div>

      {/* Main Chat Container */}
      <div className="glass-card" style={{
        display: 'flex',
        flexDirection: 'column',
        height: '620px',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Chat Top Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-surface)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: 'var(--shadow-glow-accent)'
            }}>
              <Bot size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
                EcoCivic Advisory Core
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)', display: 'inline-block' }} />
                Gemini Flash Model Connected
              </div>
            </div>
          </div>

          <button
            onClick={clearChat}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.78rem', gap: '4px' }}
            title="Clear Chat History"
          >
            <Trash2 size={14} />
            <span>Clear Chat</span>
          </button>
        </div>

        {/* Message Log */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}>
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  flexDirection: isUser ? 'row-reverse' : 'row'
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: 'var(--radius-md)',
                  background: isUser
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  flexShrink: 0,
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  {isUser ? <User size={18} /> : <Bot size={18} />}
                </div>

                {/* Message Bubble */}
                <div style={{
                  maxWidth: '75%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start'
                }}>
                  <div style={{
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-lg)',
                    borderTopRightRadius: isUser ? '4px' : 'var(--radius-lg)',
                    borderTopLeftRadius: !isUser ? '4px' : 'var(--radius-lg)',
                    background: isUser
                      ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                      : 'var(--bg-surface)',
                    color: isUser ? '#ffffff' : 'var(--text-main)',
                    border: isUser ? 'none' : '1px solid var(--border-color)',
                    fontSize: '0.94rem',
                    lineHeight: 1.55,
                    boxShadow: 'var(--shadow-sm)',
                    wordBreak: 'break-word',
                    position: 'relative'
                  }}>
                    {msg.text}
                  </div>

                  {/* Message meta & copy */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '4px',
                    fontSize: '0.72rem',
                    color: 'var(--text-subtle)'
                  }}>
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => copyToClipboard(msg.text, msg.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-subtle)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                          padding: '2px 4px'
                        }}
                        title="Copy answer"
                      >
                        {copiedId === msg.id ? <Check size={12} color="var(--color-primary)" /> : <Copy size={12} />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                flexShrink: 0
              }}>
                <Sparkles size={18} className="pulse-glow" />
              </div>
              <div style={{
                padding: '12px 18px',
                borderRadius: 'var(--radius-lg)',
                borderTopLeftRadius: '4px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>EcoCivic AI is generating insights</span>
                <span className="pulse-glow" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div style={{
          padding: '8px 20px',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-surface)',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto'
        }}>
          {promptSuggestions.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(item.prompt)}
              className="btn btn-outline btn-sm"
              style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                whiteSpace: 'nowrap',
                borderRadius: 'var(--radius-full)'
              }}
            >
              <span>{item.title}</span>
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-card-solid)'
        }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              className="form-input"
              style={{ flex: 1, padding: '12px 16px', fontSize: '0.95rem' }}
              placeholder="Ask EcoCivic AI anything about civic sustainability, waste, air quality..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !inputMessage.trim()}
              className="btn btn-primary"
              style={{ padding: '12px 20px', gap: '6px' }}
            >
              <span>Send</span>
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

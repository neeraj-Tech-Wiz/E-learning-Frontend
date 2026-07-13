// src/components/student/AiChatbot.jsx
import React, { useState, useRef, useEffect } from "react";
import { FaPaperPlane, FaRobot, FaUser, FaTimes, FaTrash, FaSpinner } from "react-icons/fa";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import "../../styles/ai-chatbot.css";
import { BASE_URL } from "../../services/api";

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
const AiChatbot = ({ profile, isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi ${profile?.name ? profile.name : "there"}! 👋 I'm your EduVerse AI tutor.\n\nAsk me anything about your studies — I'm here to help you understand concepts, solve problems, and clear your doubts!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  /* Auto-scroll to latest message */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* Focus input when opened */
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 150);
  }, [isOpen]);

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: `Chat cleared! Ask me anything, ${profile?.name ?? ""}. 😊`,
      },
    ]);
    setError("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* ── Send message to Backend API ── */
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setError("");
    setInput("");

    const userMsg = { role: "user", content: text };
    const updatedMessages = [...messages, userMsg];

    setMessages(updatedMessages);
    setLoading(true);

    try {
      // Format history for Gemini (Gemini uses "model" instead of "assistant")
      // We also map 'content' to 'content' because that's what your backend List<Map> expects
      const historyPayload = updatedMessages.map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        content: msg.content
      }));

      // Get the token from wherever you store it (localStorage is common)
      const token = localStorage.getItem("user_token");

      if (!token) {
        setError("Authentication required. Please log in to use the AI chatbot.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${BASE_URL}/api/ai/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // ADD THIS LINE TO FIX THE 403
            "Authorization": `Bearer ${token}`
          },
          // SENDING THE FULL ARRAY INSTEAD OF JUST ONE STRING
          body: JSON.stringify(historyPayload),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const reply = data.reply || "Sorry, I couldn't generate a response.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply },
      ]);
    } catch (err) {
      console.error("[AiChatbot] Error:", err);
      setError(err.message || "Failed to get a response. Please try again.");
      setMessages((prev) => prev.slice(0, -1)); // Remove the user message that failed
      setInput(text); // Put text back in box
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="acb-backdrop" onClick={onClose} />
      <div className="acb-panel">
        {/* Header */}
        <div className="acb-header">
          <div className="acb-header-left">
            <div className="acb-bot-avatar"><FaRobot /></div>
            <div className="acb-bot-info">
              <span className="acb-bot-name">EduVerse AI Tutor</span>
              <span className="acb-bot-status">
                <span className="acb-status-dot" /> Powered by Gemini AI
              </span>
            </div>
          </div>
          <div className="acb-header-actions">
            <button type="button" className="acb-icon-btn" onClick={clearChat} title="Clear chat"><FaTrash /></button>
            <button type="button" className="acb-icon-btn" onClick={onClose} title="Close AI Tutor"><FaTimes /></button>
          </div>
        </div>

        {/* Messages */}
        <div className="acb-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`acb-msg-row${msg.role === "user" ? " acb-msg-row--user" : ""}`}>
              {msg.role === "assistant" && (
                <div className="acb-avatar acb-avatar--bot"><FaRobot /></div>
              )}
              <div className={`acb-bubble ${msg.role === "user" ? "acb-bubble--user" : "acb-bubble--bot"}`}>
                <ReactMarkdown 
                  remarkPlugins={[remarkMath]} 
                  rehypePlugins={[rehypeKatex]}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
              {msg.role === "user" && (
                <div className="acb-avatar acb-avatar--user">
                  {profile?.name?.[0]?.toUpperCase() ?? <FaUser />}
                </div>
              )}
            </div>
          ))}
  
          {loading && (
            <div className="acb-msg-row">
              <div className="acb-avatar acb-avatar--bot"><FaRobot /></div>
              <div className="acb-bubble acb-bubble--bot acb-bubble--typing">
                <span className="acb-typing-dot" /><span className="acb-typing-dot" /><span className="acb-typing-dot" />
              </div>
            </div>
          )}

          {error && <div className="acb-error">⚠ {error}</div>}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="acb-input-area">
          <div className="acb-input-wrap">
            <textarea
              ref={inputRef}
              className="acb-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your studies…"
              rows={1}
              disabled={loading}
            />
            <button
              className="acb-send-btn"
              onClick={sendMessage}
              disabled={!input.trim() || loading}
            >
              {loading ? <FaSpinner className="acb-spin" /> : <FaPaperPlane />}
            </button>
          </div>
          <p className="acb-hint">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </>
  );
};

export default AiChatbot;

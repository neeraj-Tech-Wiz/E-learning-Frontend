// src/components/teacher/TeacherVideoRoom.jsx
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import {
  FaVideo, FaTrash, FaStop, FaCopy,
  FaUsers, FaPlus, FaExternalLinkAlt,
} from "react-icons/fa";
import "../../styles/video-room.css";

const TeacherVideoRoom = () => {
  const [rooms, setRooms]             = useState([]);
  const [loading, setLoading]         = useState(false);
  const [creating, setCreating]       = useState(false);
  const [title, setTitle]             = useState("");
  const [activeRoom, setActiveRoom]   = useState(null); // room currently open in iframe

  /* ── Load teacher's rooms ── */
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/video/rooms/mine");
      setRooms(res.data || []);
    } catch {
      toast.error("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  /* ── Create room ── */
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("Enter a session title"); return; }
    try {
      setCreating(true);
      const res = await api.post("/api/video/rooms", { title: title.trim() });
      setRooms(prev => [res.data, ...prev]);
      setTitle("");
      setActiveRoom(res.data);          // auto-open the new room
      toast.success("Room created! Students can now join.");
    } catch {
      toast.error("Failed to create room");
    } finally {
      setCreating(false);
    }
  };

  /* ── End / delete room ── */
  const handleDelete = async (roomId) => {
    if (!window.confirm("End this session? Students will be disconnected.")) return;
    try {
      await api.post(`/api/video/rooms/${roomId}/end`);
      setRooms(prev => prev.filter(r => r.id !== roomId));
      if (activeRoom?.id === roomId) setActiveRoom(null);
      toast.success("Session ended");
    } catch {
      toast.error("Failed to end room");
    }
  };

  /* ── Copy join link ── */
  const copyLink = (url) => {
    navigator.clipboard.writeText(url);
    toast.success("Room link copied!");
  };

  return (
    <div className="vr-root">
      <div className="vr-page-header">
        <div>
          <h2 className="vr-title">Live Video Sessions</h2>
          <p className="vr-sub">Create a session — students in your class will see it instantly</p>
        </div>
      </div>

      <div className="vr-layout">
        {/* ── LEFT: create + room list ── */}
        <div className="vr-left">

          {/* Create form */}
          <div className="vr-card">
            <div className="vr-card-header">
              <FaPlus className="vr-card-icon" />
              <h3>Start New Session</h3>
            </div>
            <form onSubmit={handleCreate} className="vr-create-form">
              <input
                className="vr-input"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Session title e.g. Chapter 5 — Photosynthesis"
                disabled={creating}
              />
              <button type="submit" className="vr-btn vr-btn--primary" disabled={creating}>
                {creating
                  ? <><div className="vr-spinner" /> Starting…</>
                  : <><FaVideo /> Start Session</>
                }
              </button>
            </form>
          </div>

          {/* Room list */}
          <div className="vr-card">
            <div className="vr-card-header">
              <FaUsers className="vr-card-icon" />
              <h3>Your Sessions</h3>
              <span className="vr-badge">{rooms.filter(r => r.active).length} active</span>
            </div>

            {loading ? (
              <div className="vr-skeleton-list">
                {[1,2].map(i => <div key={i} className="vr-skeleton-row"><div className="vr-skeleton" /></div>)}
              </div>
            ) : rooms.length === 0 ? (
              <div className="vr-empty">
                <FaVideo className="vr-empty-icon" />
                <p>No sessions yet</p>
                <span>Start a session above to begin</span>
              </div>
            ) : (
              <div className="vr-room-list">
                {rooms.map(room => (
                  <div
                    key={room.id}
                    className={`vr-room-item${activeRoom?.id === room.id ? " vr-room-item--active" : ""}${!room.active ? " vr-room-item--ended" : ""}`}
                  >
                    <div className="vr-room-info">
                      <div className="vr-room-title-row">
                        <span className={`vr-dot${room.active ? " vr-dot--live" : ""}`} />
                        <span className="vr-room-name">{room.title}</span>
                        <span className={`vr-status-badge${room.active ? " vr-status-badge--live" : " vr-status-badge--ended"}`}>
                          {room.active ? "LIVE" : "Ended"}
                        </span>
                      </div>
                      <span className="vr-room-meta">Created {new Date(room.createdAt).toLocaleString()}</span>
                    </div>

                    {room.active && (
                      <div className="vr-room-actions">
                        <button
                          className="vr-icon-btn vr-icon-btn--blue"
                          onClick={() => setActiveRoom(activeRoom?.id === room.id ? null : room)}
                          title={activeRoom?.id === room.id ? "Close preview" : "Open in window"}
                        >
                          <FaExternalLinkAlt />
                        </button>
                        <button
                          className="vr-icon-btn vr-icon-btn--gray"
                          onClick={() => copyLink(room.roomUrl)}
                          title="Copy student link"
                        >
                          <FaCopy />
                        </button>
                        <button
                          className="vr-icon-btn vr-icon-btn--red"
                          onClick={() => handleDelete(room.id)}
                          title="End session"
                        >
                          <FaStop />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Daily.co iframe ── */}
        <div className="vr-right">
          {activeRoom ? (
            <div className="vr-iframe-card">
              <div className="vr-iframe-header">
                <div className="vr-live-pill">
                  <span className="vr-live-dot" />
                  LIVE
                </div>
                <span className="vr-iframe-title">{activeRoom.title}</span>
                <button
                  className="vr-icon-btn vr-icon-btn--gray"
                  onClick={() => copyLink(activeRoom.roomUrl)}
                  title="Copy student link"
                >
                  <FaCopy /> Copy Link
                </button>
                <button
                  className="vr-close-btn"
                  onClick={() => setActiveRoom(null)}
                >
                  ✕
                </button>
              </div>
              <iframe
                src={activeRoom.roomUrl + "?minimal"}
                className="vr-iframe"
                allow="camera; microphone; fullscreen; display-capture; autoplay"
                allowFullScreen
                title="Video call"
              />
            </div>
          ) : (
            <div className="vr-placeholder">
              <div className="vr-placeholder-glow" />
              <FaVideo className="vr-placeholder-icon" />
              <p>Start or select a session</p>
              <span>Your video window will appear here</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherVideoRoom;
// src/components/student/StudentVideoRoom.jsx
import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { toast } from "react-hot-toast";
import {
  FaVideo, FaSignInAlt, FaTimes,
  FaUsers, FaSync, FaClock, FaChalkboardTeacher,
} from "react-icons/fa";
import "../styles/video-room.css";

const StudentVideoRoom = () => {
  const [rooms, setRooms]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null);
  const [countdown, setCountdown]   = useState(15);

  const fetchRooms = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await api.get("/api/video/rooms/active");
      setRooms(res.data || []);
      if (isManual) toast.success("Refreshed");
    } catch {
      // silent on auto-poll
    } finally {
      setLoading(false);
      setRefreshing(false);
      setCountdown(15);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
    const poll = setInterval(() => fetchRooms(), 15_000);
    const tick = setInterval(() => setCountdown(p => p <= 1 ? 15 : p - 1), 1_000);
    return () => { clearInterval(poll); clearInterval(tick); };
  }, [fetchRooms]);

  /* ── ACTIVE CALL ── */
  if (activeRoom) {
    return (
      <div className="svr-call-wrapper">
        <div className="svr-call-bar">
          <div className="svr-live-pill">
            <span className="svr-live-dot" /> LIVE
          </div>
          <div className="svr-call-info">
            <span className="svr-call-title">{activeRoom.title}</span>
            <span className="svr-call-teacher">
              <FaChalkboardTeacher /> {activeRoom.teacherName}
            </span>
          </div>
          <button className="svr-leave-btn" onClick={() => setActiveRoom(null)}>
            <FaTimes /> Leave
          </button>
        </div>
        <div className="svr-iframe-wrap">
          <iframe
            src={activeRoom.roomUrl + "?minimal"}
            className="svr-iframe"
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            allowFullScreen
            title="Live class"
          />
        </div>
      </div>
    );
  }

  /* ── ROOM LIST ── */
  return (
    <div className="svr-root">

      {/* Header */}
      <div className="svr-header">
        <div className="svr-header-left">
          <div className="svr-header-icon"><FaVideo /></div>
          <div>
            <h2 className="svr-title">Live Class Sessions</h2>
            <p className="svr-sub">
              {loading ? "Checking for sessions…"
                : rooms.length > 0
                  ? `${rooms.length} session${rooms.length > 1 ? "s" : ""} available`
                  : "No sessions live right now"}
            </p>
          </div>
        </div>
        <div className="svr-header-right">
          <span className="svr-countdown-pill">
            <FaClock /> {countdown}s
          </span>
          <button
            className="svr-refresh-btn"
            onClick={() => fetchRooms(true)}
            disabled={refreshing}
          >
            <FaSync className={refreshing ? "svr-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Skeletons */}
      {loading && (
        <div className="svr-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="svr-skeleton-card">
              <div className="svr-sk svr-sk--pill" />
              <div className="svr-sk svr-sk--title" />
              <div className="svr-sk svr-sk--sub" />
              <div className="svr-sk svr-sk--sub" style={{ width: "50%" }} />
              <div className="svr-sk svr-sk--btn" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && rooms.length === 0 && (
        <div className="svr-empty">
          <div className="svr-empty-glow" />
          <div className="svr-empty-icon-wrap"><FaVideo /></div>
          <h3 className="svr-empty-title">No live sessions right now</h3>
          <p className="svr-empty-body">
            Your teacher hasn't started a session yet.<br />
            Auto-refreshes every <strong>15 seconds</strong>.
          </p>
          <div className="svr-empty-pulse-row">
            {[0, 0.3, 0.6].map((d, i) => (
              <span key={i} className="svr-pulse-dot" style={{ animationDelay: `${d}s` }} />
            ))}
          </div>
        </div>
      )}

      {/* Room cards */}
      {!loading && rooms.length > 0 && (
        <div className="svr-grid">
          {rooms.map(room => (
            <div key={room.id} className="svr-room-card">
              <div className="svr-card-stripe" />
              <div className="svr-card-top">
                <div className="svr-live-pill">
                  <span className="svr-live-dot" /> LIVE
                </div>
                <FaUsers className="svr-users-icon" />
              </div>
              <h3 className="svr-room-title">{room.title}</h3>
              <div className="svr-room-meta-row">
                <span className="svr-room-teacher">
                  <FaChalkboardTeacher /> {room.teacherName}
                </span>
                <span className="svr-room-time">
                  <FaClock />
                  {new Date(room.createdAt).toLocaleTimeString([], {
                    hour: "2-digit", minute: "2-digit"
                  })}
                </span>
              </div>
              <button className="svr-join-btn" onClick={() => setActiveRoom(room)}>
                <FaSignInAlt /> Join Session
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentVideoRoom;
import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import teacherService from '../services/teacherService';
import '../../styles/UploadForm.css';

// Props: fileType ("video" or "material")
const UploadForm = ({ fileType }) => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        title: '',
        targetStandard: 10,
        subject: '',
        duration: '',
        file: null,
    });
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState(null); // { type: 'success' | 'error', text }
    const [isDragging, setIsDragging] = useState(false);

    const isVideo = fileType === 'video';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: e.target.type === 'number' ? parseInt(value) || 0 : value
        }));
    };

    const setFile = (file) => {
        if (!file) return;
        setFormData(prev => ({ ...prev, file }));
        setMessage(null);
    };

    const handleFileChange = (e) => setFile(e.target.files[0]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) setFile(file);
    }, []);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const removeFile = (e) => {
        e.stopPropagation();
        setFormData(prev => ({ ...prev, file: null }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const formatBytes = (bytes) => {
        if (!bytes) return '0 B';
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);

        if (!formData.file || !formData.title || !formData.subject) {
            setMessage({ type: 'error', text: 'Please fill all required fields and select a file.' });
            return;
        }

        setLoading(true);
        setProgress(0);
        try {
            // If teacherService.uploadFile supports an onUploadProgress callback,
            // wire it up here for a real progress bar:
            // await teacherService.uploadFile(fileType, formData, (pct) => setProgress(pct));
            const response = await teacherService.uploadFile(fileType, formData);
            setProgress(100);
            setMessage({ type: 'success', text: `Uploaded successfully! ID: ${response.id}` });
            setTimeout(() => navigate('/teacher/dashboard'), 1600);
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Upload failed. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ev-upload-page">
            <div className="ev-upload-card">
                <div className="ev-upload-header">
                    <span className={`ev-badge ${isVideo ? 'ev-badge--video' : 'ev-badge--material'}`}>
                        {isVideo ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 10l4.55-2.28A1 1 0 0121 8.62v6.76a1 1 0 01-1.45.9L15 14M5 6h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        )}
                        {isVideo ? 'Video Lecture' : 'Study Material'}
                    </span>
                    <h2>{isVideo ? 'Upload a video lecture' : 'Upload study material'}</h2>
                    <p className="ev-subtext">Share content with your students — it'll appear on their dashboard instantly.</p>
                </div>

                {message && (
                    <div className={`ev-alert ev-alert--${message.type}`}>
                        {message.type === 'success' ? '✓' : '!'} {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="ev-form">
                    <div className="ev-field">
                        <label htmlFor="title">Title</label>
                        <input
                            id="title"
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g. Introduction to Photosynthesis"
                            required
                        />
                    </div>

                    <div className="ev-field-row">
                        <div className="ev-field">
                            <label htmlFor="targetStandard">Target Standard</label>
                            <input
                                id="targetStandard"
                                type="number"
                                name="targetStandard"
                                value={formData.targetStandard}
                                onChange={handleChange}
                                min="1"
                                max="12"
                                required
                            />
                        </div>
                        <div className="ev-field">
                            <label htmlFor="subject">Subject</label>
                            <input
                                id="subject"
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                placeholder="e.g. Biology"
                                required
                            />
                        </div>
                    </div>

                    {isVideo && (
                        <div className="ev-field">
                            <label htmlFor="duration">Duration (MM:SS)</label>
                            <input
                                id="duration"
                                type="text"
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                placeholder="e.g. 45:30"
                                required
                            />
                        </div>
                    )}

                    <div className="ev-field">
                        <label>{isVideo ? 'Video file' : 'Material file'}</label>
                        <div
                            className={`ev-dropzone ${isDragging ? 'ev-dropzone--dragging' : ''} ${formData.file ? 'ev-dropzone--filled' : ''}`}
                            onClick={() => fileInputRef.current?.click()}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            role="button"
                            tabIndex={0}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                name="file"
                                onChange={handleFileChange}
                                accept={isVideo ? 'video/*' : '.pdf,.doc,.docx'}
                                hidden
                            />
                            {!formData.file ? (
                                <>
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="ev-dropzone-icon"><path d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    <p><strong>Click to upload</strong> or drag and drop</p>
                                    <span className="ev-dropzone-hint">{isVideo ? 'MP4, MOV up to 500MB' : 'PDF, DOC, DOCX up to 25MB'}</span>
                                </>
                            ) : (
                                <div className="ev-file-chip">
                                    <div className="ev-file-chip-icon">📎</div>
                                    <div className="ev-file-chip-meta">
                                        <span className="ev-file-chip-name">{formData.file.name}</span>
                                        <span className="ev-file-chip-size">{formatBytes(formData.file.size)}</span>
                                    </div>
                                    <button type="button" className="ev-file-chip-remove" onClick={removeFile} aria-label="Remove file">✕</button>
                                </div>
                            )}
                        </div>
                    </div>

                    <button type="submit" className="ev-submit-btn" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="ev-spinner" /> Uploading{progress > 0 ? ` ${progress}%` : '...'}
                            </>
                        ) : (
                            <>Submit to server</>
                        )}
                    </button>
                    {loading && (
                        <div className="ev-progress-track">
                            <div className="ev-progress-fill" style={{ width: `${progress || 8}%` }} />
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default UploadForm;
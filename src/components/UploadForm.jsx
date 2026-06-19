import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import teacherService from '../services/teacherService';

// Props: fileType ("video" or "material")
const UploadForm = ({ fileType }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        targetStandard: 10, // Default to a standard
        subject: '',
        duration: '', // Only for video
        file: null,
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const isVideo = fileType === 'video';

    // FIX: This function correctly reads the 'name' and 'value' from the input
    const handleChange = (e) => {
        const { name, value } = e.target;
        // Use 'parseInt' for number inputs to ensure correct state type, 
        // though FormData will convert it back to string for the backend.
        setFormData(prev => ({ 
            ...prev, 
            [name]: e.target.type === 'number' ? parseInt(value) || 0 : value 
        }));
    };

    const handleFileChange = (e) => {
        // The name attribute is not strictly needed on the file input, 
        // as we rely on the file object itself.
        setFormData(prev => ({ ...prev, file: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        
        // Basic validation
        if (!formData.file || !formData.title || !formData.subject) {
            setMessage('Please fill all required fields and select a file.');
            return;
        }

        setLoading(true);
        try {
            // Call the secure service
            const response = await teacherService.uploadFile(fileType, formData);
            setMessage(`Successfully uploaded ${fileType}! ID: ${response.id}`);
            // Redirect after successful upload (e.g., to the teacher's dashboard)
            setTimeout(() => navigate('/teacher/dashboard'), 2000); 
        } catch (error) {
            setMessage(`Upload failed. Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.formContainer}>
            <h2>{isVideo ? 'Upload Video Lecture' : 'Upload Study Material'}</h2>
            {message && <p style={{ color: message.includes('failed') ? 'red' : 'green' }}>{message}</p>}
            
            <form onSubmit={handleSubmit}>
                <div style={styles.fieldGroup}>
                    <label>Title:</label>
                    {/* FIX: Ensure 'name' is correct and consistent */}
                    <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                </div>

                <div style={styles.fieldGroup}>
                    <label>Target Standard (Grade):</label>
                    {/* FIX: Ensure 'name' is correct and the value is bound */}
                    <input type="number" name="targetStandard" value={formData.targetStandard} onChange={handleChange} required min="1" max="12" />
                </div>

                <div style={styles.fieldGroup}>
                    <label>Subject:</label>
                    {/* FIX: Ensure 'name' is correct and the value is bound */}
                    <input type="text" name="subject" value={formData.subject} onChange={handleChange} required />
                </div>

                {/* Video-specific field */}
                {isVideo && (
                    <div style={styles.fieldGroup}>
                        <label>Duration (MM:SS):</label>
                        <input type="text" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g., 45:30" required />
                    </div>
                )}

                <div style={styles.fieldGroup}>
                    <label>{isVideo ? 'Video File (MP4, etc.)' : 'Material File (PDF, DOCX)'}:</label>
                    {/* FIX: The name attribute is needed for the FormData key */}
                    <input type="file" name="file" onChange={handleFileChange} required />
                </div>
                
                <button type="submit" disabled={loading}>
                    {loading ? 'Uploading...' : 'Submit to Server'}
                </button>
            </form>
        </div>
    );
};

const styles = {
    formContainer: { padding: '20px', border: '1px solid #ddd', borderRadius: '8px' },
    fieldGroup: { marginBottom: '15px', display: 'flex', flexDirection: 'column' },
};

export default UploadForm;
// src/services/contentService.js

import api from './api'; // Secure Axios instance

// --- API Endpoint Constants (prefixed with /api for backend mapping) ---
const LECTURE_URL = '/api/lectures/student/content';
const MATERIAL_URL = '/api/materials/student/content';

/**
 * Fetches authorized lectures and materials for a student.
 * The backend determines the student from the JWT token.
 */
const getStudentContent = async (subject = '') => {
    const lectureResponse = await api.get(`${LECTURE_URL}?subject=${subject}`);
    const materialResponse = await api.get(`${MATERIAL_URL}?subject=${subject}`);

    return {
        lectures: lectureResponse.data,
        materials: materialResponse.data,
    };
};

/**
 * Fetches the raw progress status records for the logged-in student.
 * API: GET /api/progress/status
 */
const getProgressStatus = async () => {
    const response = await api.get('/api/progress/status');
    return response.data; // Returns [{contentId, contentType, isCompleted, title, subject}]
};

/**
 * Marks a specific content item (lecture/material) as complete.
 * API: POST /api/progress/complete?contentId=1&contentType=LECTURE
 */
const markComplete = async (contentId, contentType) => {
    const response = await api.post('/api/progress/complete', null, {
        params: {
            contentId,
            contentType,
        },
    });
    return response.data;
};

/**
 * Fetches quiz questions for a given test ID.
 * API: GET /api/questions/test/{testId}
 */
const getTestQuestions = async (testId) => {
    const response = await api.get(`/api/questions/test/${testId}`);
    return response.data; // Returns list of QuestionDTOs
};

/**
 * Submits the final test result (nested JSON body).
 * API: POST /api/results
 */
const submitTestResult = async (submissionData) => {
    const response = await api.post('/api/results', submissionData);
    return response.data; // Returns TestResultResponseDTO (ID, Status)
};

/**
 * Combines content lists with progress data for the student dashboard.
 */
const getStudentContentAndProgress = async (subject = '') => {
    // Fetch content + progress together
    const [contentData, progressData] = await Promise.all([
        getStudentContent(subject),
        getProgressStatus()
    ]);

    // Create a map from progress data: "LECTURE_3" → true
    const progressMap = {};
    progressData.forEach(item => {
        progressMap[`${item.contentType}_${item.contentId}`] = item.isCompleted;
    });

    // Merge helper
    const mergeProgress = (items, type) =>
        items.map(i => ({
            ...i,
            isCompleted: !!progressMap[`${type}_${i.id}`]
        }));

    const normalizeCompletionFlag = (item) => {
    // Normalize 'completed' to 'isCompleted'
        if (item.completed !== undefined && item.isCompleted === undefined) {
            item.isCompleted = item.completed;
        }
    return item;
    };

   return {
        lectures: mergeProgress(contentData.lectures.map(normalizeCompletionFlag), 'LECTURE'),
        materials: mergeProgress(contentData.materials.map(normalizeCompletionFlag), 'MATERIAL')
    };

};


// Export grouped service
const contentService = {
    getStudentContent,
    getProgressStatus,
    markComplete,
    getStudentContentAndProgress,
    getTestQuestions,
    submitTestResult,
};

export default contentService;

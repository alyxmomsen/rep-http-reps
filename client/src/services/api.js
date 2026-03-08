import axios from 'axios';

const API = axios.create({
    baseURL: '', // Пустой, так запросы идут на тот же хост
});

// Загрузка формы с видео
export const uploadVideo = async (formData) => {
    try {
        const response = await API.post('/api/handle-form', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
};

// Получение списка видео
export const getVideos = async () => {
    try {
        const response = await API.get('/api/videos');
        return response.data;
    } catch (error) {
        console.error('Get videos error:', error);
        throw error;
    }
};

// Получение URL для стриминга видео
export const getVideoUrl = (filename) => {
    return `/video/${filename}`;
};
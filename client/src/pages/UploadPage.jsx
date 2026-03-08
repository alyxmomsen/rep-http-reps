import React, { useState } from 'react';
import { uploadVideo } from '../services/api';

function UploadPage() {
    const [formData, setFormData] = useState({
        groupId: 'default',
        tableName: 'playlist-1',
        title: '',
        description: '',
        videoQuality: 'video-min' // min, mid, fulhd
    });
    
    const [videoFile, setVideoFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [error, setError] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        setVideoFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!videoFile) {
            setError('Пожалуйста, выберите видео файл');
            return;
        }

        setUploading(true);
        setError(null);
        setUploadResult(null);

        try {
            // Создаем FormData в формате, который понимает твой бэкенд
            const data = new FormData();
            
            // Имя поля формируется по правилу: groupId.tableName.columnName.dataType
            // Для текстовых полей
            data.append(
                `${formData.groupId}.${formData.tableName}.title.string`,
                formData.title
            );
            data.append(
                `${formData.groupId}.${formData.tableName}.description.string`,
                formData.description
            );
            
            // Для видео файла
            data.append(
                `${formData.groupId}.${formData.tableName}.${formData.videoQuality}`,
                videoFile
            );

            const result = await uploadVideo(data);
            setUploadResult(result);
            
            // Очищаем форму после успешной загрузки
            setFormData({
                groupId: 'default',
                tableName: 'playlist-1',
                title: '',
                description: '',
                videoQuality: 'video-min'
            });
            setVideoFile(null);
            
            // Сброс файлового инпута
            e.target.querySelector('input[type="file"]').value = '';
            
        } catch (err) {
            setError('Ошибка при загрузке видео');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex--col flex--gap-2">
            <h2 style={{ color: 'bisque', margin: 0 }}>Загрузить новое видео</h2>
            
            <form onSubmit={handleSubmit} className="flex flex--col flex--gap-2">
                {/* Название видео */}
                <div className="form-element flex flex--col">
                    <label style={{ color: 'bisque', marginBottom: '4px' }}>
                        Название видео *
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        style={{
                            padding: '9px',
                            borderRadius: '4px',
                            border: '1px solid wheat',
                            backgroundColor: '#444464',
                            color: 'bisque'
                        }}
                    />
                </div>

                {/* Описание */}
                <div className="form-element flex flex--col">
                    <label style={{ color: 'bisque', marginBottom: '4px' }}>
                        Описание
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                        style={{
                            padding: '9px',
                            borderRadius: '4px',
                            border: '1px solid wheat',
                            backgroundColor: '#444464',
                            color: 'bisque',
                            resize: 'vertical'
                        }}
                    />
                </div>

                {/* Качество видео */}
                <div className="form-element flex flex--col">
                    <label style={{ color: 'bisque', marginBottom: '4px' }}>
                        Качество видео
                    </label>
                    <select
                        name="videoQuality"
                        value={formData.videoQuality}
                        onChange={handleInputChange}
                        style={{
                            padding: '9px',
                            borderRadius: '4px',
                            border: '1px solid wheat',
                            backgroundColor: '#444464',
                            color: 'bisque'
                        }}
                    >
                        <option value="video-min">Низкое (min)</option>
                        <option value="video-mid">Среднее (mid)</option>
                        <option value="video-fulhd">Высокое (fulhd)</option>
                    </select>
                </div>

                {/* Видео файл */}
                <div className="form-element flex flex--col">
                    <label style={{ color: 'bisque', marginBottom: '4px' }}>
                        Видео файл *
                    </label>
                    <input
                        type="file"
                        accept="video/*"
                        onChange={handleFileChange}
                        required
                        style={{
                            padding: '9px',
                            borderRadius: '4px',
                            border: '1px solid wheat',
                            backgroundColor: '#444464',
                            color: 'bisque'
                        }}
                    />
                    {videoFile && (
                        <small style={{ color: 'wheat', marginTop: '4px' }}>
                            Выбран: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                        </small>
                    )}
                </div>

                {/* Кнопка отправки */}
                <button
                    type="submit"
                    disabled={uploading}
                    className="form-element"
                    style={{
                        backgroundColor: uploading ? '#666' : '#273a41',
                        color: 'bisque',
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        padding: '12px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        border: 'none'
                    }}
                >
                    {uploading ? 'Загрузка...' : 'Загрузить видео'}
                </button>

                {/* Сообщение об ошибке */}
                {error && (
                    <div className="form-element" style={{ backgroundColor: '#ff6b6b33', color: '#ffb3b3' }}>
                        {error}
                    </div>
                )}

                {/* Результат загрузки */}
                {uploadResult && (
                    <div className="form-element" style={{ backgroundColor: '#4CAF5033', color: '#b3ffb3' }}>
                        <h4 style={{ margin: '0 0 9px 0' }}>✓ Видео успешно загружено!</h4>
                        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                            {JSON.stringify(uploadResult, null, 2)}
                        </pre>
                    </div>
                )}
            </form>
        </div>
    );
}

export default UploadPage;
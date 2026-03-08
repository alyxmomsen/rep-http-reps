import React, { useState, useEffect } from 'react';
import { getVideos, getVideoUrl } from '../services/api';

function PlaylistPage() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedVideo, setSelectedVideo] = useState(null);

    useEffect(() => {
        loadVideos();
    }, []);

    const loadVideos = async () => {
        try {
            setLoading(true);
            const data = await getVideos();
            setVideos(data);
            setError(null);
        } catch (err) {
            setError('Не удалось загрузить список видео');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleVideoSelect = (video) => {
        setSelectedVideo(video);
    };

    if (loading) {
        return (
            <div className="flex flex--jtf-ctr flex--align-ctr" style={{ minHeight: '300px' }}>
                <div className="form-element" style={{ color: 'bisque' }}>
                    Загрузка видео...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex--jtf-ctr flex--align-ctr" style={{ minHeight: '300px' }}>
                <div className="form-element" style={{ color: '#ffb3b3' }}>
                    {error}
                    <button 
                        onClick={loadVideos}
                        className="form-element"
                        style={{ 
                            marginLeft: '9px', 
                            backgroundColor: '#273a41', 
                            color: 'bisque',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Повторить
                    </button>
                </div>
            </div>
        );
    }

    if (videos.length === 0) {
        return (
            <div className="flex flex--jtf-ctr flex--align-ctr" style={{ minHeight: '300px' }}>
                <div className="form-element" style={{ color: 'bisque' }}>
                    📭 Видео пока не загружены. Перейдите на страницу загрузки.
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex--col flex--gap-2">
            <h2 style={{ color: 'bisque', margin: 0 }}>Видео плейлист</h2>
            
            <div className="flex" style={{ gap: '18px' }}>
                {/* Список видео */}
                <div className="flex flex--col flex--gap-1" style={{ flex: '1', minWidth: '250px' }}>
                    {videos.map((video) => (
                        <div
                            key={video.id}
                            onClick={() => handleVideoSelect(video)}
                            className="form-element"
                            style={{
                                cursor: 'pointer',
                                backgroundColor: selectedVideo?.id === video.id ? '#273a41' : '#444464',
                                transition: 'background-color 0.2s'
                            }}
                        >
                            <div style={{ fontWeight: 'bold', color: 'bisque' }}>
                                {video.title || 'Без названия'}
                            </div>
                            {video.description && (
                                <div style={{ fontSize: '12px', color: 'wheat', marginTop: '4px' }}>
                                    {video.description}
                                </div>
                            )}
                            <div style={{ fontSize: '11px', color: '#999', marginTop: '8px' }}>
                                Доступные качества:{' '}
                                {Object.keys(video.files || {}).map(q => {
                                    const qualityMap = {
                                        'video-min': 'Низкое',
                                        'video-mid': 'Среднее',
                                        'video-fulhd': 'Высокое'
                                    };
                                    return qualityMap[q] || q;
                                }).join(', ')}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Плеер */}
                <div className="form-element" style={{ flex: '2', minHeight: '400px' }}>
                    {selectedVideo ? (
                        <div className="flex flex--col flex--gap-1">
                            <h3 style={{ color: 'bisque', margin: '0 0 9px 0' }}>
                                {selectedVideo.title || 'Без названия'}
                            </h3>
                            
                            {/* Выбор качества */}
                            {selectedVideo.files && Object.keys(selectedVideo.files).length > 0 && (
                                <div className="flex flex--gap-1" style={{ marginBottom: '9px' }}>
                                    {Object.keys(selectedVideo.files).map((quality) => {
                                        const filename = selectedVideo.files[quality]?.filesistemFilename;
                                        if (!filename) return null;
                                        
                                        const qualityNames = {
                                            'video-min': 'Низкое',
                                            'video-mid': 'Среднее',
                                            'video-fulhd': 'Высокое'
                                        };
                                        
                                        return (
                                            <button
                                                key={quality}
                                                onClick={() => {
                                                    const videoElement = document.getElementById('video-player');
                                                    if (videoElement) {
                                                        videoElement.src = getVideoUrl(filename);
                                                        videoElement.load();
                                                        videoElement.play();
                                                    }
                                                }}
                                                className="form-element"
                                                style={{
                                                    padding: '4px 9px',
                                                    backgroundColor: '#273a41',
                                                    color: 'bisque',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                {qualityNames[quality] || quality}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                            
                            {/* Видео плеер */}
                            <video
                                id="video-player"
                                controls
                                style={{
                                    width: '100%',
                                    maxHeight: '400px',
                                    backgroundColor: '#000'
                                }}
                            >
                                <source src="" type="video/mp4" />
                                Ваш браузер не поддерживает видео тег.
                            </video>
                            
                            {/* Описание видео */}
                            {selectedVideo.description && (
                                <div style={{ color: 'wheat', marginTop: '9px', padding: '9px', backgroundColor: '#444464' }}>
                                    {selectedVideo.description}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex--jtf-ctr flex--align-ctr" style={{ height: '100%', minHeight: '300px' }}>
                            <div style={{ color: 'wheat' }}>
                                Выберите видео из списка слева
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PlaylistPage;
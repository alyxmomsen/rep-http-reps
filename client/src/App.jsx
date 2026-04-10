import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import PlaylistPage from './pages/PlaylistPage';
import AnotherOnePage from './pages/AnotherOnePage';

function App() {
    return (
        <Router>
            <div className="wrapper--main">
                <nav
                    className="flex flex--gap-2"
                    style={{
                        padding: '9px',
                        marginBottom: '18px',
                        borderBottom: '1px solid wheat',
                    }}
                >
                    <Link
                        to="/"
                        style={{
                            color: 'bisque',
                            textDecoration: 'none',
                            padding: '9px',
                        }}
                    >
                        🎬 Загрузить видео
                    </Link>
                    <Link
                        to="/playlist"
                        style={{
                            color: 'bisque',
                            textDecoration: 'none',
                            padding: '9px',
                        }}
                    >
                        📋 Плейлист
                    </Link>
                    <Link to="/another-one-page">anotherOnePage</Link>
                </nav>

                <Routes>
                    <Route path="/" element={<UploadPage />} />
                    <Route path="/playlist" element={<PlaylistPage />} />
                    {/* <Route path="/another-one-page" element={<AnotherOnePage />} /> */}
                </Routes>
            </div>
        </Router>
    );
}

export default App;

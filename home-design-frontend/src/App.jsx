import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AllProjectsPage from './pages/AllProjectsPage';
import CanvasPage from './pages/CanvasPage'; // 1. Import trang mới

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AllProjectsPage />} />
        {/* 2. Thêm route cho trang canvas */}
        <Route path="/canvas" element={<CanvasPage />} /> 
      </Routes>
    </Router>
  );
}

export default App;
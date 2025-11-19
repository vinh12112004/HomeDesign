import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AllProjectsPage from "./pages/AllProjectsPage";
import CanvasPage from "./pages/CanvasPage";
import ObjScene from "./components/ObjScene";
import { ConfigProvider, message } from "antd";
import "antd/dist/reset.css";
import RoomDesigner2D from "./components/2D/RoomDesigner2D";
// Cấu hình message global
message.config({
    top: 100,
    duration: 2,
    maxCount: 3,
});

function App() {
    return (
        <ConfigProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<AllProjectsPage />} />
                    <Route path="/canvas" element={<CanvasPage />} />
                    <Route path="/test" element={<ObjScene />} />
                    <Route path="/test2d" element={<RoomDesigner2D />} />
                    <Route path="*" element={<div>404 Not Found</div>} />
                </Routes>
            </Router>
        </ConfigProvider>
    );
}

export default App;

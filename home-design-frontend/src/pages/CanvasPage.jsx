import { useState, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button, Empty } from 'antd';
import RoomScene from '../components/canvas/RoomScene';
import CanvasHeader from '../components/canvas/CanvasHeader';
import SideMenu from '../components/canvas/SideMenu';
import ViewModeToggle from '../components/canvas/ViewModeToggle';

export default function CanvasPage() {
  const location = useLocation();
  const { project } = location.state || {};
  const controlsRef = useRef();
  const [viewMode, setViewMode] = useState('free');

  const toggleViewMode = () => {
    setViewMode(prev => (prev === 'fixed' ? 'free' : 'fixed'));
  };

  if (!project) {
    return (
      <div style={{ textAlign: 'center', marginTop: 100 }}>
        <Empty description="No project data found. Please open a project from the list.">
          <Link to="/">
            <Button type="primary">Back to All Projects</Button>
          </Link>
        </Empty>
      </div>
    );
  }

  const { name, width, length, height } = project;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',        // chiếm full màn hình
        overflow: 'hidden',     // không cuộn
      }}
    >
      {/* Header cố định trên cùng */}
      <div style={{ flexShrink: 0 }}>
        <CanvasHeader projectName={name} />
      </div>

      {/* Side menu bar ngay dưới header (chiều cao cố định) */}
      <div style={{ flexShrink: 0 }}>
        <SideMenu />
      </div>

      {/* Canvas chiếm phần còn lại */}
      <div
        style={{
          flexGrow: 1,
          position: 'relative',
          overflow: 'hidden',
          background: '#000',
        }}
      >
        <RoomScene
          width={width}
          length={length}
          height={height}
          controlsRef={controlsRef}
          viewMode={viewMode}
        />

        {/* Overlay components (ví dụ: nút view mode) — không che canvas interactive */}
        <div style={{ pointerEvents: 'none', position: 'absolute', inset: 0 }}>
          <div style={{ pointerEvents: 'auto' }}>
            <ViewModeToggle mode={viewMode} onToggle={toggleViewMode} />
          </div>
        </div>
      </div>
    </div>
  );
}

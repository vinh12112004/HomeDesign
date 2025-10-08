import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button, Empty } from 'antd';
import RoomScene from '../components/canvas/RoomScene';

export default function CanvasPage() {
  const location = useLocation();
  const { project } = location.state || {}; // Lấy project từ state được truyền qua

  // Nếu không có project (ví dụ: người dùng vào thẳng URL)
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
    <div style={{ padding: 24 }}>
      <h1>Canvas for: {name}</h1>
      <p>
        Initializing 3D scene with dimensions:
        <strong> Width:</strong> {width}m,
        <strong> Length:</strong> {length}m,
        <strong> Height:</strong> {height}m.
      </p>
      <div style={{ flex: 1, width: '100%', height: '70vh'}}>
        <RoomScene width={width} length={length} height={height} />
      </div>
      <Link to="/">
        <Button style={{ marginTop: 24 }}>Back to All Projects</Button>
      </Link>
    </div>
  );
}
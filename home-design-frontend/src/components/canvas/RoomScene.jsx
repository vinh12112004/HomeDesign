import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Plane } from '@react-three/drei';

function Room({ width, length, height }) {
  const wallThickness = 0.1;

  return (
    <>
      {/* Sàn nhà */}
      <Plane args={[width, length]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#f0f0f0" />
      </Plane>

      {/* Tường sau */}
      <Box args={[width, height, wallThickness]} position={[0, height / 2, -length / 2]}>
        <meshStandardMaterial color="lightblue" />
      </Box>

      {/* Tường trái */}
      <Box args={[length, height, wallThickness]} rotation={[0, Math.PI / 2, 0]} position={[-width / 2, height / 2, 0]}>
        <meshStandardMaterial color="lightgreen" />
      </Box>

      {/* Tường phải */}
      <Box args={[length, height, wallThickness]} rotation={[0, Math.PI / 2, 0]} position={[width / 2, height / 2, 0]}>
        <meshStandardMaterial color="lightpink" />
      </Box>
    </>
  );
}

export default function RoomScene({ width, length, height }) {
  return (
    <Canvas
      camera={{ position: [width, height * 1.5, length * 1.5], fov: 50 }}
      style={{ background: '#e0e0e0' }}
    >
      {/* Ánh sáng môi trường */}
      <ambientLight intensity={0.5} />
      {/* Ánh sáng từ một hướng, tạo bóng */}
      <directionalLight position={[10, 15, 5]} intensity={1} />
      
      <Room width={width} length={length} height={height} />

      {/* Điều khiển camera: cho phép xoay, zoom, di chuyển */}
      <OrbitControls />

      {/* Lưới tọa độ để dễ hình dung */}
      <gridHelper args={[100, 100]} />
    </Canvas>
  );
}
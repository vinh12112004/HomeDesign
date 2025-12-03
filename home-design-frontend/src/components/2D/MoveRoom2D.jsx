import React, { useRef, useEffect, useState } from "react";
import { Layout, Card, Button, Space, Typography } from "antd";
import { usePanZoom } from "../../hooks/usePanZoom";
import CanvasRenderer from "./CanvasRenderer.jsx";
import {
    doRoomsOverlap,
    calculateValidZones,
} from "../../utils/roomCalculations";
import {
    findZoneContainingPoint,
    screenToWorld,
    constrainToZone, // <--- THÊM IMPORT NÀY
} from "../../utils/roomHelpers";

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

// Mock data từ file JSON
const mockObjects = [
    {
        id: "76939430-9168-4d9f-b81f-016e3e1a04e0",
        type: "Wall",
        positionJson: '{"x":2.5,"y":2.5,"z":0}',
        metadataJson:
            '{"geometry":"box","sizeX":0.1,"sizeY":5,"sizeZ":5,"color":"#F8F8FF"}',
        roomId: "35bb7159-4bb6-43f4-8f5b-477a3cab316d",
    },
    {
        id: "27b41fd6-e2ba-405e-99e0-1fda6f355150",
        type: "Floor",
        positionJson: '{"x":4.5,"y":0,"z":-4}',
        metadataJson:
            '{"geometry":"plane","width":4,"length":5,"texture":"/textures/floor.png","color":"#F8F8FF"}',
        roomId: "36ecc9fc-abad-48c1-b565-e653e7e0e759",
    },
    {
        id: "cea03cfd-282c-4765-beba-9c2809893967",
        type: "Floor",
        positionJson: '{"x":0,"y":0,"z":0}',
        metadataJson:
            '{"geometry":"plane","width":5,"length":5,"texture":"/textures/floor.png","color":"#F8F8FF"}',
        roomId: "35bb7159-4bb6-43f4-8f5b-477a3cab316d",
    },
];

export default function MoveRoom2D() {
    const canvasRef = useRef(null);

    // Core settings
    const [scale, setScale] = useState(80); // 1 meter = 80 pixels
    const [offsetX, setOffsetX] = useState(600);
    const [offsetY, setOffsetY] = useState(400);

    // Room data
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    // Status
    const [status, setStatus] = useState(
        "Click vào phòng để chọn và di chuyển"
    );

    // Valid zones
    const [validZones, setValidZones] = useState([]);
    const [showZones, setShowZones] = useState(true);

    // Use the custom usePanZoom hook
    const {
        isPanning,
        isSpacePressed,
        handleWheel,
        handleMouseDown: panZoomMouseDown,
        handleMouseMove: panZoomMouseMove,
        handleMouseUp: panZoomMouseUp,
    } = usePanZoom(
        canvasRef,
        scale,
        offsetX,
        offsetY,
        setScale,
        setOffsetX,
        setOffsetY
    );

    // Load rooms from mock data
    useEffect(() => {
        const floorObjects = mockObjects
            .filter((obj) => obj.type === "Floor")
            .map((floor) => {
                const pos = JSON.parse(floor.positionJson);
                const meta = JSON.parse(floor.metadataJson);
                return {
                    id: floor.id,
                    roomId: floor.roomId,
                    x: pos.x,
                    z: pos.z,
                    width: meta.width,
                    length: meta.length,
                    originalX: pos.x,
                    originalZ: pos.z,
                };
            });
        setRooms(floorObjects);
    }, []);

    // Calculate valid zones when dragging
    useEffect(() => {
        if (isDragging && selectedRoom) {
            const currentRoom = rooms.find((r) => r.id === selectedRoom);
            if (!currentRoom) return;

            // Loại trừ phòng đang di chuyển khỏi danh sách phòng để tính toán vùng hợp lệ
            const otherRooms = rooms.filter((r) => r.id !== selectedRoom);
            const zones = calculateValidZones(
                otherRooms,
                [], // Không có addedRooms
                currentRoom.width,
                currentRoom.length
            );
            setValidZones(zones);
            setShowZones(true);
        } else {
            setValidZones([]);
            setShowZones(false);
        }
    }, [isDragging, selectedRoom, rooms]);

    // **Tái sử dụng findRoomAtPoint**
    const findRoomAtPoint = (worldX, worldZ) => {
        return rooms.find((room) => {
            // Giả định tâm phòng là (room.x, room.z)
            const halfWidth = room.width / 2;
            const halfLength = room.length / 2;
            return (
                worldX >= room.x - halfWidth &&
                worldX <= room.x + halfWidth &&
                worldZ >= room.z - halfLength &&
                worldZ <= room.z + halfLength
            );
        });
    };

    const handleMouseDown = (e) => {
        const canvas = canvasRef.current;

        if (isSpacePressed) {
            panZoomMouseDown(e);
            canvas.style.cursor = "grabbing";
            return;
        }

        const worldPos = screenToWorld(
            canvasRef.current,
            e.clientX,
            e.clientY,
            offsetX,
            offsetY,
            scale
        );

        const clickedRoom = findRoomAtPoint(worldPos.x, worldPos.z);

        if (clickedRoom) {
            setSelectedRoom(clickedRoom.id);
            setIsDragging(true);
            canvas.style.cursor = "grabbing";
            setStatus(`Đang di chuyển phòng (Room ID: ${clickedRoom.roomId})`);
        } else {
            setSelectedRoom(null);
            setStatus("Click vào phòng để chọn và di chuyển");
        }
    };

    const handleMouseMove = (e) => {
        const canvas = canvasRef.current;

        // Panning
        if (isPanning) {
            panZoomMouseMove(e);
            return;
        }

        const worldPos = screenToWorld(
            canvasRef.current,
            e.clientX,
            e.clientY,
            offsetX,
            offsetY,
            scale
        );

        if (isDragging && selectedRoom) {
            const currentRoom = rooms.find((r) => r.id === selectedRoom);
            if (!currentRoom) return;

            // 1. Tìm zone chứa điểm
            const zone = findZoneContainingPoint(
                validZones,
                worldPos.x,
                worldPos.z
            );

            if (zone) {
                // 2. SỬ DỤNG constrainToZone ĐỂ ĐỒNG BỘ LOGIC VỚI ROOMDESIGNER
                // Hàm này sẽ tự xử lý logic biên (side), minX, maxX... một cách chính xác
                const constrainedPos = constrainToZone(
                    zone,
                    worldPos.x,
                    worldPos.z,
                    currentRoom.width,
                    currentRoom.length
                );

                const previewRoom = {
                    x: constrainedPos.x,
                    z: constrainedPos.z,
                    width: currentRoom.width,
                    length: currentRoom.length,
                };

                // 3. Check overlap
                const otherRooms = rooms.filter((r) => r.id !== selectedRoom);
                const wouldOverlap = otherRooms.some((r) =>
                    doRoomsOverlap(previewRoom, r)
                );

                if (!wouldOverlap) {
                    setRooms((prevRooms) =>
                        prevRooms.map((r) =>
                            r.id === selectedRoom
                                ? {
                                      ...r,
                                      x: constrainedPos.x,
                                      z: constrainedPos.z,
                                  }
                                : r
                        )
                    );
                }
            }
        } else {
            // Update cursor
            const hoveredRoom = findRoomAtPoint(worldPos.x, worldPos.z);
            if (isSpacePressed) canvas.style.cursor = "grab";
            else if (hoveredRoom) canvas.style.cursor = "pointer";
            else canvas.style.cursor = "default";
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        panZoomMouseUp();

        const canvas = canvasRef.current;
        if (canvas) {
            if (isSpacePressed) {
                canvas.style.cursor = "grab";
            } else {
                canvas.style.cursor = "default";
            }
        }

        if (selectedRoom) {
            const room = rooms.find((r) => r.id === selectedRoom);
            if (room) {
                setStatus(
                    `Đã di chuyển phòng (Room ID: ${
                        room.roomId
                    }) đến (${room.x.toFixed(2)}, ${room.z.toFixed(2)})`
                );
            }
        }
    };

    const handleSave = () => {
        if (!selectedRoom) {
            console.log("Chưa chọn phòng nào");
            setStatus("❌ Vui lòng chọn một phòng trước khi lưu");
            return;
        }

        const room = rooms.find((r) => r.id === selectedRoom);
        if (room) {
            console.log("Room ID:", room.roomId);
            console.log("Object ID:", room.id);
            console.log("New Position:", { x: room.x, z: room.z });
            console.log("Original Position:", {
                x: room.originalX,
                z: room.originalZ,
            });
            setStatus(`✅ Đã log thông tin phòng (Room ID: ${room.roomId})`);
        }
    };

    const handleReset = () => {
        setRooms((prevRooms) =>
            prevRooms.map((room) => ({
                ...room,
                x: room.originalX,
                z: room.originalZ,
            }))
        );
        setSelectedRoom(null);
        setStatus("Đã reset tất cả phòng về vị trí ban đầu");
    };

    const handleResetView = () => {
        setScale(80);
        setOffsetX(600);
        setOffsetY(400);
        setStatus("Đã reset view về mặc định");
    };

    return (
        <Layout style={{ height: "100vh", background: "#f0f2f5" }}>
            <Sider width={300} style={{ background: "white", padding: 20 }}>
                <Title level={4}>Di Chuyển Phòng 2D</Title>

                <Card style={{ marginBottom: 16 }}>
                    <Space direction="vertical" style={{ width: "100%" }}>
                        <Text strong>Số phòng: {rooms.length}</Text>
                        {selectedRoom && (
                            <>
                                <Text strong style={{ color: "#ff9800" }}>
                                    Phòng đang chọn:
                                </Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    {
                                        rooms.find((r) => r.id === selectedRoom)
                                            ?.roomId
                                    }
                                </Text>
                            </>
                        )}
                    </Space>
                </Card>

                <Card title="Hướng dẫn" style={{ marginBottom: 16 }}>
                    <Space direction="vertical" size="small">
                        <Text>🖱️ Click vào phòng để chọn</Text>
                        <Text>🖱️ Kéo thả để di chuyển phòng</Text>
                        <Text>🟢 Vùng xanh lá: nơi có thể đặt phòng</Text>
                        <Text>⌨️ Giữ SPACE + kéo để pan view</Text>
                        <Text>🔍 Scroll để zoom in/out</Text>
                    </Space>
                </Card>

                <Space
                    direction="vertical"
                    style={{ width: "100%" }}
                    size="middle"
                >
                    <Button
                        type="primary"
                        block
                        onClick={handleSave}
                        disabled={!selectedRoom}
                    >
                        💾 Save (Log Room ID)
                    </Button>
                    <Button block onClick={handleReset}>
                        🔄 Reset Vị Trí
                    </Button>
                    <Button block onClick={handleResetView}>
                        🔍 Reset View
                    </Button>
                </Space>
            </Sider>

            <Layout>
                <Content
                    style={{
                        padding: 20,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <canvas
                        ref={canvasRef}
                        width={1400}
                        height={800}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onWheel={handleWheel}
                        style={{
                            background: "white",
                            borderRadius: 8,
                            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                            cursor: isSpacePressed ? "grab" : "default",
                            maxWidth: "100%",
                            maxHeight: "calc(100vh - 120px)",
                        }}
                    />

                    {/* Reuse CanvasRenderer component */}
                    <CanvasRenderer
                        canvasRef={canvasRef}
                        existingRooms={rooms}
                        addedRooms={[]}
                        newRoomCenter={null}
                        roomWidth={0}
                        roomLength={0}
                        isDragging={isDragging}
                        scale={scale}
                        offsetX={offsetX}
                        offsetY={offsetY}
                        validZones={validZones}
                        showZones={showZones}
                        selectedRoomId={selectedRoom}
                        mode="move"
                    />

                    <Card
                        style={{
                            marginTop: 16,
                            textAlign: "center",
                            minWidth: 500,
                            maxWidth: "90%",
                        }}
                    >
                        {status}
                    </Card>
                </Content>
            </Layout>
        </Layout>
    );
}

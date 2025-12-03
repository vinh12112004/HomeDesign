import React, { useRef, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux"; // Đã import
import { Layout, Card, Button, Space, Typography, message } from "antd";
import { usePanZoom } from "../../hooks/usePanZoom";
import CanvasRenderer from "./CanvasRenderer.jsx";
import {
    doRoomsOverlap,
    calculateValidZones,
} from "../../utils/roomCalculations";
import {
    findZoneContainingPoint,
    screenToWorld,
    constrainToZone,
} from "../../utils/roomHelpers";
import { moveRoom } from "../../store/slices/projectSlice";
import { fetchObjects } from "../../store/slices/objectSlice";
import { closeMoveRoom2D } from "../../store/slices/uiSlice.js";

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

export default function MoveRoom2D() {
    const dispatch = useDispatch();
    const canvasRef = useRef(null);

    // --- LẤY DỮ LIỆU TỪ REDUX ---
    const objects = useSelector((state) => state.objects.objects);
    const currentProject = useSelector(
        (state) => state.projects.currentProject
    );
    const isMovingRoom = useSelector((state) => state.projects.isMovingRoom);

    // Core settings
    const [scale, setScale] = useState(80);
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

    // --- CẬP NHẬT: Load rooms từ Redux objects thay vì mockObjects ---
    useEffect(() => {
        if (objects && objects.length > 0) {
            const floorObjects = objects
                .filter((obj) => obj.type === "Floor")
                .map((floor) => {
                    const pos = JSON.parse(floor.positionJson);
                    const meta = JSON.parse(floor.metadataJson);
                    return {
                        id: floor.id, // ID của object Floor
                        roomId: floor.roomId, // ID của Room (quan trọng để gọi API move)
                        x: pos.x,
                        z: pos.z,
                        width: meta.width,
                        length: meta.length,
                        // Lưu vị trí gốc để so sánh có thay đổi không trước khi save
                        originalX: pos.x,
                        originalZ: pos.z,
                    };
                });
            setRooms(floorObjects);
        }
    }, [objects]); // Chạy lại khi objects trong Redux thay đổi (VD: sau khi fetchObjects)

    // Calculate valid zones when dragging
    useEffect(() => {
        if (isDragging && selectedRoom) {
            const currentRoom = rooms.find((r) => r.id === selectedRoom);
            if (!currentRoom) return;

            const otherRooms = rooms.filter((r) => r.id !== selectedRoom);
            const zones = calculateValidZones(
                otherRooms,
                [],
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

    const findRoomAtPoint = (worldX, worldZ) => {
        return rooms.find((room) => {
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

            const zone = findZoneContainingPoint(
                validZones,
                worldPos.x,
                worldPos.z
            );

            if (zone) {
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

    const handleSave = async () => {
        if (!selectedRoom) {
            setStatus("❌ Vui lòng chọn một phòng trước khi lưu");
            return;
        }

        const room = rooms.find((r) => r.id === selectedRoom);
        if (room) {
            if (room.x === room.originalX && room.z === room.originalZ) {
                message.info("Phòng chưa thay đổi vị trí");
                return;
            }

            try {
                // Gọi API Move Room
                await dispatch(
                    moveRoom({
                        roomId: room.roomId,
                        offsetData: {
                            newOffsetX: room.x,
                            newOffsetZ: room.z,
                        },
                    })
                ).unwrap();

                message.success("✅ Đã cập nhật vị trí phòng thành công!");

                // Load lại dữ liệu mới nhất từ server để đồng bộ
                if (currentProject?.id) {
                    dispatch(fetchObjects(currentProject.id));
                }

                setStatus(
                    `✅ Đã lưu vị trí mới cho phòng: ${room.roomId} tại (${room.x}, ${room.z})`
                );
            } catch (error) {
                console.error("Move failed:", error);
                message.error(
                    "❌ Lỗi khi lưu vị trí: " +
                        (error.message || "Unknown error")
                );
                setStatus("❌ Lưu thất bại");
            }
        }
    };

    const handleReset = () => {
        // Reset về vị trí original (lấy từ objects ban đầu)
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
                        disabled={!selectedRoom || isMovingRoom}
                        loading={isMovingRoom}
                    >
                        💾 Lưu Vị Trí Mới
                    </Button>
                    <Button block onClick={handleReset}>
                        🔄 Reset Vị Trí
                    </Button>
                    <Button block onClick={handleResetView}>
                        🔍 Reset View
                    </Button>
                    <Button
                        danger
                        block
                        onClick={() => dispatch(closeMoveRoom2D())}
                    >
                        ✖ Close
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

import React from "react";
import { useDispatch } from "react-redux";
import { closeAddRoom2D } from "../../store/slices/uiSlice";
import {
    Layout,
    Card,
    InputNumber,
    Button,
    List,
    Typography,
    Divider,
    Spin,
} from "antd";

const { Sider } = Layout;
const { Title, Text } = Typography;

export default function SideBarMoveRoom2D({
    roomWidth,
    setRoomWidth,
    roomLength,
    setRoomLength,
    newRoomCenter,
    isValid,
    addedRooms,
    isAddingRoom,
    handleClear,
    handleReset,
    handleResetView,
    handleAddRoom,
    handleSave,
}) {
    const dispatch = useDispatch();

    return (
        <Sider
            width={280}
            style={{
                background: "#fff",
                padding: 20,
                overflowY: "auto",
                boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
            }}
        >
            <Title level={4}>🏠 Thiết Kế Phòng 2D</Title>

            <Card
                size="small"
                style={{
                    marginBottom: 16,
                    background: "#e8f5e9",
                    border: "1px solid #4caf50",
                }}
            >
                <Text strong style={{ fontSize: "12px" }}>
                    💡 Hướng dẫn:
                </Text>
                <div style={{ fontSize: "11px", marginTop: 8 }}>
                    • Giữ <strong>SPACE + Kéo chuột</strong>: Di chuyển view
                    <br />• <strong>Cuộn chuột</strong>: Zoom in/out
                    <br />• <strong>Click vùng xanh</strong>: Đặt phòng mới
                </div>
            </Card>

            {newRoomCenter && (
                <Card
                    size="small"
                    style={{
                        marginBottom: 16,
                        background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                    }}
                >
                    <Text strong style={{ color: "white" }}>
                        📍 Tọa độ tâm phòng mới:
                    </Text>
                    <br />
                    <span style={{ display: "block", marginTop: 8 }}>
                        X: <strong>{newRoomCenter.x.toFixed(2)}</strong> m
                    </span>
                    <span style={{ display: "block" }}>
                        Z: <strong>{newRoomCenter.z.toFixed(2)}</strong> m
                    </span>
                </Card>
            )}

            <Card size="small" style={{ marginBottom: 16 }}>
                <Text strong>Chiều rộng phòng mới (m):</Text>
                <InputNumber
                    value={roomWidth}
                    onChange={(v) => setRoomWidth(parseFloat(v) || 0)}
                    min={2}
                    max={10}
                    step={0.5}
                    style={{ width: "100%", marginTop: 8 }}
                />

                <Divider />

                <Text strong>Chiều dài phòng mới (m):</Text>
                <InputNumber
                    value={roomLength}
                    onChange={(v) => setRoomLength(parseFloat(v) || 0)}
                    min={2}
                    max={10}
                    step={0.5}
                    style={{ width: "100%", marginTop: 8 }}
                />
            </Card>

            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <Button onClick={handleClear} style={{ flex: 1 }}>
                    🗑️ Xóa
                </Button>
                <Button onClick={handleReset} style={{ flex: 1 }}>
                    ↻ Reset
                </Button>
            </div>

            <Button
                block
                onClick={handleResetView}
                style={{ marginBottom: 16 }}
            >
                Reset View
            </Button>

            <Button
                block
                type="primary"
                onClick={handleAddRoom}
                disabled={!isValid}
                style={{ marginBottom: 16 }}
            >
                ➕ Thêm Phòng
            </Button>

            {addedRooms.length > 0 && (
                <>
                    <Button
                        block
                        onClick={handleSave}
                        loading={isAddingRoom}
                        disabled={isAddingRoom}
                        style={{
                            background: "#34a853",
                            color: "white",
                            marginBottom: 16,
                        }}
                    >
                        {isAddingRoom ? (
                            <>
                                <Spin
                                    size="small"
                                    style={{ marginRight: 8 }}
                                />
                                Đang lưu...
                            </>
                        ) : (
                            "💾 Lưu vào Database"
                        )}
                    </Button>

                    <Card size="small">
                        <Text strong>Phòng đã thêm:</Text>
                        <List
                            size="small"
                            dataSource={addedRooms}
                            renderItem={(room, index) => (
                                <List.Item key={room.id}>
                                    Phòng {index + 1}: ({room.x.toFixed(2)},{" "}
                                    {room.z.toFixed(2)}) - {room.width}m ×{" "}
                                    {room.length}m
                                </List.Item>
                            )}
                        />
                    </Card>
                </>
            )}

            <div style={{ marginTop: 16 }}>
                <Button
                    danger
                    block
                    onClick={() => dispatch(closeAddRoom2D())}
                >
                    ✖ Close
                </Button>
            </div>
        </Sider>
    );
}
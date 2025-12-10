import React from "react";
import { Image, Empty, Spin, theme, Typography } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";

const { Text } = Typography;

const FurnitureGrid = ({ items, loading, selected, onSelect }) => {
    const { token } = theme.useToken();

    if (loading) {
        return (
            <div
                style={{
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Spin tip="Loading assets..." size="large" />
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div
                style={{
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Empty
                    description="No furniture found"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            </div>
        );
    }

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: 16,
                height: "100%",
                overflowY: "auto",
                padding: "4px",
                paddingRight: "8px", // Space for scrollbar
            }}
        >
            {items.map((model) => {
                const isSelected = selected?.nameModel === model.nameModel;
                return (
                    <div
                        key={model.nameModel}
                        onClick={() => onSelect(model)}
                        style={{
                            border: isSelected
                                ? `2px solid ${token.colorPrimary}`
                                : `1px solid ${token.colorBorderSecondary}`,
                            borderRadius: 12,
                            padding: 8,
                            cursor: "pointer",
                            position: "relative",
                            background: token.colorBgContainer,
                            transition: "all 0.2s ease",
                            boxShadow: isSelected ? token.boxShadow : "none",
                            transform: isSelected ? "translateY(-2px)" : "none",
                        }}
                        className="furniture-card" // Có thể dùng CSS module để thêm hover effect nếu muốn
                        onMouseEnter={(e) => {
                            if (!isSelected) {
                                e.currentTarget.style.borderColor =
                                    token.colorPrimaryHover;
                                e.currentTarget.style.boxShadow =
                                    token.boxShadowSecondary;
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isSelected) {
                                e.currentTarget.style.borderColor =
                                    token.colorBorderSecondary;
                                e.currentTarget.style.boxShadow = "none";
                            }
                        }}
                    >
                        {/* Thumbnail Area */}
                        <div
                            style={{
                                width: "100%",
                                aspectRatio: "1/1",
                                background: token.colorFillQuaternary,
                                borderRadius: 8,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: 8,
                                overflow: "hidden",
                            }}
                        >
                            <Image
                                src={
                                    model.texturePath || "/icons/furniture.png"
                                }
                                preview={false}
                                alt={model.nameModel}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    mixBlendMode: model.texturePath
                                        ? "normal"
                                        : "multiply",
                                }}
                                fallback="https://placehold.co/200x200?text=No+Preview"
                            />
                        </div>

                        {/* Name Label */}
                        <div style={{ textAlign: "center", padding: "0 4px" }}>
                            <Text
                                ellipsis={{ tooltip: model.nameModel }}
                                style={{ fontSize: 13, fontWeight: 500 }}
                            >
                                {model.nameModel}
                            </Text>
                        </div>

                        {/* Checkmark Badge */}
                        {isSelected && (
                            <CheckCircleFilled
                                style={{
                                    position: "absolute",
                                    top: -8,
                                    right: -8,
                                    color: token.colorPrimary,
                                    background: "#fff",
                                    borderRadius: "50%",
                                    fontSize: 20,
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                }}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default FurnitureGrid;

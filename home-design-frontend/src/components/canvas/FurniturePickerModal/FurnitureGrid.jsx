import React from "react";
import { Image, Empty, Spin } from "antd";
import { CheckOutlined } from "@ant-design/icons";

const FurnitureGrid = ({ items, loading, selected, onSelect }) => {
    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: 50 }}>
                <Spin />
            </div>
        );
    }

    if (items.length === 0) {
        return <Empty description="No furniture models found" />;
    }

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: 12,
                maxHeight: 440,
                overflow: "auto",
                padding: "8px 0",
            }}
        >
            {items.map((model) => (
                <button
                    key={model.nameModel}
                    onClick={() => onSelect(model)}
                    style={{
                        border:
                            selected?.nameModel === model.nameModel
                                ? "2px solid #1677ff"
                                : "1px solid #ddd",
                        borderRadius: 6,
                        padding: 6,
                        cursor: "pointer",
                        position: "relative",
                        background: "#fff",
                    }}
                >
                    <div
                        style={{
                            position: "relative",
                            width: "100%",
                            aspectRatio: "1 / 1",
                            background: "#f5f5f5",
                            borderRadius: 4,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                        }}
                    >
                        <Image
                            src={model.texturePath || "/icons/furniture.png"}
                            preview={false}
                            alt={model.nameModel}
                            style={{
                                width: model.texturePath ? "100%" : 48,
                                height: model.texturePath ? "100%" : 48,
                                objectFit: model.texturePath
                                    ? "cover"
                                    : "contain",
                                opacity: model.texturePath ? 1 : 0.7,
                            }}
                            fallback="/icons/furniture.png"
                        />
                    </div>
                    <div
                        style={{
                            marginTop: 4,
                            fontSize: 12,
                            textAlign: "center",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {model.nameModel}
                    </div>
                    {selected?.nameModel === model.nameModel && (
                        <CheckOutlined
                            style={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                                color: "#1677ff",
                                fontSize: 18,
                            }}
                        />
                    )}
                </button>
            ))}
        </div>
    );
};

export default FurnitureGrid;

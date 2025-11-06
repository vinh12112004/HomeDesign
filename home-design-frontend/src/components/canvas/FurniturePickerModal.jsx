import React, { useEffect, useMemo, useState } from "react";
import {
    Modal,
    Button,
    Upload,
    Input,
    Image,
    Space,
    Spin,
    Empty,
    message,
} from "antd";
import { UploadOutlined, CheckOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchAssets,
    uploadFurnitureModel,
} from "../../store/slices/assetSlice";

const OpeningPickerModal = ({ open, onClose, onSelect }) => {
    const dispatch = useDispatch();
    const items = useSelector((s) => s.assets.items.furniture || []);
    const loading = useSelector((s) => s.assets.loading.furniture);

    const [filter, setFilter] = useState("");
    const [selectedModel, setSelectedModel] = useState(null);

    const [files, setFiles] = useState({
        obj: null,
        mtl: null,
        texture: null,
    });
    const [nameModel, setNameModel] = useState("");

    // Fetch danh sách khi mở modal
    useEffect(() => {
        if (open && items.length === 0) {
            dispatch(fetchAssets({ type: "furniture" }));
        }
    }, [open, items.length, dispatch]);

    // Lọc model theo tên
    const filtered = useMemo(
        () =>
            (items || []).filter((model) =>
                model?.nameModel
                    ?.toLowerCase?.()
                    ?.includes(filter.toLowerCase())
            ),
        [items, filter]
    );

    // Upload file (.obj, .mtl, .jpg/.png)
    const beforeUpload = (file) => {
        const ext = file.name.split(".").pop().toLowerCase();
        if (!["obj", "mtl", "jpg", "jpeg", "png"].includes(ext)) {
            message.error("Chỉ chấp nhận file .obj, .mtl, .jpg, .png");
            return Upload.LIST_IGNORE;
        }

        setFiles((prev) => ({
            ...prev,
            [ext === "obj" ? "obj" : ext === "mtl" ? "mtl" : "texture"]: file,
        }));

        return false;
    };

    const handleUploadAll = async () => {
        const { obj, mtl, texture } = files;

        if (!nameModel.trim()) {
            message.warning("Vui lòng nhập tên model");
            return;
        }

        if (!obj) {
            message.warning("Vui lòng chọn file .obj");
            return;
        }

        try {
            await dispatch(
                uploadFurnitureModel({
                    objFile: obj,
                    mtlFile: mtl || null,
                    textureFile: texture || null,
                    nameModel: nameModel.trim(),
                })
            ).unwrap();

            message.success("Upload thành công!");

            setFiles({ obj: null, mtl: null, texture: null });
            setNameModel("");

            dispatch(fetchAssets({ type: "furniture" }));
        } catch (e) {
            console.error(e);
            message.error("Upload thất bại, vui lòng thử lại.");
        }
    };

    const confirm = () => {
        if (!selectedModel) {
            message.warning(
                "Vui lòng chọn một model trước khi thêm vào scene!",
                3
            );
            return;
        }

        onSelect?.(JSON.stringify(selectedModel));
        onClose?.();
    };

    return (
        <Modal
            title="Select Furniture Model"
            open={open}
            onOk={confirm}
            onCancel={onClose}
            okText="Add to scene"
            width={820}
        >
            {/* Ô lọc + upload */}
            <Space
                direction="vertical"
                style={{ width: "100%", marginBottom: 12 }}
            >
                <Input
                    placeholder="Filter by name..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    allowClear
                />

                <Space wrap>
                    <Input
                        placeholder="Nhập tên model (vd: Chair01)"
                        value={nameModel}
                        onChange={(e) => setNameModel(e.target.value)}
                        style={{ width: 200 }}
                    />

                    <Upload
                        beforeUpload={beforeUpload}
                        showUploadList={{
                            showRemoveIcon: true,
                            showPreviewIcon: false,
                        }}
                        multiple
                    >
                        <Button icon={<UploadOutlined />}>
                            Chọn .obj / .mtl / .jpg (optional)
                        </Button>
                    </Upload>

                    <Button type="primary" onClick={handleUploadAll}>
                        Upload tất cả
                    </Button>
                </Space>

                <div style={{ fontSize: 12, color: "#666" }}>
                    Bắt buộc: .obj
                </div>
            </Space>

            {/* Danh sách model */}
            {loading ? (
                <Spin />
            ) : filtered.length === 0 ? (
                <Empty description="No furniture files" />
            ) : (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(5, 1fr)",
                        gap: 12,
                        maxHeight: 440,
                        overflow: "auto",
                    }}
                >
                    {filtered.map((model) => (
                        <button
                            key={model.nameModel}
                            onClick={() => setSelectedModel(model)}
                            style={{
                                border:
                                    selectedModel?.nameModel === model.nameModel
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
                                {model.texturePath ? (
                                    <Image
                                        src={model.texturePath}
                                        preview={false}
                                        alt={model.nameModel}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                        }}
                                        fallback="/icons/furniture.png"
                                    />
                                ) : (
                                    <Image
                                        src="/icons/furniture.png"
                                        preview={false}
                                        alt="furniture"
                                        style={{
                                            width: 48,
                                            height: 48,
                                            opacity: 0.7,
                                        }}
                                    />
                                )}
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
                            {selectedModel?.nameModel === model.nameModel && (
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
            )}
        </Modal>
    );
};

export default OpeningPickerModal;

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
    Button,
    Upload,
    Input,
    Space,
    message,
    Card,
    Typography,
    theme,
    Row,
    Col,
} from "antd";
import {
    UploadOutlined,
    FileTextOutlined,
    FileImageOutlined,
    CodeSandboxOutlined,
    CheckCircleTwoTone,
    DeleteOutlined,
} from "@ant-design/icons";
import {
    uploadFurnitureModel,
    fetchAssets,
} from "../../../store/slices/assetSlice";

const { Text, Title } = Typography;

const FurnitureUpload = ({ onSuccess }) => {
    const dispatch = useDispatch();
    const { token } = theme.useToken();
    const [files, setFiles] = useState({ obj: null, mtl: null, texture: null });
    const [nameModel, setNameModel] = useState("");
    const [loading, setLoading] = useState(false);

    const checkFileType = (file, type) => {
        const ext = file.name.split(".").pop().toLowerCase();
        if (type === "obj" && ext !== "obj") return false;
        if (type === "mtl" && ext !== "mtl") return false;
        if (type === "texture" && !["jpg", "jpeg", "png"].includes(ext))
            return false;
        return true;
    };

    const handleFileChange = (file, type) => {
        if (!checkFileType(file, type)) {
            message.error(`Incorrect file format for ${type.toUpperCase()}`);
            return Upload.LIST_IGNORE;
        }
        setFiles((prev) => ({ ...prev, [type]: file }));
        return false; // Prevent auto upload
    };

    const handleRemove = (type) => {
        setFiles((prev) => ({ ...prev, [type]: null }));
    };

    const handleUploadAll = async () => {
        const { obj, mtl, texture } = files;
        if (!nameModel.trim())
            return message.warning("Please enter a model name");
        if (!obj) return message.warning("OBJ file is required");

        setLoading(true);
        try {
            await dispatch(
                uploadFurnitureModel({
                    objFile: obj,
                    mtlFile: mtl,
                    textureFile: texture,
                    nameModel: nameModel.trim(),
                })
            ).unwrap();

            message.success("Model uploaded successfully!");
            setFiles({ obj: null, mtl: null, texture: null });
            setNameModel("");
            dispatch(fetchAssets({ type: "furniture" }));
            onSuccess?.();
        } catch (e) {
            console.error(e);
            message.error("Upload failed");
        } finally {
            setLoading(false);
        }
    };

    // Component con hiển thị ô upload
    const UploadBox = ({ type, label, icon, required, file }) => (
        <Card
            size="small"
            style={{
                textAlign: "center",
                background: file
                    ? token.colorSuccessBg
                    : token.colorFillQuaternary,
                borderColor: file ? token.colorSuccessBorder : undefined,
            }}
            bodyStyle={{ padding: 12 }}
        >
            <div
                style={{
                    marginBottom: 8,
                    fontSize: 24,
                    color: file ? token.colorSuccess : token.colorTextTertiary,
                }}
            >
                {file ? (
                    <CheckCircleTwoTone twoToneColor={token.colorSuccess} />
                ) : (
                    icon
                )}
            </div>
            <Text strong style={{ display: "block", marginBottom: 4 }}>
                {label}{" "}
                {required && <span style={{ color: token.colorError }}>*</span>}
            </Text>

            {file ? (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                    }}
                >
                    <Text ellipsis style={{ maxWidth: 100, fontSize: 12 }}>
                        {file.name}
                    </Text>
                    <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemove(type)}
                    />
                </div>
            ) : (
                <Upload
                    beforeUpload={(f) => handleFileChange(f, type)}
                    showUploadList={false}
                    maxCount={1}
                >
                    <Button size="small" icon={<UploadOutlined />}>
                        Select
                    </Button>
                </Upload>
            )}
        </Card>
    );

    return (
        <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
                <Title level={4}>Add New Furniture</Title>
                <Text type="secondary">
                    Import your 3D models (.obj) to the library
                </Text>
            </div>

            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <div>
                    <Text strong>1. Model Name</Text>
                    <Input
                        placeholder="e.g. Modern Office Chair"
                        value={nameModel}
                        onChange={(e) => setNameModel(e.target.value)}
                        size="large"
                        style={{ marginTop: 8 }}
                    />
                </div>

                <div>
                    <Text strong>2. Upload Files</Text>
                    <Row gutter={16} style={{ marginTop: 8 }}>
                        <Col span={8}>
                            <UploadBox
                                type="obj"
                                label="Geometry (.obj)"
                                required
                                icon={<CodeSandboxOutlined />}
                                file={files.obj}
                            />
                        </Col>
                        <Col span={8}>
                            <UploadBox
                                type="mtl"
                                label="Material (.mtl)"
                                icon={<FileTextOutlined />}
                                file={files.mtl}
                            />
                        </Col>
                        <Col span={8}>
                            <UploadBox
                                type="texture"
                                label="Texture (.jpg/png)"
                                icon={<FileImageOutlined />}
                                file={files.texture}
                            />
                        </Col>
                    </Row>
                </div>

                <Button
                    type="primary"
                    size="large"
                    block
                    onClick={handleUploadAll}
                    loading={loading}
                    disabled={!nameModel || !files.obj}
                    style={{ height: 48, marginTop: 16 }}
                >
                    Upload Model
                </Button>
            </Space>
        </div>
    );
};

export default FurnitureUpload;

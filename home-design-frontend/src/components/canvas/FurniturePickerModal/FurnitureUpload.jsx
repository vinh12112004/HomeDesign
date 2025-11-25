import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Upload, Input, Space, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import {
    uploadFurnitureModel,
    fetchAssets,
} from "../../../store/slices/assetSlice";

const FurnitureUpload = () => {
    const dispatch = useDispatch();
    const [files, setFiles] = useState({ obj: null, mtl: null, texture: null });
    const [nameModel, setNameModel] = useState("");
    const [loading, setLoading] = useState(false);

    const beforeUpload = (file) => {
        const ext = file.name.split(".").pop().toLowerCase();
        if (!["obj", "mtl", "jpg", "jpeg", "png"].includes(ext)) {
            message.error("Chỉ chấp nhận file .obj, .mtl, .jpg, .png");
            return Upload.LIST_IGNORE;
        }

        const fileTypeMap = {
            obj: "obj",
            mtl: "mtl",
        };
        const fileType = fileTypeMap[ext] || "texture";

        setFiles((prev) => ({ ...prev, [fileType]: file }));
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

            message.success("Upload thành công!");
            setFiles({ obj: null, mtl: null, texture: null });
            setNameModel("");
            dispatch(fetchAssets({ type: "furniture" }));
        } catch (e) {
            console.error(e);
            message.error("Upload thất bại, vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const fileList = Object.values(files).filter(Boolean);

    return (
        <Space direction="vertical" style={{ width: "100%" }}>
            <Space wrap>
                <Input
                    placeholder="Nhập tên model (vd: Chair01)"
                    value={nameModel}
                    onChange={(e) => setNameModel(e.target.value)}
                    style={{ width: 200 }}
                />

                <Upload
                    beforeUpload={beforeUpload}
                    onRemove={(file) => {
                        const ext = file.name.split(".").pop().toLowerCase();
                        const fileTypeMap = { obj: "obj", mtl: "mtl" };
                        const fileType = fileTypeMap[ext] || "texture";
                        setFiles((prev) => ({ ...prev, [fileType]: null }));
                    }}
                    fileList={fileList}
                    multiple
                >
                    <Button icon={<UploadOutlined />}>
                        Chọn .obj / .mtl / .jpg (optional)
                    </Button>
                </Upload>

                <Button
                    type="primary"
                    onClick={handleUploadAll}
                    loading={loading}
                    disabled={!nameModel || !files.obj}
                >
                    Upload
                </Button>
            </Space>
            <div style={{ fontSize: 12, color: "#666" }}>
                Bắt buộc: Tên model và file .obj
            </div>
        </Space>
    );
};

export default FurnitureUpload;

import React, { useEffect, useMemo, useState } from "react";
import { Modal, Input, message, Divider } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchAssets } from "../../../store/slices/assetSlice";
import FurnitureGrid from "./FurnitureGrid";
import FurnitureUpload from "./FurnitureUpload";

const FurniturePickerModal = ({ open, onClose, onSelect }) => {
    const dispatch = useDispatch();
    const items = useSelector((s) => s.assets.items.furniture || []);
    const loading = useSelector((s) => s.assets.loading.furniture);

    const [filter, setFilter] = useState("");
    const [selectedModel, setSelectedModel] = useState(null);

    useEffect(() => {
        if (open && items.length === 0) {
            dispatch(fetchAssets({ type: "furniture" }));
        }
    }, [open, items.length, dispatch]);

    const filteredItems = useMemo(
        () =>
            (items || []).filter((model) =>
                model?.nameModel
                    ?.toLowerCase?.()
                    ?.includes(filter.toLowerCase())
            ),
        [items, filter]
    );

    const handleConfirm = () => {
        if (!selectedModel) {
            message.warning("Vui lòng chọn một model trước khi thêm!", 3);
            return;
        }
        onSelect?.(JSON.stringify(selectedModel));
        onClose?.();
    };

    // Đổi tên component cho nhất quán
    return (
        <Modal
            title="Select Furniture Model"
            open={open}
            onOk={handleConfirm}
            onCancel={onClose}
            okText="Add to scene"
            width={820}
        >
            <FurnitureUpload />

            <Divider />

            <Input
                placeholder="Filter models by name..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                allowClear
                style={{ marginBottom: 12 }}
            />

            <FurnitureGrid
                items={filteredItems}
                loading={loading}
                selected={selectedModel}
                onSelect={setSelectedModel}
            />
        </Modal>
    );
};

export default FurniturePickerModal;

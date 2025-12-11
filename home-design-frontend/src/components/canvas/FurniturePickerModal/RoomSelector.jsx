import React, { useEffect } from "react";
import { Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchRoomsByProject } from "../../../store/slices/roomSlice";

const RoomSelector = ({ value, onChange }) => {
    const dispatch = useDispatch();
    const rooms = useSelector((s) => s.rooms.rooms);
    const loading = useSelector((s) => s.rooms.loading);
    const currentProject = useSelector(
        (state) => state.projects.currentProject
    );
    useEffect(() => {
        if (currentProject?.id) {
            dispatch(fetchRoomsByProject(currentProject.id));
        }
    }, [currentProject?.id]);

    return (
        <Select
            placeholder="Select room"
            loading={loading}
            value={value}
            onChange={onChange}
            style={{ width: "100%", marginBottom: 16 }}
            options={rooms.map((r) => ({
                label: r.name,
                value: r.id,
            }))}
        />
    );
};

export default RoomSelector;

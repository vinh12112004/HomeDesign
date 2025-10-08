import React, { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import ProjectTable from "../components/projects/ProjectTable";
import { Button, Input } from "antd";
import { FilterOutlined, SearchOutlined } from "@ant-design/icons";

export default function AllProjectsPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleCreate = (values) => {
    console.log("Dữ liệu từ form:", values); // Bạn sẽ gọi API ở đây
    setIsModalVisible(false); // Đóng modal sau khi tạo
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f5f5f5" }}>
      <Sidebar collapsed={collapsed} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header onToggleSidebar={toggleSidebar} />
        <main style={{ padding: 24, overflowY: "auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>
              All Projects
            </h2>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search project..."
              style={{ width: 260 }}
            />
            <Button type="primary">New Project</Button>
            <Button icon={<FilterOutlined />}>Filter</Button>
          </div>
          <ProjectTable />
        </main>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import ProjectTable from "../components/projects/ProjectTable";
import { Button, Input, message } from "antd";
import { FilterOutlined, SearchOutlined } from "@ant-design/icons";
import NewProjectModal from "../components/projects/NewProjectModal";
import { useProject } from "../hooks/useProject";

export default function AllProjectsPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [messageApi, messageContextHolder] = message.useMessage();

  const { projects, loading, isCreating, createProject, fetchProjects, isDeleting, deleteProject } = useProject();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleCreate = async (values) => {
    try {
      await createProject(values);
      setIsModalVisible(false);
      await fetchProjects();
      messageApi.success("Project created successfully!");
    } catch (error) {
      messageApi.error("Failed to create project. Please try again.");
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f5f5f5" }}>
      {messageContextHolder}
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
            <Button type="primary" onClick={showModal}>New Project</Button>
            <Button icon={<FilterOutlined />}>Filter</Button>
          </div>
          <ProjectTable projects={projects} loading={loading} isDeleting={isDeleting} deleteProject={deleteProject} fetchProjects={fetchProjects} />
          <NewProjectModal
            visible={isModalVisible}
            onCreate={handleCreate}
            onCancel={handleCancel}
            confirmLoading={isCreating}
          />
        </main>
      </div>
    </div>
  );
}

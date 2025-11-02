import { useRef } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button, Empty } from "antd";
import RoomScene from "../components/canvas/RoomScene";
import CanvasHeader from "../components/canvas/CanvasHeader";
import SideMenu from "../components/canvas/SideMenu";
import ViewModeToggle from "../components/canvas/ViewModeToggle";
import ObjectEditor from "../components/canvas/ObjectEditor";

export default function CanvasPage() {
    const controlsRef = useRef();

    const { currentProject } = useSelector((state) => state.projects);
    const { viewMode } = useSelector((state) => state.ui);

    if (!currentProject) {
        return (
            <div style={{ textAlign: "center", marginTop: 100 }}>
                <Empty description="No project selected. Please select a project from the list.">
                    <Link to="/">
                        <Button type="primary">Back to All Projects</Button>
                    </Link>
                </Empty>
            </div>
        );
    }

    const { height } = currentProject;

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100vh",
                overflow: "hidden",
            }}
        >
            <div style={{ flexShrink: 0 }}>
                <CanvasHeader />
            </div>

            <div style={{ flexShrink: 0 }}>
                <SideMenu />
            </div>

            <div
                style={{
                    flexGrow: 1,
                    position: "relative",
                    overflow: "hidden",
                    background: "#000",
                }}
            >
                <RoomScene height={height} controlsRef={controlsRef} />

                <div
                    style={{
                        pointerEvents: "none",
                        position: "absolute",
                        inset: 0,
                    }}
                >
                    <div style={{ pointerEvents: "auto" }}>
                        <ViewModeToggle />
                    </div>
                </div>
            </div>
            <ObjectEditor />
        </div>
    );
}

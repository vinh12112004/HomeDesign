import React, { useEffect, useRef, useState, Suspense } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, TransformControls } from "@react-three/drei";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import * as THREE from "three";

// ===================================================================
// Component ClickableModel
// ===================================================================
const ClickableModel = ({
    mtlPath,
    objPath,
    name,
    visible,
    onSelect,
    forwardedRef,
    onLoad,
}) => {
    const materials = useLoader(MTLLoader, mtlPath);
    const object = useLoader(OBJLoader, objPath, (loader) => {
        loader.setMaterials(materials);
    });

    useEffect(() => {
        if (object) {
            object.scale.set(0.1, 0.1, 0.1);

            // const box = new THREE.Box3().setFromObject(object);
            // const center = new THREE.Vector3();
            // box.getCenter(center);
            // object.position.sub(center).add(new THREE.Vector3(0, 0, 0));

            console.log(`✅ Model ${name} đã tải.`);
            if (onLoad) onLoad(object);
        }
    }, [object, name, onLoad]);

    return (
        <primitive
            ref={forwardedRef}
            object={object}
            visible={visible}
            onClick={(e) => {
                e.stopPropagation();
                onSelect(name);
            }}
        />
    );
};

// ===================================================================
// Component WallWithDoorHole - Tường có lỗ cửa sử dụng CSG
// ===================================================================
const WallWithDoorHole = ({ doorSize, doorCenter, visible }) => {
    const meshRef = useRef();

    useEffect(() => {
        if (!doorSize || !doorCenter) return;

        // Kích thước tường lớn hơn cửa
        const wallWidth = doorSize.x + 4;
        const wallHeight = doorSize.y;
        const wallDepth = Math.max(doorSize.z, 0.2);

        // Tạo shape cho tường
        const wallShape = new THREE.Shape();
        const hw = wallWidth / 2;
        const hh = wallHeight / 2;

        // Viền ngoài tường
        wallShape.moveTo(-hw, -hh);
        wallShape.lineTo(hw, -hh);
        wallShape.lineTo(hw, hh);
        wallShape.lineTo(-hw, hh);
        wallShape.lineTo(-hw, -hh);

        // Tạo lỗ cửa (hole) - căn giữa hoặc phía dưới tùy thiết kế
        const doorHole = new THREE.Path();
        const dw = doorSize.x / 2;
        const dh = doorSize.y / 2;

        // Đặt cửa căn dưới (cách đáy 0.1 đơn vị)
        const doorOffsetY = -hh + dh;

        doorHole.moveTo(-dw, doorOffsetY - dh);
        doorHole.lineTo(dw, doorOffsetY - dh);
        doorHole.lineTo(dw, doorOffsetY + dh);
        doorHole.lineTo(-dw, doorOffsetY + dh);
        doorHole.lineTo(-dw, doorOffsetY - dh);

        wallShape.holes.push(doorHole);

        // Extrude để tạo độ dày
        const extrudeSettings = {
            depth: wallDepth,
            bevelEnabled: false,
        };

        const geometry = new THREE.ExtrudeGeometry(wallShape, extrudeSettings);

        // Xoay và căn chỉnh geometry
        // geometry.rotateY(Math.PI / 2);
        geometry.translate(0, 0, -wallDepth / 2);

        if (meshRef.current) {
            meshRef.current.geometry.dispose();
            meshRef.current.geometry = geometry;

            // Đặt vị trí tường khớp với cửa
            meshRef.current.position.copy(doorCenter);
            meshRef.current.updateMatrixWorld(true);
        }

        console.log("🧱 Đã tạo tường với lỗ cửa CSG");
        console.log("📏 Tường:", wallWidth, "x", wallHeight, "x", wallDepth);
        console.log("🚪 Cửa:", doorSize.x, "x", doorSize.y, "x", doorSize.z);
    }, [doorSize, doorCenter]);

    return (
        <mesh ref={meshRef} visible={visible}>
            <boxGeometry args={[1, 1, 0.1]} />
            <meshStandardMaterial
                color="#8b7355"
                side={THREE.DoubleSide}
                roughness={0.8}
                metalness={0.1}
            />
        </mesh>
    );
};

// ===================================================================
// Component ObjScene
// ===================================================================
const ObjScene = () => {
    const orbitRef = useRef();
    const transformRef = useRef();
    const [selected, setSelected] = useState(null);

    const doorRef = useRef();
    const sofaRef = useRef();
    const tableRef = useRef();

    const [doorInfo, setDoorInfo] = useState({
        size: null,
        center: null,
        loaded: false,
    });

    // Khi cửa load xong → lưu thông tin để tạo tường
    const handleDoorLoad = (doorObj) => {
        console.log("🚪 Cửa đã load xong, tính toán kích thước...");

        const box = new THREE.Box3().setFromObject(doorObj);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        console.log("📏 Kích thước cửa:", size);
        console.log("📍 Tâm cửa:", center);
        console.log(doorObj.position);
        setDoorInfo({
            size: size,
            center: center,
            loaded: true,
        });
    };

    // Effect quản lý TransformControls
    useEffect(() => {
        if (!transformRef.current || !orbitRef.current) return;

        const controls = transformRef.current;
        const orbit = orbitRef.current;

        const onDraggingChanged = (event) => {
            orbit.enabled = !event.value;
        };

        controls.addEventListener("dragging-changed", onDraggingChanged);

        return () => {
            controls.removeEventListener("dragging-changed", onDraggingChanged);
        };
    }, []);

    // Effect attach TransformControls
    useEffect(() => {
        if (!transformRef.current) return;

        let target = null;
        if (selected === "sofa") target = sofaRef.current;
        if (selected === "table") target = tableRef.current;
        if (selected === "door") target = doorRef.current;

        if (target) {
            transformRef.current.attach(target);
        } else {
            transformRef.current.detach();
        }
    }, [selected]);

    const handleDeselect = () => setSelected(null);

    return (
        <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
            <div
                style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    background: "rgba(0,0,0,0.7)",
                    color: "white",
                    padding: "10px",
                    borderRadius: "5px",
                    zIndex: 1000,
                    fontFamily: "monospace",
                    fontSize: "14px",
                }}
            >
                <div>Đã chọn: {selected || "Không có"}</div>
                <div
                    style={{
                        fontSize: "12px",
                        marginTop: "5px",
                        color: "#aaa",
                    }}
                >
                    Click vào vật thể để chọn, kéo để di chuyển.
                </div>
                {doorInfo.loaded && (
                    <div
                        style={{
                            fontSize: "11px",
                            marginTop: "8px",
                            color: "#4ade80",
                        }}
                    >
                        ✓ Tường với lỗ cửa đã tạo (CSG)
                    </div>
                )}
            </div>

            <Canvas
                camera={{ position: [3, 3, 5], fov: 60 }}
                onPointerMissed={handleDeselect}
                style={{ width: "100%", height: "100%", background: "#eeeeee" }}
            >
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 10, 5]} intensity={1.2} />
                <directionalLight position={[-5, 5, -5]} intensity={0.5} />

                <OrbitControls ref={orbitRef} makeDefault />
                <TransformControls ref={transformRef} mode="translate" />

                <axesHelper args={[5]} />
                <gridHelper args={[10, 10]} />

                <Suspense fallback={null}>
                    {/* 🧱 Tường với lỗ cửa (CSG) */}
                    <WallWithDoorHole
                        doorSize={doorInfo.size}
                        doorCenter={doorInfo.center}
                        visible={doorInfo.loaded}
                    />

                    {/* Các model */}
                    <group name="sofa-group" position={[0, 0, 0]}>
                        <ClickableModel
                            name="sofa"
                            mtlPath="/models/sofa1.mtl"
                            objPath="/models/sofa1.obj"
                            onSelect={setSelected}
                            visible={false}
                            forwardedRef={sofaRef}
                        />
                    </group>

                    <group name="table-group" position={[0, 0, 0]}>
                        <ClickableModel
                            name="table"
                            mtlPath="/models/samsung_tv.mtl"
                            objPath="/models/samsung_tv.obj"
                            onSelect={setSelected}
                            visible={false}
                            forwardedRef={tableRef}
                        />
                    </group>

                    {/* 🚪 Cửa */}
                    <group name="door-group" position={[0, 10.5, -2]}>
                        <ClickableModel
                            name="door"
                            mtlPath="/models/craftsmanDoorClosed.mtl"
                            objPath="/models/craftsmanDoorClosed.obj"
                            visible={true}
                            onSelect={setSelected}
                            forwardedRef={doorRef}
                            onLoad={handleDoorLoad}
                        />
                    </group>
                </Suspense>
            </Canvas>
        </div>
    );
};

export default ObjScene;

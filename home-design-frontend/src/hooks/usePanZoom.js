import { useState, useEffect } from "react";
import { getMousePos } from "../utils/roomHelpers.js";
export const usePanZoom = (
    canvasRef,
    scale,
    offsetX,
    offsetY,
    setScale,
    setOffsetX,
    setOffsetY
) => {
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const [isSpacePressed, setIsSpacePressed] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === "Space" && !isSpacePressed) {
                e.preventDefault();
                setIsSpacePressed(true);
            }
        };
        const handleKeyUp = (e) => {
            if (e.code === "Space") {
                e.preventDefault();
                setIsSpacePressed(false);
                setIsPanning(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [isSpacePressed]);

    const handleWheel = (e) => {
        e.preventDefault();
        const { x: mouseX, y: mouseY } = getMousePos(canvasRef.current, e);
        const worldX = (mouseX - offsetX) / scale;
        const worldY = (mouseY - offsetY) / scale;
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(20, Math.min(200, scale * delta));
        const newOffsetX = mouseX - worldX * newScale;
        const newOffsetY = mouseY - worldY * newScale;
        setScale(newScale);
        setOffsetX(newOffsetX);
        setOffsetY(newOffsetY);
    };
    const handleMouseDown = (e) => {
        if (isSpacePressed) {
            setIsPanning(true);
            setPanStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
        }
    };

    const handleMouseMove = (e) => {
        if (isPanning) {
            setOffsetX(e.clientX - panStart.x);
            setOffsetY(e.clientY - panStart.y);
        }
    };

    const handleMouseUp = () => {
        setIsPanning(false);
    };

    return {
        isPanning,
        setIsPanning,
        panStart,
        setPanStart,
        isSpacePressed,
        handleWheel,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
    };
};

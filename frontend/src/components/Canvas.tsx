import { useState, useRef, useEffect, forwardRef, useCallback, type ReactNode } from 'react';
import { Stage, Layer } from 'react-konva';
import Konva from 'konva';

interface CanvasSize {
    width: number;
    height: number;
}

interface CanvasProps {
    children: (size: CanvasSize, scale: number) => ReactNode;
    onAddGarden: (x: number, y: number) => void;
    onDragOver?: (e: React.DragEvent) => void;
    onDrop?: (e: React.DragEvent) => void;
}

const Canvas = forwardRef<Konva.Stage, CanvasProps>(({ children, onAddGarden, onDragOver, onDrop }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
    const [menu, setMenu] = useState({ x: 0, y: 0, visible: false });

    useEffect(() => {
        if (!containerRef.current) return;
        const observe = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            setSize({ width, height });
        });
        observe.observe(containerRef.current);
        return () => observe.disconnect();
    }, []);

    const handleZoom = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
        e.evt.preventDefault();
        const stage = e.target.getStage();
        if (!stage) return;

        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        const speedFactor = 0.001;
        const newScale = Math.max(0.1, Math.min(5, oldScale * (1 - e.evt.deltaY * speedFactor)));

        setView({
            scale: newScale,
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        });
    }, []);

    const handleContextMenu = (e: Konva.KonvaEventObject<PointerEvent>) => {
        e.evt.preventDefault();
        const stage = e.target.getStage();
        const pointer = stage?.getPointerPosition();
        if (!stage || !pointer) return;

        const worldPos = {
            x: (pointer.x - stage.x()) / stage.scaleX(),
            y: (pointer.y - stage.y()) / stage.scaleY(),
        };

        setMenu({ x: worldPos.x, y: worldPos.y, visible: true });
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-full bg-bg-main overflow-hidden relative"
            onDragOver={onDragOver}
            onDrop={onDrop}
        >
            <Stage
                ref={ref}
                width={size.width}
                height={size.height}
                draggable
                x={view.x}
                y={view.y}
                scaleX={view.scale}
                scaleY={view.scale}
                onWheel={handleZoom}
                onContextMenu={handleContextMenu}
                onMouseDown={() => {
                    if (menu.visible) setMenu((prev) => ({ ...prev, visible: false }));
                }}
                onDragEnd={(e) => {
                    if (e.target === e.target.getStage()) {
                        setView((prev) => ({
                            ...prev,
                            x: e.target.x(),
                            y: e.target.y(),
                        }));
                    }
                }}
            >
                <Layer>{children(size, view.scale)}</Layer>
            </Stage>

            {menu.visible && (
                <div
                    className="absolute z-50 bg-code-bg border border-border-main shadow-xl rounded-xl py-1 w-44 overflow-hidden"
                    style={{
                        left: menu.x * view.scale + view.x,
                        top: menu.y * view.scale + view.y,
                    }}
                >
                    <button
                        onClick={() => {
                            onAddGarden(menu.x, menu.y);
                            setMenu((prev) => ({ ...prev, visible: false }));
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-sans font-medium text-text-header hover:bg-leaf-green hover:text-olive-leaf-50 transition-colors cursor-pointer"
                    >
                        🌱 Add Garden
                    </button>
                </div>
            )}
        </div>
    );
});

Canvas.displayName = 'Canvas';
export default Canvas;

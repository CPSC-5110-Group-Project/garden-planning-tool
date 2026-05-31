import { useState, useRef, useEffect } from 'react';

interface EditorLayoutProps {
    header: React.ReactNode;
    sidebar: React.ReactNode;
    panel: React.ReactNode;
    canvas: React.ReactNode;
    footer: React.ReactNode;
}

export default function EditorLayout({ header, sidebar, panel, canvas, footer }: EditorLayoutProps) {
    const [panelWidth, setPanelWidth] = useState(300);
    const isResizing = useRef(false);
    const [isDragging, setIsDragging] = useState(false);

    const startResizing = (e: React.PointerEvent) => {
        const target = e.target as HTMLDivElement;
        target.setPointerCapture(e.pointerId);

        isResizing.current = true;
        setIsDragging(true);
        document.addEventListener('pointermove', handlePointerMove);
        document.addEventListener('pointerup', (event) => stopResizing(event, target), { once: true });
    };

    const handlePointerMove = (e: PointerEvent) => {
        if (!isResizing.current) return;
        const newWidth = e.clientX - 32;
        if (newWidth > 150 && newWidth < 600) {
            setPanelWidth(newWidth);
        }
    };
    const stopResizing = (e: PointerEvent, target: HTMLDivElement) => {
        isResizing.current = false;
        setIsDragging(false);
        target.releasePointerCapture(e.pointerId);
        document.removeEventListener('pointermove', handlePointerMove);
    };

    useEffect(() => {
        if (isDragging) {
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        } else {
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
        }
    }, [isDragging]);

    return (
        <div className="flex flex-col h-screen w-full overflow-hidden bg-bg-main text-text-main">
            <header className="h-18 shrink-0 border-b border-border-main flex items-center px-3 z-30 bg-bg-main">
                {header}
            </header>

            <div className="flex flex-1 min-h-0 overflow-hidden">
                <aside className="w-3 shrink-0 flex flex-col items-center py-2 gap-4 bg-code-bg z-20">{sidebar}</aside>

                <aside
                    style={{ width: `${panelWidth}px` }}
                    className="relative shrink-0 border-r border-border-main bg-bg-main z-10"
                >
                    <div className="h-full overflow-y-auto overflow-x-hidden">{panel}</div>

                    <div
                        onPointerDown={startResizing}
                        className="absolute top-0 right-1 w-2 h-full cursor-col-resize hover:bg-accent/10 transition-colors group z-40"
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-10 bg-border-main rounded-full border border-border-main flex flex-col items-center justify-center gap-1 group-hover:bg-accent group-hover:border-accent transition-all">
                            <div className="w-0.5 h-0.5 bg-text-main/40 rounded-full" />
                            <div className="w-0.5 h-0.5 bg-text-main/40 rounded-full" />
                            <div className="w-0.5 h-0.5 bg-text-main/40 rounded-full" />
                        </div>
                    </div>
                </aside>

                <div className="flex-1 flex flex-col relative min-w-0 bg-code-bg">
                    <main className="flex-1 overflow-auto">{canvas}</main>

                    <footer className="h-[50px] flex-shrink-0 border-t border-border-main bg-bg-main flex items-center px-3 text-[10px]">
                        {footer}
                    </footer>
                </div>
            </div>
        </div>
    );
}

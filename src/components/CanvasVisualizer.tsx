import { useEffect, useMemo, useRef, useState } from 'react';
import { useCanvasStore } from '../store/canvasStore';

function colorToHex(fill: 'green' | 'red' | 'yellow'): string {
  switch (fill) {
    case 'green':
      return '#cfe28a';
    case 'yellow':
      return '#d9e07a';
    case 'red':
      return '#bf7f75';
    default:
      return '#cccccc';
  }
}

export function CanvasVisualizer() {
  const { 
    width, 
    height, 
    shapes, 
    crosshairLines,
    setSize, 
    updateShape, 
    updateCrosshairLine,
    clear, 
    loadDemoLayout,
    addCrosshairLine,
    addShape,
    splitPillAtIntersection,
    splitPillWithSingleLine
  } = useCanvasStore();
  
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragType, setDragType] = useState<'shape' | 'crosshair' | 'intersection' | 'drawing'>('shape');
  const dragOffset = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawEnd, setDrawEnd] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight - 140;
      setSize(w, h);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [setSize]);

  const center = useMemo(() => ({ x: width / 2, y: height / 2 }), [width, height]);

  const getIntersection = () => {
    const v = crosshairLines.find((l) => l.type === 'vertical');
    const h = crosshairLines.find((l) => l.type === 'horizontal');
    if (!v || !h) return null;
    return { x: v.x, y: h.y } as const;
  };

  const startIntersectionDrag = (e: React.MouseEvent) => {
    e.stopPropagation();
    const svg = svgRef.current?.getBoundingClientRect();
    const inter = getIntersection();
    if (!svg || !inter) return;
    const pointerX = e.clientX - svg.left;
    const pointerY = e.clientY - svg.top;
    dragOffset.current = { dx: pointerX - inter.x, dy: pointerY - inter.y };
    setDragType('intersection');
    setDragId('intersection');
  };

  const onMouseDownShape = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const svg = svgRef.current?.getBoundingClientRect();
    if (!svg) return;
    const pointerX = e.clientX - svg.left;
    const pointerY = e.clientY - svg.top;
    const shape = shapes.find((s) => s.id === id);
    if (!shape) return;
    dragOffset.current = { dx: pointerX - shape.x, dy: pointerY - shape.y };
    setDragId(id);
    setDragType('shape');
  };

  const onMouseDownCrosshair = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const svg = svgRef.current?.getBoundingClientRect();
    if (!svg) return;
    const pointerX = e.clientX - svg.left;
    const pointerY = e.clientY - svg.top;
    const line = crosshairLines.find((l) => l.id === id);
    if (!line) return;
    if (line.type === 'vertical') {
      dragOffset.current = { dx: pointerX - line.x, dy: 0 };
    } else {
      dragOffset.current = { dx: 0, dy: pointerY - line.y };
    }
    setDragId(id);
    setDragType('crosshair');
  };

  const onMouseDownCanvas = (e: React.MouseEvent) => {
    // Start drawing a pill
    const svg = svgRef.current?.getBoundingClientRect();
    if (!svg) return;
    const pointerX = e.clientX - svg.left;
    const pointerY = e.clientY - svg.top;
    setDrawStart({ x: pointerX, y: pointerY });
    setDrawEnd({ x: pointerX, y: pointerY });
    setIsDrawing(true);
    setDragType('drawing');
  };

  const onMouseMove = (e: React.MouseEvent) => {
    const svg = svgRef.current?.getBoundingClientRect();
    if (!svg) return;
    const pointerX = e.clientX - svg.left;
    const pointerY = e.clientY - svg.top;

    if (dragType === 'drawing' && isDrawing) {
      setDrawEnd({ x: pointerX, y: pointerY });
    } else if (dragId && dragType !== 'drawing') {
      const { dx, dy } = dragOffset.current;

      if (dragType === 'shape') {
        updateShape(dragId, { x: pointerX - dx, y: pointerY - dy });
      } else if (dragType === 'crosshair') {
        const line = crosshairLines.find((l) => l.id === dragId);
        if (line) {
          if (line.type === 'vertical') {
            updateCrosshairLine(dragId, { x: pointerX - dx });
          } else {
            updateCrosshairLine(dragId, { y: pointerY - dy });
          }
        }
      } else if (dragType === 'intersection') {
        const v = crosshairLines.find((l) => l.type === 'vertical');
        const h = crosshairLines.find((l) => l.type === 'horizontal');
        if (v && h) {
          updateCrosshairLine(v.id, { x: pointerX - dx });
          updateCrosshairLine(h.id, { y: pointerY - dy });
        }
      }
    }

    // IMPORTANT: No splitting during move; splitting happens on release (mouse up)
  };

  const performSplittingOnRelease = () => {
    const v = crosshairLines.find((l) => l.type === 'vertical');
    const h = crosshairLines.find((l) => l.type === 'horizontal');

    // Snapshot shapes at release time
    const currentShapes = [...shapes];

    currentShapes.forEach((shape) => {
      if (!shape.isPill) return;

      const left = shape.x - shape.width / 2;
      const top = shape.y - shape.height / 2;
      const right = shape.x + shape.width / 2;
      const bottom = shape.y + shape.height / 2;

      const centerHit = Boolean(
        v && h && v.x >= left && v.x <= right && h.y >= top && h.y <= bottom
      );

      if (centerHit) {
        splitPillAtIntersection(shape.id, h!.y, v!.x);
        return;
      }

      // Single-line splits
      if (v && v.x >= left && v.x <= right) {
        splitPillWithSingleLine(shape.id, 'vertical', v.x);
        return;
      }
      if (h && h.y >= top && h.y <= bottom) {
        splitPillWithSingleLine(shape.id, 'horizontal', h.y);
      }
    });
  };

  const endDrag = () => {
    if (dragType === 'drawing' && isDrawing && drawStart && drawEnd) {
      // Create pill from drawing
      const width = Math.abs(drawEnd.x - drawStart.x);
      const height = Math.abs(drawEnd.y - drawStart.y);
      const x = (drawStart.x + drawEnd.x) / 2;
      const y = (drawStart.y + drawEnd.y) / 2;

      if (width > 10 && height > 10) {
        addShape({
          x,
          y,
          width: Math.max(width, 50),
          height: Math.max(height, 50),
          radii: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 },
          fill: 'green',
          opacity: 0.9,
          isPill: true,
        });
      }
    }

    // Only when user releases crosshair or center, perform splitting
    if (dragType === 'crosshair' || dragType === 'intersection') {
      performSplittingOnRelease();
    }

    setIsDrawing(false);
    setDrawStart(null);
    setDrawEnd(null);
    setDragId(null);
    setDragType('shape');
  };

  const addPill = () => {
    const newPill = {
      x: center.x,
      y: center.y,
      width: 100,
      height: 100,
      radii: { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12 },
      fill: 'green' as const,
      opacity: 0.9,
      isPill: true,
    };
    addShape(newPill);
  };

  const addCrosshair = () => {
    if (crosshairLines.length === 0) {
      addCrosshairLine({ x: center.x, y: 0, type: 'vertical' });
      addCrosshairLine({ x: 0, y: center.y, type: 'horizontal' });
    }
  };

  const inter = getIntersection();
  const showIntersectionHandle = Boolean(inter);
  const handleSize = 16;

  return (
    <div className="bg-[#b9d3ea] rounded-md border border-[#a7c6e2] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-white/70 border-b">
        <div className="flex items-center gap-3">
          <button
            className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
            onClick={loadDemoLayout}
          >
            Load Demo Layout
          </button>
          <button
            className="px-3 py-1.5 rounded-md bg-green-600 text-white text-sm hover:bg-green-700"
            onClick={addPill}
          >
            Add Pill
          </button>
          <button
            className="px-3 py-1.5 rounded-md bg-purple-600 text-white text-sm hover:bg-purple-700"
            onClick={addCrosshair}
          >
            Add Crosshair
          </button>
          <button
            className="px-3 py-1.5 rounded-md bg-gray-200 text-gray-700 text-sm hover:bg-gray-300"
            onClick={clear}
          >
            Clear All
          </button>
        </div>
        <p className="text-xs text-gray-600">
          Draw pills. Move crosshair lines or center freely. Splitting happens when you release the crosshair.
        </p>
      </div>

      <svg
        ref={svgRef}
        width={width}
        height={height}
        onMouseDown={onMouseDownCanvas}
        onMouseMove={onMouseMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        className="block"
        style={{ cursor: isDrawing ? 'crosshair' : 'default' }}
      >
        {/* Drawing preview */}
        {isDrawing && drawStart && drawEnd && (
          <rect
            x={Math.min(drawStart.x, drawEnd.x)}
            y={Math.min(drawStart.y, drawEnd.y)}
            width={Math.abs(drawEnd.x - drawStart.x)}
            height={Math.abs(drawEnd.y - drawStart.y)}
            fill="none"
            stroke="#4a5568"
            strokeWidth={2}
            strokeDasharray="5,5"
            opacity={0.7}
          />
        )}

        {/* Shapes - rendered first so crosshair is on top */}
        {shapes.map((s) => {
          const uniformRx = Math.max(
            0,
            Math.min(
              Math.max(s.radii.topLeft, s.radii.topRight, s.radii.bottomRight, s.radii.bottomLeft),
              s.width / 2,
              s.height / 2
            )
          );
          return (
            <rect
              key={s.id}
              x={s.x - s.width / 2}
              y={s.y - s.height / 2}
              width={s.width}
              height={s.height}
              rx={uniformRx}
              ry={uniformRx}
              fill={colorToHex(s.fill)}
              opacity={s.opacity ?? 1}
              stroke={s.isPill ? "#4a5568" : "#a6b9c9"}
              strokeWidth={s.isPill ? 2 : 1}
              onMouseDown={(e) => onMouseDownShape(e, s.id)}
              style={{ cursor: s.isPill ? 'grab' : 'grab' }}
            />
          );
        })}

        {/* Crosshair lines - rendered last so they're on top */}
        {crosshairLines.map((line) => (
          <g key={line.id}>
            {line.type === 'vertical' ? (
              <line
                x1={line.x}
                y1={0}
                x2={line.x}
                y2={height}
                stroke="#6c7a89"
                strokeWidth={3}
                strokeOpacity={0.9}
                onMouseDown={(e) => onMouseDownCrosshair(e, line.id)}
                style={{ cursor: 'ew-resize', pointerEvents: 'all' }}
              />
            ) : (
              <line
                x1={0}
                y1={line.y}
                x2={width}
                y2={line.y}
                stroke="#6c7a89"
                strokeWidth={3}
                strokeOpacity={0.9}
                onMouseDown={(e) => onMouseDownCrosshair(e, line.id)}
                style={{ cursor: 'ns-resize', pointerEvents: 'all' }}
              />
            )}
          </g>
        ))}

        {/* Intersection handle - rendered last so it's on top */}
        {showIntersectionHandle && inter && (
          <g onMouseDown={startIntersectionDrag} style={{ cursor: 'move', pointerEvents: 'all' }}>
            <rect
              x={inter.x - handleSize / 2}
              y={inter.y - handleSize / 2}
              width={handleSize}
              height={handleSize}
              fill="#ffffff"
              stroke="#6c7a89"
              strokeWidth={2}
              opacity={0.95}
              rx={3}
            />
            <line x1={inter.x - 5} y1={inter.y} x2={inter.x + 5} y2={inter.y} stroke="#6c7a89" strokeWidth={2} />
            <line x1={inter.x} y1={inter.y - 5} x2={inter.x} y2={inter.y + 5} stroke="#6c7a89" strokeWidth={2} />
          </g>
        )}
      </svg>
    </div>
  );
} 
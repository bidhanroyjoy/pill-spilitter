import { create } from "zustand";

export type CornerRadii = {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
};

export type ShapeFill = "green" | "red" | "yellow";

export interface CanvasShape {
  id: string;
  x: number; // center x in px
  y: number; // center y in px
  width: number;
  height: number;
  radii: CornerRadii; // per-corner radius
  fill: ShapeFill;
  opacity?: number;
  isPill?: boolean; // indicates if this is a pill that can be split
  splitPieces?: CanvasShape[]; // pieces after splitting
}

export interface CrosshairLine {
  id: string;
  x: number; // for vertical line, this is x position
  y: number; // for horizontal line, this is y position
  type: 'horizontal' | 'vertical';
}

interface CanvasState {
  width: number;
  height: number;
  shapes: CanvasShape[];
  crosshairLines: CrosshairLine[];
  setSize: (width: number, height: number) => void;
  addShape: (shape: Omit<CanvasShape, 'id'>) => void;
  updateShape: (id: string, updates: Partial<CanvasShape>) => void;
  setShapes: (shapes: CanvasShape[]) => void;
  clear: () => void;
  loadDemoLayout: () => void;
  addCrosshairLine: (line: Omit<CrosshairLine, 'id'>) => void;
  updateCrosshairLine: (id: string, updates: Partial<CrosshairLine>) => void;
  splitPillAtIntersection: (pillId: string, horizontalY: number, verticalX: number) => void;
  splitPillWithSingleLine: (pillId: string, lineType: 'horizontal' | 'vertical', linePosition: number) => void;
  clearCrosshairs: () => void;
}

const green = 'green' as const;

export const useCanvasStore = create<CanvasState>((set, get) => ({
  width: 900,
  height: 600,
  shapes: [],
  crosshairLines: [],

  setSize: (width, height) => set({ width, height }),

  addShape: (shape) =>
    set((state) => ({ shapes: [...state.shapes, { ...shape, id: crypto.randomUUID() }] })),

  updateShape: (id, updates) =>
    set((state) => ({
      shapes: state.shapes.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),

  setShapes: (shapes) => set({ shapes }),

  clear: () => set({ shapes: [], crosshairLines: [] }),

  addCrosshairLine: (line) =>
    set((state) => ({ 
      crosshairLines: [...state.crosshairLines, { ...line, id: crypto.randomUUID() }] 
    })),

  updateCrosshairLine: (id, updates) =>
    set((state) => ({
      crosshairLines: state.crosshairLines.map((line) => 
        line.id === id ? { ...line, ...updates } : line
      ),
    })),

  clearCrosshairs: () => set({ crosshairLines: [] }),

  splitPillWithSingleLine: (pillId, lineType, linePosition) => {
    const state = get();
    const pill = state.shapes.find((s) => s.id === pillId && s.isPill);
    if (!pill) return;

    const pillLeft = pill.x - pill.width / 2;
    const pillTop = pill.y - pill.height / 2;
    const pillRight = pill.x + pill.width / 2;
    const pillBottom = pill.y + pill.height / 2;

    // Check if line intersects with pill
    if (lineType === 'vertical') {
      if (linePosition < pillLeft || linePosition > pillRight) return;
    } else {
      if (linePosition < pillTop || linePosition > pillBottom) return;
    }

    const pieces: CanvasShape[] = [];

    if (lineType === 'vertical') {
      // Split vertically into 2 pieces
      const leftWidth = linePosition - pillLeft;
      const rightWidth = pillRight - linePosition;

      if (leftWidth > 0) {
        pieces.push({
          id: crypto.randomUUID(),
          x: pillLeft + leftWidth / 2,
          y: pill.y,
          width: leftWidth,
          height: pill.height,
          radii: { 
            topLeft: Math.min(pill.radii.topLeft, leftWidth / 2, pill.height / 2), 
            topRight: 0, 
            bottomRight: 0, 
            bottomLeft: Math.min(pill.radii.bottomLeft, leftWidth / 2, pill.height / 2) 
          },
          fill: pill.fill,
          opacity: pill.opacity,
          isPill: true,
        });
      }

      if (rightWidth > 0) {
        pieces.push({
          id: crypto.randomUUID(),
          x: linePosition + rightWidth / 2,
          y: pill.y,
          width: rightWidth,
          height: pill.height,
          radii: { 
            topLeft: 0, 
            topRight: Math.min(pill.radii.topRight, rightWidth / 2, pill.height / 2), 
            bottomRight: Math.min(pill.radii.bottomRight, rightWidth / 2, pill.height / 2), 
            bottomLeft: 0 
          },
          fill: pill.fill,
          opacity: pill.opacity,
          isPill: true,
        });
      }
    } else {
      // Split horizontally into 2 pieces
      const topHeight = linePosition - pillTop;
      const bottomHeight = pillBottom - linePosition;

      if (topHeight > 0) {
        pieces.push({
          id: crypto.randomUUID(),
          x: pill.x,
          y: pillTop + topHeight / 2,
          width: pill.width,
          height: topHeight,
          radii: { 
            topLeft: Math.min(pill.radii.topLeft, pill.width / 2, topHeight / 2), 
            topRight: Math.min(pill.radii.topRight, pill.width / 2, topHeight / 2), 
            bottomRight: 0, 
            bottomLeft: 0 
          },
          fill: pill.fill,
          opacity: pill.opacity,
          isPill: true,
        });
      }

      if (bottomHeight > 0) {
        pieces.push({
          id: crypto.randomUUID(),
          x: pill.x,
          y: linePosition + bottomHeight / 2,
          width: pill.width,
          height: bottomHeight,
          radii: { 
            topLeft: 0, 
            topRight: 0, 
            bottomRight: Math.min(pill.radii.bottomRight, pill.width / 2, bottomHeight / 2), 
            bottomLeft: Math.min(pill.radii.bottomLeft, pill.width / 2, bottomHeight / 2) 
          },
          fill: pill.fill,
          opacity: pill.opacity,
          isPill: true,
        });
      }
    }

    // Remove original pill and add pieces
    set((state) => ({
      shapes: [
        ...state.shapes.filter((s) => s.id !== pillId),
        ...pieces,
      ],
    }));
  },

  splitPillAtIntersection: (pillId, horizontalY, verticalX) => {
    const state = get();
    const pill = state.shapes.find((s) => s.id === pillId && s.isPill);
    if (!pill) return;

    // Calculate intersection relative to pill
    const pillLeft = pill.x - pill.width / 2;
    const pillTop = pill.y - pill.height / 2;
    const pillRight = pill.x + pill.width / 2;
    const pillBottom = pill.y + pill.height / 2;

    // Check if intersection is within pill bounds
    if (verticalX < pillLeft || verticalX > pillRight || 
        horizontalY < pillTop || horizontalY > pillBottom) {
      return;
    }

    // Create split pieces - always create 4 pieces when lines intersect
    const pieces: CanvasShape[] = [];
    const pieceWidth = pill.width / 2;
    const pieceHeight = pill.height / 2;

    // Top-left piece
    pieces.push({
      id: crypto.randomUUID(),
      x: pillLeft + pieceWidth / 2,
      y: pillTop + pieceHeight / 2,
      width: pieceWidth,
      height: pieceHeight,
      radii: { 
        topLeft: Math.min(pill.radii.topLeft, pieceWidth / 2, pieceHeight / 2), 
        topRight: 0, 
        bottomRight: 0, 
        bottomLeft: Math.min(pill.radii.bottomLeft, pieceWidth / 2, pieceHeight / 2) 
      },
      fill: pill.fill,
      opacity: pill.opacity,
      isPill: true,
    });

    // Top-right piece
    pieces.push({
      id: crypto.randomUUID(),
      x: pillLeft + pieceWidth * 1.5,
      y: pillTop + pieceHeight / 2,
      width: pieceWidth,
      height: pieceHeight,
      radii: { 
        topLeft: 0, 
        topRight: Math.min(pill.radii.topRight, pieceWidth / 2, pieceHeight / 2), 
        bottomRight: 0, 
        bottomLeft: 0 
      },
      fill: pill.fill,
      opacity: pill.opacity,
      isPill: true,
    });

    // Bottom-left piece
    pieces.push({
      id: crypto.randomUUID(),
      x: pillLeft + pieceWidth / 2,
      y: pillTop + pieceHeight * 1.5,
      width: pieceWidth,
      height: pieceHeight,
      radii: { 
        topLeft: 0, 
        topRight: 0, 
        bottomRight: 0, 
        bottomLeft: Math.min(pill.radii.bottomLeft, pieceWidth / 2, pieceHeight / 2) 
      },
      fill: pill.fill,
      opacity: pill.opacity,
      isPill: true,
    });

    // Bottom-right piece
    pieces.push({
      id: crypto.randomUUID(),
      x: pillLeft + pieceWidth * 1.5,
      y: pillTop + pieceHeight * 1.5,
      width: pieceWidth,
      height: pieceHeight,
      radii: { 
        topLeft: 0, 
        topRight: 0, 
        bottomRight: Math.min(pill.radii.bottomRight, pieceWidth / 2, pieceHeight / 2), 
        bottomLeft: 0 
      },
      fill: pill.fill,
      opacity: pill.opacity,
      isPill: true,
    });

    // Remove original pill and add pieces
    set((state) => ({
      shapes: [
        ...state.shapes.filter((s) => s.id !== pillId),
        ...pieces,
      ],
    }));
  },

  loadDemoLayout: () =>
    set(() => {
      const shapes: CanvasShape[] = [
        // Demo pill that can be split
        {
          id: crypto.randomUUID(),
          x: 450,
          y: 300,
          width: 120,
          height: 120,
          radii: { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12 },
          fill: green,
          opacity: 0.9,
          isPill: true,
        },
      ];

      const crosshairLines: CrosshairLine[] = [
        {
          id: crypto.randomUUID(),
          x: 450, // vertical line x position
          y: 0,
          type: 'vertical',
        },
        {
          id: crypto.randomUUID(),
          x: 0,
          y: 300, // horizontal line y position
          type: 'horizontal',
        },
      ];

      return { shapes, crosshairLines };
    }),
}));

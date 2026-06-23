"use client";

import { Move, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { PointerEvent, WheelEvent, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import type { Seat } from "@/lib/types";

const VIEWBOX = { width: 931, height: 508 };
const MIN_SCALE = 0.7;
const MAX_SCALE = 3;

const labSeatCoordinates: Record<string, { x: number; y: number }> = {
  A01: { x: 88, y: 164 },
  A02: { x: 157, y: 164 },
  A03: { x: 226, y: 164 },
  A04: { x: 86, y: 354 },
  A05: { x: 157, y: 354 },
  A06: { x: 228, y: 355 },
  B01: { x: 464, y: 387 },
  B02: { x: 556, y: 387 },
  C01: { x: 539, y: 104 },
  C02: { x: 469, y: 104 }
};

const meetingSeatCoordinates: Record<string, { x: number; y: number }> = {
  M01: { x: 315, y: 190 },
  M02: { x: 430, y: 190 },
  M03: { x: 545, y: 190 },
  M04: { x: 660, y: 190 }
};

type SvgSeatMapProps = {
  seats: Seat[];
  reservedSeatIds: Set<string>;
  selectedSeatId: string;
  roomCode?: string;
  roomSvg?: string;
  onSelectSeat: (seatId: string) => void;
  onClickMap?: (xPercent: number, yPercent: number) => void;
};

export function SvgSeatMap({ seats, reservedSeatIds, selectedSeatId, roomCode, roomSvg, onSelectSeat, onClickMap }: SvgSeatMapProps) {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const isMeetingRoom = roomCode === "CS-MEETING";
  const seatCoordinates = useMemo(() => {
    const fixedCoordinates = isMeetingRoom ? meetingSeatCoordinates : labSeatCoordinates;
    return seats.map((seat) => ({
      seat,
      x: fixedCoordinates[seat.label]?.x ?? (seat.position.x / 100) * VIEWBOX.width,
      y: fixedCoordinates[seat.label]?.y ?? (seat.position.y / 100) * VIEWBOX.height
    }));
  }, [isMeetingRoom, seats]);

  const zoom = (delta: number) => {
    setScale((current) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number((current + delta).toFixed(2)))));
  };

  const reset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const getPoint = (event: PointerEvent<HTMLDivElement>) => {
    const svg = svgRef.current;
    if (svg) {
      const pt = svg.createSVGPoint();
      pt.x = event.clientX;
      pt.y = event.clientY;
      const screenCTM = svg.getScreenCTM();
      if (screenCTM) {
        const svgP = pt.matrixTransform(screenCTM.inverse());
        return { x: svgP.x, y: svgP.y };
      }
    }
    // Fallback if SVG ref fails
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: event.clientX, y: event.clientY };
    return {
      x: (event.clientX - rect.left) * (VIEWBOX.width / rect.width),
      y: (event.clientY - rect.top) * (VIEWBOX.height / rect.height)
    };
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const point = getPoint(event);
    dragStartRef.current = { x: point.x, y: point.y, offsetX: offset.x, offsetY: offset.y };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const point = getPoint(event);
    setOffset({
      x: dragStartRef.current.offsetX + (point.x - dragStartRef.current.x) / scale,
      y: dragStartRef.current.offsetY + (point.y - dragStartRef.current.y) / scale
    });
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);

    if (onClickMap) {
      const point = getPoint(event);
      const dx = point.x - dragStartRef.current.x;
      const dy = point.y - dragStartRef.current.y;
      
      if (Math.abs(dx) < 2 && Math.abs(dy) < 2) {
        const internalX = (point.x / scale) - offset.x;
        const internalY = (point.y / scale) - offset.y;
        
        const xPercent = Math.max(0, Math.min(100, (internalX / VIEWBOX.width) * 100));
        const yPercent = Math.max(0, Math.min(100, (internalY / VIEWBOX.height) * 100));
        
        onClickMap(Math.round(xPercent), Math.round(yPercent));
      }
    }
  };

  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    zoom(event.deltaY > 0 ? -0.12 : 0.12);
  };

  return (
    <div className="relative min-h-[460px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700/50 dark:bg-slate-900/50">
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-xl border border-slate-200 bg-white/95 p-1 shadow-sm dark:border-slate-700 dark:bg-slate-800/95">
        <button type="button" onClick={() => zoom(0.15)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700" title={t.zoomIn}>
          <ZoomIn size={18} />
        </button>
        <button type="button" onClick={() => zoom(-0.15)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700" title={t.zoomOut}>
          <ZoomOut size={18} />
        </button>
        <button type="button" onClick={reset} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700" title={t.resetView}>
          <RotateCcw size={18} />
        </button>
        <span className="hidden items-center gap-1 border-l border-slate-200 px-3 text-xs font-semibold text-slate-500 sm:flex dark:border-slate-600 dark:text-slate-400">
          <Move size={14} />
          {Math.round(scale * 100)}%
        </span>
      </div>

      <div className="absolute right-4 top-4 z-10 hidden rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm sm:block dark:border-slate-700 dark:bg-slate-800/95 dark:text-slate-400">
        {t.dragHint}
      </div>

      <div
        ref={containerRef}
        className={`h-[560px] w-full touch-none select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => setIsDragging(false)}
        onWheel={onWheel}
      >
        <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`} className="h-full w-full">
          <g transform={`scale(${scale}) translate(${offset.x} ${offset.y})`}>
            {roomSvg ? (
              <g dangerouslySetInnerHTML={{ __html: roomSvg }} />
            ) : isMeetingRoom ? (
              <MeetingRoomBackground />
            ) : (
              <LabRoomBackground />
            )}
            <g>
              {seatCoordinates.map(({ seat, x, y }) => {
                const reserved = reservedSeatIds.has(seat.id);
                const selected = selectedSeatId === seat.id;
                const fill = reserved ? "#94a3b8" : selected ? "#b91c1c" : "#40ad0e";
                const hoverFill = reserved ? "#94a3b8" : selected ? "#991b1b" : "#2e8b57";

                return (
                  <g
                    key={seat.id}
                    role="button"
                    aria-label={`${seat.label} ${reserved ? t.reserved : selected ? t.selected : t.available}`}
                    className={reserved ? "cursor-not-allowed" : "cursor-pointer"}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={() => {
                      if (!reserved) onSelectSeat(seat.id);
                    }}
                  >
                    <title>{`${seat.label} - ${reserved ? t.reserved : selected ? t.selected : t.available}`}</title>
                    <circle
                      cx={x}
                      cy={y}
                      r="18"
                      fill={fill}
                      stroke={selected ? "#7f1d1d" : "#0f172a"}
                      strokeWidth={selected ? 4 : 2}
                      className={onClickMap ? "pointer-events-none" : ""}
                      onMouseEnter={(event) => { if (!onClickMap) event.currentTarget.setAttribute("fill", hoverFill) }}
                      onMouseLeave={(event) => { if (!onClickMap) event.currentTarget.setAttribute("fill", fill) }}
                    />
                    <text
                      x={x}
                      y={y + 4}
                      textAnchor="middle"
                      className="pointer-events-none fill-white text-[13px] font-bold"
                    >
                      {seat.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </g>
        </svg>
      </div>

      <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800/95 dark:text-slate-300">
        <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-[#40ad0e]" />{t.available}</span>
        <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-[#b91c1c]" />{t.selected}</span>
        <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-slate-400 dark:bg-slate-600" />{t.reserved}</span>
      </div>
    </div>
  );
}

function LabRoomBackground() {
  return (
    <g>
      <path className="fill-[#DCEAF7] stroke-[#366286] dark:fill-slate-800 dark:stroke-slate-600" strokeWidth="5" d="M2.5 505.5V2.5h711v503z" />
      <path className="fill-[#DCEAF7] stroke-[#366286] dark:fill-slate-800 dark:stroke-slate-600" d="M710.525 339.484V161.597h4.975v177.887z" />
      <rect width="141" height="212" x="49.5" y="329.5" className="fill-[#FCFCFC] stroke-[#C0BECA] dark:fill-slate-700 dark:stroke-slate-500" rx="14.5" transform="rotate(-90 49.5 329.5)" />
      <rect width="76" height="212" x="406.5" y="490.5" className="fill-[#FCFCFC] stroke-[#C0BECA] dark:fill-slate-700 dark:stroke-slate-500" rx="14.5" transform="rotate(-90 406.5 490.5)" />
      <path className="fill-[#D9D9D9] dark:fill-slate-600" d="M302 503V382h32v121z" />
      <path className="fill-[#fff] stroke-[#C0BECA] dark:fill-slate-700 dark:stroke-slate-500" d="M373.5 73.5v-64h239v64z" />
      <path className="fill-[#fff] stroke-[#C0BECA] dark:fill-slate-700 dark:stroke-slate-500" d="M344.5 219.5V9.5h55v210z" />
      <path className="fill-[#D9D9D9] stroke-[#000] dark:fill-slate-600 dark:stroke-slate-900" d="M227.5 56.5v-47h48v47z" />
      <path className="fill-[#D9D9D9] stroke-[#000] dark:fill-slate-600 dark:stroke-slate-900" d="M289.5 56.5v-47h48v47z" />
      <path className="fill-[#D9D9D9] stroke-[#000] dark:fill-slate-600 dark:stroke-slate-900" d="M108.5 333.5V363c0 8.008-6.492 14.5-14.5 14.5H79c-8.008 0-14.5-6.492-14.5-14.5v-29.5h44Z" />
      <path className="fill-[#D9D9D9] dark:fill-slate-600" d="M18 325V193h23v132z" />
      <path className="fill-[#D9D9D9] stroke-[#000] dark:fill-slate-600 dark:stroke-slate-900" d="M150 377.5c-8.008 0-14.5-6.492-14.5-14.5v-29.5h44V363c0 8.008-6.492 14.5-14.5 14.5h-15Z" />
      <path className="fill-[#D9D9D9] stroke-[#000] dark:fill-slate-600 dark:stroke-slate-900" d="M462 126.5c-8.008 0-14.5-6.492-14.5-14.5V82.5h44V112c0 8.008-6.492 14.5-14.5 14.5h-15Z" />
      <path className="fill-[#D9D9D9] stroke-[#000] dark:fill-slate-600 dark:stroke-slate-900" d="M150 141.5c-8.008 0-14.5 6.492-14.5 14.5v29.5h44V156c0-8.008-6.492-14.5-14.5-14.5h-15Z" />
      <path className="fill-[#D9D9D9] stroke-[#000] dark:fill-slate-600 dark:stroke-slate-900" d="M457 365.5c-8.008 0-14.5 6.492-14.5 14.5v29.5h44V380c0-8.008-6.492-14.5-14.5-14.5h-15Z" />
      <path className="fill-[#D9D9D9] stroke-[#000] dark:fill-slate-600 dark:stroke-slate-900" d="M64.5 155v30.5h45V155c0-8.008-6.492-14.5-14.5-14.5H79c-8.008 0-14.5 6.492-14.5 14.5Z" />
      <path className="fill-[#D9D9D9] stroke-[#000] dark:fill-slate-600 dark:stroke-slate-900" d="M218 140.5c-8.008 0-14.5 6.492-14.5 14.5v29.5h44V155c0-8.008-6.492-14.5-14.5-14.5h-15Z" />
      <path className="fill-[#D9D9D9] stroke-[#000] dark:fill-slate-600 dark:stroke-slate-900" d="M549 365.5c-8.008 0-14.5 6.492-14.5 14.5v29.5h44V380c0-8.008-6.492-14.5-14.5-14.5h-15Z" />
      <path className="fill-[#D9D9D9] stroke-[#000] dark:fill-slate-600 dark:stroke-slate-900" d="M220 377.5c-8.008 0-14.5-6.492-14.5-14.5v-29.5h44V363c0 8.008-6.492 14.5-14.5 14.5h-15Z" />
      <path className="fill-[#D9D9D9] stroke-[#000] dark:fill-slate-600 dark:stroke-slate-900" d="M532 126.5c-8.008 0-14.5-6.492-14.5-14.5V82.5h44V112c0 8.008-6.492 14.5-14.5 14.5h-15Z" />
      <circle cx="458" cy="453" r="13" className="fill-[#D9D9D9] dark:fill-slate-600" />
      <circle cx="539" cy="42" r="13" className="fill-[#D9D9D9] dark:fill-slate-600" />
      <circle cx="556" cy="453" r="13" className="fill-[#D9D9D9] dark:fill-slate-600" />
      <path className="fill-[#D9D9D9] dark:fill-slate-600" d="M769 261v-27h64v27z" />
      <path className="fill-[#D9D9D9] dark:fill-slate-600" d="m719 247.5 50.25-29.012v58.024L719 247.5Z" />
      <text x="779" y="254" textAnchor="middle" className="fill-slate-950 text-[16px] font-black dark:fill-slate-200">ENTRY</text>
    </g>
  );
}

function MeetingRoomBackground() {
  return (
    <g>
      <path className="fill-[#DCEAF7] stroke-[#366286] dark:fill-slate-800 dark:stroke-slate-600" strokeWidth="5" d="M82.5 455.5V52.5h766v403z" />
      <rect x="235" y="130" width="505" height="150" rx="32" className="fill-[#FCFCFC] stroke-[#C0BECA] dark:fill-slate-700 dark:stroke-slate-500" strokeWidth="2" />
      <rect x="265" y="160" width="445" height="90" rx="22" className="fill-[#E2E8F0] stroke-[#94A3B8] dark:fill-slate-600 dark:stroke-slate-400" />
      <path className="fill-[#D9D9D9] dark:fill-slate-600" d="M83 258v-64h64v64z" />
      <path className="fill-[#D9D9D9] dark:fill-slate-600" d="m147 226 56-32v64l-56-32Z" />
      <text x="330" y="370" className="fill-slate-600 text-[22px] font-bold dark:fill-slate-300">CS MEETING ROOM</text>
    </g>
  );
}

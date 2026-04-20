import React, { useState } from 'react';

const getLabelStep = (count) => {
  if (count <= 7)  return 1;
  if (count <= 14) return 2;
  if (count <= 31) return 4;
  return 9;
};

const RevenueLineChart = ({ data }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign:'center', padding:'48px 20px', fontSize:14, color:'rgba(255,255,255,0.30)', display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
        No revenue data available
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue || 0), 1);
  const minRevenue = Math.min(...data.map(d => d.revenue || 0), 0);
  const range      = maxRevenue - minRevenue || 1;
  const step       = getLabelStep(data.length);

  const W          = 600;
  const H          = 180;
  const PAD_LEFT   = 56;
  const PAD_RIGHT  = 16;
  const PAD_TOP    = 16;
  const PAD_BOTTOM = 32;
  const chartW     = W - PAD_LEFT - PAD_RIGHT;
  const chartH     = H - PAD_TOP - PAD_BOTTOM;

  const pts = data.map((item, i) => {
    const x = PAD_LEFT + (i / Math.max(data.length - 1, 1)) * chartW;
    const y = PAD_TOP + chartH - ((item.revenue - minRevenue) / range) * chartH;
    return { x, y, item };
  });

  const linePoints = pts.map(p => `${p.x},${p.y}`).join(' ');
  const areaPoints = [
    `${pts[0].x},${PAD_TOP + chartH}`,
    ...pts.map(p => `${p.x},${p.y}`),
    `${pts[pts.length - 1].x},${PAD_TOP + chartH}`,
  ].join(' ');

  const yTicks = 4;
  const yLines = Array.from({ length: yTicks + 1 }, (_, i) => {
    const val = minRevenue + (range * i) / yTicks;
    const y   = PAD_TOP + chartH - (i / yTicks) * chartH;
    return { val, y };
  });

  const fmtVal = (v) => {
    if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
    if (v >= 1000)   return `₹${(v / 1000).toFixed(0)}k`;
    return `₹${Math.round(v)}`;
  };

  return (
    <div style={{ width:'100%', fontFamily:"'DM Sans', sans-serif" }}>
      <div style={{ position:'relative', width:'100%', paddingBottom:'30%', minHeight:200 }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', overflow:'visible' }}
        >
          <defs>
            <linearGradient id="rlcGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#4ade80" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#4ade80" stopOpacity="0.02" />
            </linearGradient>
            <filter id="rlcGlow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Grid lines */}
          {yLines.map((tick, i) => (
            <g key={i}>
              <line x1={PAD_LEFT} y1={tick.y} x2={W - PAD_RIGHT} y2={tick.y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray={i === 0 ? 'none' : '4,4'} />
              <text x={PAD_LEFT - 8} y={tick.y + 4} textAnchor="end" fontSize="10" fill="rgba(255,255,255,0.30)" fontFamily="'DM Sans', sans-serif">
                {fmtVal(tick.val)}
              </text>
            </g>
          ))}

          {/* Baseline */}
          <line x1={PAD_LEFT} y1={PAD_TOP + chartH} x2={W - PAD_RIGHT} y2={PAD_TOP + chartH} stroke="rgba(255,255,255,0.10)" strokeWidth="1" />

          {/* Area fill */}
          <polygon points={areaPoints} fill="url(#rlcGrad)" />

          {/* Line */}
          <polyline points={linePoints} fill="none" stroke="#4ade80" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" filter="url(#rlcGlow)" />

          {/* Data points + hover */}
          {pts.map((p, i) => {
            const showLabel = i % step === 0 || i === pts.length - 1;
            return (
              <g key={i} onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)} style={{ cursor:'default' }}>
                {/* Hit area */}
                <rect x={p.x - 18} y={PAD_TOP} width={36} height={chartH} fill="transparent" />

                {/* Hover line */}
                {hoveredIdx === i && (
                  <line x1={p.x} y1={PAD_TOP} x2={p.x} y2={PAD_TOP + chartH} stroke="rgba(74,222,128,0.25)" strokeWidth="1" strokeDasharray="4,3" />
                )}

                {/* Glow ring */}
                {hoveredIdx === i && (
                  <circle cx={p.x} cy={p.y} r="8" fill="rgba(74,222,128,0.15)" stroke="rgba(74,222,128,0.30)" strokeWidth="1" />
                )}

                {/* Dot — only render dot if it's a label tick or hovered */}
                {(showLabel || hoveredIdx === i) && (
                  <circle cx={p.x} cy={p.y} r={hoveredIdx === i ? 5 : 3} fill={hoveredIdx === i ? '#4ade80' : '#1e293b'} stroke="#4ade80" strokeWidth={hoveredIdx === i ? 2.5 : 1.5} style={{ transition:'r .15s,fill .15s' }} />
                )}

                {/* Tooltip */}
                {hoveredIdx === i && (
                  <g>
                    <g transform={`translate(${p.x > W - 100 ? p.x - 110 : p.x + 10},${Math.max(PAD_TOP + 2, p.y - 28)})`}>
                      <rect rx="7" ry="7" width="96" height="42" fill="rgba(10,20,38,0.97)" stroke="rgba(74,222,128,0.30)" strokeWidth="1" />
                      <text x="10" y="15" fontSize="10" fill="rgba(255,255,255,0.45)" fontFamily="'DM Sans',sans-serif">{p.item.day}</text>
                      <text x="10" y="30" fontSize="13" fontWeight="700" fill="#4ade80" fontFamily="'DM Sans',sans-serif">
                        {fmtVal(p.item.revenue)}
                      </text>
                    </g>
                  </g>
                )}

                {/* X label — thinned */}
                {showLabel && (
                  <text x={p.x} y={H - 4} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.30)" fontFamily="'DM Sans', sans-serif">
                    {p.item.day}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default RevenueLineChart;
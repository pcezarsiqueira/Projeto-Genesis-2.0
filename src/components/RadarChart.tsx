import { useEffect, useRef } from "react";

interface RadarChartProps {
  dimensoes: { nome: string; percentual: number }[];
}

export default function RadarChart({ dimensoes }: RadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set high DPI scaling
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) * 0.35;

    // Clear background
    ctx.clearRect(0, 0, width, height);

    const totalAxes = dimensoes.length;
    if (totalAxes === 0) return;

    // Map axes with angles starting from top (subtract Math.PI / 2)
    const axes = dimensoes.map((d, i) => {
      const angle = (i * 2 * Math.PI) / totalAxes - Math.PI / 2;
      return {
        name: d.nome,
        value: d.percentual * 100, // convert percentage to 0-100 scale
        angle
      };
    });

    // 1. Draw concentric background polygon rings (25%, 50%, 75%, 100%)
    ctx.lineWidth = 1;

    for (let r = 0.25; r <= 1.0; r += 0.25) {
      ctx.strokeStyle = r === 1.0 ? "#333333" : "#1e1e1e";
      ctx.beginPath();
      // Draw a closed polygon with 'totalAxes' vertices
      for (let i = 0; i < totalAxes; i++) {
        const angle = (i * 2 * Math.PI) / totalAxes - Math.PI / 2;
        const x = centerX + Math.cos(angle) * maxRadius * r;
        const y = centerY + Math.sin(angle) * maxRadius * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      // Add helper small percentage indicator on the top axis direction
      ctx.fillStyle = "#555555";
      ctx.font = "7px monospace";
      ctx.fillText(`${r * 100}%`, centerX + 3, centerY - maxRadius * r + 3);
    }

    // 2. Draw radial axis spine lines
    ctx.strokeStyle = "#222222";
    ctx.lineWidth = 1;
    axes.forEach((axis) => {
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      const targetX = centerX + Math.cos(axis.angle) * maxRadius;
      const targetY = centerY + Math.sin(axis.angle) * maxRadius;
      ctx.lineTo(targetX, targetY);
      ctx.stroke();
    });

    // 3. Draw user data filled polygon shape
    ctx.beginPath();
    axes.forEach((axis, index) => {
      const normalizedValue = Math.max(12, axis.value) / 100; // minimum radius to look clean
      const r = maxRadius * normalizedValue;
      const x = centerX + Math.cos(axis.angle) * r;
      const y = centerY + Math.sin(axis.angle) * r;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();

    // Fill glowing semi-transparent blue region
    ctx.fillStyle = "rgba(37, 99, 235, 0.25)";
    ctx.fill();

    // Bold solid blue accents
    ctx.strokeStyle = "#38BDF8";
    ctx.lineWidth = 2.0;
    ctx.stroke();

    // 4. Draw node handle points
    axes.forEach((axis) => {
      const normalizedValue = Math.max(12, axis.value) / 100;
      const r = maxRadius * normalizedValue;
      const x = centerX + Math.cos(axis.angle) * r;
      const y = centerY + Math.sin(axis.angle) * r;

      ctx.fillStyle = "#F0F0F0";
      ctx.strokeStyle = "#2563EB";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // 5. Render responsive Axis name labels
    ctx.fillStyle = "#888888";
    ctx.font = "bold 8px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    axes.forEach((axis) => {
      const offsetFactor = 1.2;
      const labelX = centerX + Math.cos(axis.angle) * maxRadius * offsetFactor;
      const labelY = centerY + Math.sin(axis.angle) * maxRadius * offsetFactor;

      ctx.fillStyle = "#888888";
      // Slightly adapt position based on angles for readability
      if (Math.cos(axis.angle) > 0.1) {
        ctx.textAlign = "left";
      } else if (Math.cos(axis.angle) < -0.1) {
        ctx.textAlign = "right";
      } else {
        ctx.textAlign = "center";
      }

      if (Math.sin(axis.angle) > 0.9) {
        ctx.textBaseline = "top";
      } else if (Math.sin(axis.angle) < -0.9) {
        ctx.textBaseline = "bottom";
      } else {
        ctx.textBaseline = "middle";
      }

      ctx.fillText(axis.name, labelX, labelY);
    });

  }, [dimensoes]);

  return (
    <div className="w-full flex justify-center items-center py-4 bg-[#111B2E] border border-[#1E293B] rounded-2xl relative">
      <div className="absolute top-2.5 left-3.5 text-[8px] font-mono text-[#38BDF8] uppercase tracking-widest bg-[#1E3A8A]/30 border border-[#2563EB]/40 py-0.5 px-2 rounded">
        Mapa de Tração e Foco
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: "320px", height: "290px" }}
        className="max-w-full"
      />
    </div>
  );
}

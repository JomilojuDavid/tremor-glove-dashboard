import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import type {
  WaveformPoint,
  SpectrumPoint,
  RmsPoint,
} from "@/hooks/use-biosignal";

const grid = "oklch(1 0 0 / 0.07)";
const axis = "oklch(0.72 0.03 256)";

const tooltipStyle = {
  background: "oklch(0.21 0.04 265 / 0.95)",
  border: "1px solid oklch(1 0 0 / 0.08)",
  borderRadius: 12,
  color: "oklch(0.98 0.005 250)",
  fontSize: 12,
};

/* -------------------------------------------------------
   ACCELEROMETER WAVEFORM
------------------------------------------------------- */

export function WaveformChart({
  data,
}: {
  data: WaveformPoint[];
}) {
  return (
    <ChartCard
      title="Live Tremor Waveform"
      subtitle="MPU6050 accelerometer signal"
    >
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 8,
            left: -20,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient
              id="wave"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="var(--color-primary)"
                stopOpacity={0.55}
              />

              <stop
                offset="100%"
                stopColor="var(--color-primary)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            stroke={grid}
            strokeDasharray="3 6"
          />

          <XAxis
            dataKey="t"
            stroke={axis}
            fontSize={10}
            tickLine={false}
            axisLine={false}
            label={{
              value: "Samples",
              position: "insideBottomRight",
              offset: -5,
              fontSize: 10,
              fill: axis,
            }}
          />

          <YAxis
            stroke={axis}
            fontSize={10}
            tickLine={false}
            axisLine={false}
            domain={[-2, 2]}
            label={{
              value: "Acceleration",
              angle: -90,
              position: "insideLeft",
              fontSize: 10,
              fill: axis,
            }}
          />

          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value: number) => [
              `${Number(value).toFixed(3)} g`,
              "Acceleration",
            ]}
            labelFormatter={(label) => `Sample ${label}`}
          />

          <Area
            type="monotone"
            dataKey="v"
            stroke="var(--color-primary)"
            strokeWidth={2}
            fill="url(#wave)"
            isAnimationActive={false}
            style={{
              filter:
                "drop-shadow(0 0 6px var(--color-primary))",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

/* -------------------------------------------------------
   FREQUENCY SPECTRUM
------------------------------------------------------- */

export function SpectrumChart({
  data,
}: {
  data: SpectrumPoint[];
}) {
  return (
    <ChartCard
      title="Frequency Spectrum"
      subtitle="Signal frequency distribution"
    >
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          margin={{
            top: 10,
            right: 8,
            left: -20,
            bottom: 0,
          }}
        >
          <CartesianGrid
            stroke={grid}
            strokeDasharray="3 6"
            vertical={false}
          />

          <XAxis
            dataKey="f"
            stroke={axis}
            fontSize={10}
            tickLine={false}
            axisLine={false}
            label={{
              value: "Frequency (Hz)",
              position: "insideBottomRight",
              offset: -5,
              fontSize: 10,
              fill: axis,
            }}
          />

          <YAxis
            stroke={axis}
            fontSize={10}
            tickLine={false}
            axisLine={false}
            label={{
              value: "Magnitude",
              angle: -90,
              position: "insideLeft",
              fontSize: 10,
              fill: axis,
            }}
          />

          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value: number) => [
              Number(value).toFixed(3),
              "Magnitude",
            ]}
            labelFormatter={(label) =>
              `${label} Hz`
            }
          />

          <Bar
            dataKey="mag"
            fill="var(--color-success)"
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

/* -------------------------------------------------------
   RMS TREND
------------------------------------------------------- */

export function RmsChart({
  data,
}: {
  data: RmsPoint[];
}) {
  return (
    <ChartCard
      title="RMS Trend"
      subtitle="Rolling signal intensity"
    >
      <ResponsiveContainer width="100%" height={220}>
        <LineChart
          data={data}
          margin={{
            top: 10,
            right: 8,
            left: -20,
            bottom: 0,
          }}
        >
          <CartesianGrid
            stroke={grid}
            strokeDasharray="3 6"
          />

          <XAxis
            dataKey="t"
            stroke={axis}
            fontSize={10}
            tickLine={false}
            axisLine={false}
            label={{
              value: "Samples",
              position: "insideBottomRight",
              offset: -5,
              fontSize: 10,
              fill: axis,
            }}
          />

          <YAxis
            stroke={axis}
            fontSize={10}
            tickLine={false}
            axisLine={false}
            label={{
              value: "RMS",
              angle: -90,
              position: "insideLeft",
              fontSize: 10,
              fill: axis,
            }}
          />

          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value: number) => [
              Number(value).toFixed(3),
              "RMS",
            ]}
            labelFormatter={(label) =>
              `Sample ${label}`
            }
          />

          <Line
            type="monotone"
            dataKey="rms"
            stroke="var(--color-warning)"
            strokeWidth={2.4}
            dot={false}
            isAnimationActive={false}
            style={{
              filter:
                "drop-shadow(0 0 6px var(--color-warning))",
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

/* -------------------------------------------------------
   REUSABLE CHART CARD
------------------------------------------------------- */

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">
            {title}
          </div>

          <div className="text-xs text-muted-foreground">
            {subtitle}
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/40 px-2.5 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-success pulse-ring text-success" />
          Live
        </span>
      </div>

      {children}
    </div>
  );
}
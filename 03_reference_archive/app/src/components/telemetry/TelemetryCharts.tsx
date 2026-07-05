import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ResponsiveContainer,
} from 'recharts';
import type { ParameterThreshold, ParameterType } from '../../lib/api';

interface TelemetryChartsProps {
  logs: any[];
  thresholds: ParameterThreshold[];
}

const PARAM_COLORS: Record<string, string> = {
  ph: '#06b6d4',        // Cyan
  ammonia: '#eab308',   // Yellow
  nitrite: '#f97316',   // Orange
  nitrate: '#ec4899',   // Pink
  temperature: '#ef4444',// Red
  salinity: '#8b5cf6',  // Violet
  alkalinity: '#3b82f6',// Blue
  calcium: '#10b981',   // Emerald
  magnesium: '#6366f1'  // Indigo
};

const PARAM_LABELS: Record<string, string> = {
  ph: 'pH',
  ammonia: 'Ammonia',
  nitrite: 'Nitrite',
  nitrate: 'Nitrate',
  temperature: 'Temperature',
  salinity: 'Salinity',
  alkalinity: 'Alkalinity',
  calcium: 'Calcium',
  magnesium: 'Magnesium'
};

export function TelemetryCharts({ logs, thresholds }: TelemetryChartsProps) {
  const { chartData, activeParams } = useMemo(() => {
    const data: any[] = [];
    const paramsFound = new Set<string>();

    logs.forEach(log => {
      const dataPoint: any = { 
        timestamp: new Date(log.logged_at).getTime(), 
        dateLabel: new Date(log.logged_at).toLocaleString() 
      };
      
      log.parameter_readings.forEach((r: any) => {
        dataPoint[r.parameter_type] = r.value;
        paramsFound.add(r.parameter_type);
      });
      
      data.push(dataPoint);
    });

    return { 
      chartData: data, 
      activeParams: Array.from(paramsFound) as ParameterType[]
    };
  }, [logs]);

  if (activeParams.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl bg-card/50">
        No telemetry data available. Log your first water parameter reading to generate charts.
      </div>
    );
  }

  // Helper for date formatting on X axis
  const formatXAxis = (tickItem: number) => {
    return new Date(tickItem).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-8">
      {activeParams.map(param => {
        const threshold = thresholds.find(t => t.parameter_type === param);
        const color = PARAM_COLORS[param] || '#ffffff';
        const label = PARAM_LABELS[param] || param;
        
        // Determine Y-axis domain securely so reference area is visible
        const getDomain = ([dataMin, dataMax]: any): [number, number] => {
          let min = Number(dataMin);
          let max = Number(dataMax);
          if (threshold) {
            min = Math.min(min, threshold.min_value);
            max = Math.max(max, threshold.max_value);
          }
          // Add 10% padding
          const padding = (max - min) * 0.1 || 1;
          return [min - padding, max + padding];
        };

        return (
          <div key={param} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 shadow-lg">
            <div className="mb-4 flex items-center justify-between px-2">
              <h3 className="text-lg font-bold text-zinc-100">{label}</h3>
              {threshold && (
                <span className="text-xs text-zinc-400 bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800">
                  Target: {threshold.min_value} - {threshold.max_value} {threshold.unit}
                </span>
              )}
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={formatXAxis} 
                    stroke="#52525b" 
                    tick={{ fill: '#a1a1aa', fontSize: 12 }} 
                    type="number"
                    domain={['dataMin', 'dataMax']}
                  />
                  <YAxis 
                    stroke="#52525b" 
                    tick={{ fill: '#a1a1aa', fontSize: 12 }}
                    domain={getDomain}
                    tickFormatter={(val) => val.toFixed(2)}
                    width={60}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '0.5rem', color: '#f4f4f5' }}
                    itemStyle={{ color: color }}
                    labelFormatter={(_, payload) => payload[0]?.payload.dateLabel || ''}
                  />
                  
                  {threshold && (
                    <ReferenceArea 
                      y1={threshold.min_value} 
                      y2={threshold.max_value} 
                      fill="#ffffff" 
                      fillOpacity={0.03} 
                      stroke="#ffffff"
                      strokeOpacity={0.1}
                    />
                  )}

                  <Line 
                    type="monotone" 
                    dataKey={param} 
                    stroke={color} 
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#09090b', stroke: color, strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: color, stroke: '#000', strokeWidth: 2 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })}
    </div>
  );
}

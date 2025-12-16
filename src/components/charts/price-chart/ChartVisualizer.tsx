import { CardContent } from '@/components/ui/card';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    TooltipProps,
    Legend
} from 'recharts';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import { ChartMode, ChartDataPoint } from './types';

interface ChartVisualizerProps {
    data: ChartDataPoint[];
    isLoading: boolean;
    chartMode: ChartMode;
    ticker: string;
    comparisonTicker: string | null;
    isPositive: boolean;
}

export const ChartVisualizer = ({
    data,
    isLoading,
    chartMode,
    ticker,
    comparisonTicker,
    isPositive
}: ChartVisualizerProps) => {
    // Custom tooltip component with proper typing
    const CustomTooltip = ({
        active,
        payload,
        label,
    }: TooltipProps<ValueType, NameType>) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background border rounded-lg p-3 shadow-lg">
                    <p className="font-medium mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="font-medium">
                                {entry.name};        </span>
                            <span>
                                {chartMode === 'price'
                                    ? `$${Number(entry.value).toFixed(2)}`
                                    : `${Number(entry.value).toFixed(2)}%`
                                }
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <CardContent className="h-[400px] w-full flex flex-col">
            {isLoading ? (
                <div className="h-full flex items-center justify-center">
                    <div className="animate-pulse">Loading chart...</div>
                </div>
            ) : data.length > 0 ? (
                <>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    interval="preserveStartEnd"
                                    minTickGap={50}
                                />
                                <YAxis
                                    domain={['auto', 'auto']}
                                    tick={{ fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    width={60}
                                    tickFormatter={(value) => chartMode === 'price' ? `$${value}` : `${value.toFixed(0)}%`}
                                />
                                <Tooltip content={<CustomTooltip />} />

                                {/* Main Ticker Line */}
                                <Line
                                    type="monotone"
                                    dataKey={chartMode === 'price' ? 'price' : 'normalized'}
                                    name={chartMode === 'price' ? 'Price' : ticker}
                                    stroke={isPositive ? '#10b981' : '#ef4444'}
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 4 }}
                                />

                                {/* Comparison Ticker Line */}
                                {chartMode === 'performance' && comparisonTicker && (
                                    <Line
                                        type="monotone"
                                        dataKey="comparisonNormalized"
                                        name={comparisonTicker}
                                        stroke="#f59e0b" // Amber color for comparison
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 4 }}
                                        connectNulls
                                    />
                                )}

                                {/* Zero line for performance mode */}
                                {chartMode === 'performance' && (
                                    <ReferenceLine
                                        y={0}
                                        stroke="#6b7280"
                                        strokeDasharray="3 3"
                                        strokeOpacity={0.5}
                                    />
                                )}

                                {/* Previous close line for price mode */}
                                {chartMode === 'price' && data.length > 0 && (
                                    <ReferenceLine
                                        y={data[0].price}
                                        stroke="#6b7280"
                                        strokeDasharray="3 3"
                                        strokeOpacity={0.5}
                                    />
                                )}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {comparisonTicker && (
                        <div className="flex items-center justify-center gap-4 mt-4 pt-2 border-t border-border/50">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border">
                                <div className={`w-2.5 h-2.5 rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                <span className="text-xs font-medium">{ticker}</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                <span className="text-xs font-medium text-amber-600 dark:text-amber-400">{comparisonTicker}</span>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                    No data available for this time period
                </div>
            )}
        </CardContent>
    );
};

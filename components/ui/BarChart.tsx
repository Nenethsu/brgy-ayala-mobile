import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DEFAULT_COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#F97316',
];

interface BarChartProps {
  data: Record<string, any>[];
  dataKey: string;
  xAxisKey: string;
  height?: number;
  loading?: boolean;
  colors?: string[];
}

const BarChart = ({
  data = [],
  dataKey,
  xAxisKey,
  height = 180,
  loading = false,
  colors = DEFAULT_COLORS,
}: BarChartProps) => {
  const chartAreaHeight = height - 40; // reserve 40px for x-axis labels

  if (loading) {
    return (
      <View style={{ height }} className="items-center justify-center gap-2">
        <ActivityIndicator color="#0D2B5E" />
        <Text className="text-slate-400 text-xs">Loading chart…</Text>
      </View>
    );
  }

  if (!data.length) {
    return (
      <View style={{ height }} className="items-center justify-center gap-2">
        <Ionicons name="bar-chart-outline" size={28} color="#CBD5E1" />
        <Text className="text-slate-400 text-sm">No data available</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map((d) => Number(d[dataKey]) || 0), 1);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 4 }}
    >
      <View style={{ height }} className="flex-row items-end gap-3">
        {data.map((item, i) => {
          const value = Number(item[dataKey]) || 0;
          const barHeight = Math.max((value / maxValue) * chartAreaHeight, 4);
          const label = String(item[xAxisKey] ?? '');
          const color = colors[i % colors.length];

          return (
            <View key={i} className="items-center gap-1" style={{ width: 48 }}>
              <Text className="text-slate-500 text-[10px] font-semibold">{value}</Text>
              <View
                style={{
                  height: barHeight,
                  width: 28,
                  backgroundColor: color,
                  borderRadius: 4,
                }}
              />
              <Text
                className="text-slate-400 text-[10px] text-center"
                numberOfLines={2}
                style={{ width: 48 }}
              >
                {label.length > 14 ? `${label.slice(0, 12)}…` : label}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

export default BarChart;

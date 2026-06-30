import React from 'react';
import { View, Text } from 'react-native';

type BadgeVariant = 'approved' | 'pending' | 'rejected' | 'ongoing' | 'incoming' | 'ended' | 'cancelled';

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
}

const VARIANT_STYLES: Record<BadgeVariant, { container: string; text: string; dot: string }> = {
  approved:  { container: 'bg-emerald-50 border border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  pending:   { container: 'bg-amber-50 border border-amber-200',     text: 'text-amber-700',   dot: 'bg-amber-500'   },
  rejected:  { container: 'bg-red-50 border border-red-200',         text: 'text-red-700',     dot: 'bg-red-500'     },
  ongoing:   { container: 'bg-teal-50 border border-teal-200',       text: 'text-teal-700',    dot: 'bg-teal-500'    },
  incoming:  { container: 'bg-blue-50 border border-blue-200',       text: 'text-blue-700',    dot: 'bg-blue-500'    },
  ended:     { container: 'bg-slate-100 border border-slate-200',    text: 'text-slate-500',   dot: 'bg-slate-400'   },
  cancelled: { container: 'bg-red-50 border border-red-200',         text: 'text-red-600',     dot: 'bg-red-400'     },
};

const LABELS: Record<BadgeVariant, string> = {
  approved:  'Verified',
  pending:   'Pending',
  rejected:  'Rejected',
  ongoing:   'Ongoing',
  incoming:  'Incoming',
  ended:     'Ended',
  cancelled: 'Cancelled',
};

export const Badge = ({ variant, label }: BadgeProps) => {
  const styles = VARIANT_STYLES[variant];
  return (
    <View className={`flex-row items-center gap-x-1.5 px-2.5 py-1 rounded-full self-start ${styles.container}`}>
      <View className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
      <Text className={`text-xs font-semibold ${styles.text}`}>
        {label ?? LABELS[variant]}
      </Text>
    </View>
  );
};

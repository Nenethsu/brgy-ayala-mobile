import React from 'react';
import { View, Text, TextInput } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import type { FormValues } from '@/types/createCitizen';

const FormSection = ({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) => (
  <Animated.View entering={FadeInDown.delay(delay).duration(400).springify()} className="mx-4 mb-4">
    <Text className="text-xs font-bold text-navy-900 uppercase tracking-widest mb-3 px-1">
      {title}
    </Text>
    <View
      className="bg-white rounded-2xl px-5 pt-5 pb-1 border border-slate-100"
      style={{ shadowColor: '#0D2B5E', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 1 }}
    >
      {children}
    </View>
  </Animated.View>
);

const TextField = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <View className="mb-5">
    <Text className="text-slate-600 text-xs font-semibold uppercase tracking-wider mb-2">
      {label}
    </Text>
    {children}
    {error && <Text className="text-red-500 text-xs mt-1.5">{error}</Text>}
  </View>
);

interface Props {
  control: Control<FormValues>;
  errors: FieldErrors<FormValues>;
}

const ContactInformation = ({ control, errors }: Props) => (
  <FormSection title="Contact Information" delay={120}>
    <Controller
      control={control}
      name="email"
      rules={{
        pattern: {
          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: 'Enter a valid email address',
        },
      }}
      render={({ field: { onChange, value } }) => (
        <TextField label="Email" error={errors.email?.message}>
          <View
            className={`flex-row items-center border rounded-xl bg-slate-50 ${
              errors.email ? 'border-red-300' : 'border-slate-200'
            }`}
          >
            <View className="pl-4">
              <Ionicons name="mail-outline" size={18} color="#94A3B8" />
            </View>
            <TextInput
              className="flex-1 px-3 py-3.5 text-slate-800 text-base"
              placeholder="juan@example.com (optional)"
              placeholderTextColor="#CBD5E1"
              value={value}
              onChangeText={onChange}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
          </View>
        </TextField>
      )}
    />

    <Controller
      control={control}
      name="mobileNumber"
      rules={{
        pattern: {
          value: /^9\d{9}$/,
          message: 'Enter a valid PH number (e.g. 9171234567)',
        },
      }}
      render={({ field: { onChange, value } }) => (
        <TextField label="Mobile Number" error={errors.mobileNumber?.message}>
          <View
            className={`flex-row items-center border rounded-xl bg-slate-50 ${
              errors.mobileNumber ? 'border-red-300' : 'border-slate-200'
            }`}
          >
            <View className="pl-4 pr-3 border-r border-slate-200 py-3.5">
              <Text className="text-slate-600 text-base font-semibold">+63</Text>
            </View>
            <TextInput
              className="flex-1 px-3 py-3.5 text-slate-800 text-base"
              placeholder="9171234567 (optional)"
              placeholderTextColor="#CBD5E1"
              value={value}
              onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, 10))}
              keyboardType="number-pad"
              maxLength={10}
            />
          </View>
        </TextField>
      )}
    />
  </FormSection>
);

export default ContactInformation;
import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import {
  Control,
  Controller,
  FieldErrors,
  UseFormSetValue,
  useWatch,
} from 'react-hook-form';
import { useAuthStore } from '../../../../store/authStore';
import { DropdownField } from '../../../../components/ui/DropdownField';
import { DISTRICTS, SUFFIXES } from '../../../../constants/districts';
import {
  useGetInhabitants,
  useGetCitizenTypes,
  useGetClassifications,
} from '../../../../lib/hooks/useContent';
import FormValues  from '../types';

const SUFFIX_OPTIONS = SUFFIXES.map((s) => ({ id: s.id, name: s.name }));
const DISTRICT_OPTIONS = DISTRICTS.filter((d) => d.id >= 1).map((d) => ({ id: d.id, name: d.name }));
const GENDER_OPTIONS = [
  { id: '0', name: 'Male' },
  { id: '1', name: 'Female' },
];

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
  setValue: UseFormSetValue<FormValues>;
}

const PersonalInformationSection = ({ control, errors, setValue }: Props) => {
  const { user } = useAuthStore();
  const selectedCitizenType = useWatch({ control, name: 'citizenType' });

  const { data: inhabitants, isLoading: inhabitantsLoading } = useGetInhabitants();
  const { data: citizenTypes, isLoading: citizenTypesLoading } = useGetCitizenTypes();
  const { data: classifications, isLoading: classificationsLoading } = useGetClassifications(
    selectedCitizenType ? Number(selectedCitizenType) : undefined,
  );

  const cityOption = user?.cityId ? [{ id: user.cityId, name: user.cityId }] : [];
  const brgyOption = user?.brgyId ? [{ id: user.brgyId, name: user.brgyId }] : [];

  return (
    <FormSection title="Personal Information" delay={60}>
      <Controller
        control={control}
        name="firstName"
        rules={{
          required: 'First name is required',
          pattern: { value: /^[a-zA-Z\s\-']+$/, message: 'Letters only' },
        }}
        render={({ field: { onChange, value } }) => (
          <TextField label="First Name *" error={errors.firstName?.message}>
            <TextInput
              className={`border rounded-xl px-4 py-3.5 text-slate-800 text-base bg-slate-50 ${
                errors.firstName ? 'border-red-300' : 'border-slate-200'
              }`}
              placeholder="e.g. Juan"
              placeholderTextColor="#CBD5E1"
              value={value}
              onChangeText={onChange}
              autoCapitalize="words"
            />
          </TextField>
        )}
      />

      <Controller
        control={control}
        name="middleName"
        rules={{ pattern: { value: /^[a-zA-Z\s\-']*$/, message: 'Letters only' } }}
        render={({ field: { onChange, value } }) => (
          <TextField label="Middle Name" error={errors.middleName?.message}>
            <TextInput
              className="border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 text-base bg-slate-50"
              placeholder="e.g. Santos (optional)"
              placeholderTextColor="#CBD5E1"
              value={value}
              onChangeText={onChange}
              autoCapitalize="words"
            />
          </TextField>
        )}
      />

      <Controller
        control={control}
        name="lastName"
        rules={{
          required: 'Last name is required',
          pattern: { value: /^[a-zA-Z\s\-']+$/, message: 'Letters only' },
        }}
        render={({ field: { onChange, value } }) => (
          <TextField label="Last Name *" error={errors.lastName?.message}>
            <TextInput
              className={`border rounded-xl px-4 py-3.5 text-slate-800 text-base bg-slate-50 ${
                errors.lastName ? 'border-red-300' : 'border-slate-200'
              }`}
              placeholder="e.g. Dela Cruz"
              placeholderTextColor="#CBD5E1"
              value={value}
              onChangeText={onChange}
              autoCapitalize="words"
            />
          </TextField>
        )}
      />

      <Controller
        control={control}
        name="suffix"
        render={({ field: { onChange, value } }) => (
          <DropdownField
            label="Suffix"
            value={value}
            options={SUFFIX_OPTIONS}
            onChange={(v) => onChange(String(v))}
            placeholder="None"
          />
        )}
      />

      <Controller
        control={control}
        name="birthdate"
        rules={{
          required: 'Birthdate is required',
          pattern: {
            value: /^\d{4}-\d{2}-\d{2}$/,
            message: 'Use format YYYY-MM-DD (e.g. 1990-06-15)',
          },
          validate: (v) => {
            const d = new Date(v);
            return d < new Date() || 'Birthdate cannot be in the future';
          },
        }}
        render={({ field: { onChange, value } }) => (
          <TextField label="Birthdate * (YYYY-MM-DD)" error={errors.birthdate?.message}>
            <TextInput
              className={`border rounded-xl px-4 py-3.5 text-slate-800 text-base bg-slate-50 font-mono ${
                errors.birthdate ? 'border-red-300' : 'border-slate-200'
              }`}
              placeholder="1990-06-15"
              placeholderTextColor="#CBD5E1"
              value={value}
              onChangeText={onChange}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
            />
          </TextField>
        )}
      />

      <Controller
        control={control}
        name="sex"
        rules={{ required: 'Gender is required' }}
        render={({ field: { onChange, value } }) => (
          <View className="mb-5">
            <Text className="text-slate-600 text-xs font-semibold uppercase tracking-wider mb-2">
              Gender *
            </Text>
            <View className="flex-row gap-x-3">
              {GENDER_OPTIONS.map((g) => {
                const selected = value === g.id;
                return (
                  <TouchableOpacity
                    key={g.id}
                    onPress={() => onChange(g.id)}
                    className={`flex-1 flex-row items-center justify-center py-3.5 rounded-xl border ${
                      selected ? 'bg-navy-900 border-navy-900' : 'bg-white border-slate-200'
                    }`}
                  >
                    <Ionicons
                      name={g.id === '0' ? 'male' : 'female'}
                      size={16}
                      color={selected ? '#1877E8' : '#94A3B8'}
                    />
                    <Text className={`ml-2 font-semibold text-sm ${selected ? 'text-white' : 'text-slate-500'}`}>
                      {g.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {errors.sex && (
              <Text className="text-red-500 text-xs mt-1.5">{errors.sex.message}</Text>
            )}
          </View>
        )}
      />

      <DropdownField
        label="City / Municipality"
        value={user?.cityId ?? ''}
        options={cityOption}
        onChange={() => {}}
        disabled
        placeholder="Not available"
      />

      <DropdownField
        label="Barangay"
        value={user?.brgyId ?? ''}
        options={brgyOption}
        onChange={() => {}}
        disabled
        placeholder="Not available"
      />

      <Controller
        control={control}
        name="district"
        render={({ field: { onChange, value } }) => (
          <DropdownField
            label="District"
            value={value}
            options={DISTRICT_OPTIONS}
            onChange={(v) => onChange(String(v))}
            placeholder="Select district"
            error={errors.district?.message}
          />
        )}
      />

      {/* <Controller
        control={control}
        name="inhabitantType"
        render={({ field: { onChange, value } }) => (
          <DropdownField
            label="Inhabitant Type"
            value={value}
            options={(inhabitants ?? []).map((i) => ({ id: i.id, name: i.name }))}
            onChange={(v) => onChange(String(v))}
            placeholder="Select inhabitant type"
            isLoading={inhabitantsLoading}
            error={errors.inhabitantType?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="citizenType"
        rules={{ required: 'Citizen type is required' }}
        render={({ field: { onChange, value } }) => (
          <DropdownField
            label="Citizen Type *"
            value={value}
            options={(citizenTypes ?? []).map((t) => ({ id: t.id, name: t.name }))}
            onChange={(v) => {
              onChange(String(v));
              setValue('citizenTypeClassification', '');
            }}
            placeholder="Select citizen type"
            isLoading={citizenTypesLoading}
            error={errors.citizenType?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="citizenTypeClassification"
        render={({ field: { onChange, value } }) => (
          <DropdownField
            label="Citizen Classification"
            value={value}
            options={(classifications ?? []).map((c) => ({ id: c.id, name: c.name }))}
            onChange={(v) => onChange(String(v))}
            placeholder={selectedCitizenType ? 'Select classification' : 'Select Citizen Type first'}
            isLoading={classificationsLoading}
            disabled={!selectedCitizenType}
            error={errors.citizenTypeClassification?.message}
          />
        )}
      /> */}
    </FormSection>
  );
};

export default PersonalInformationSection;
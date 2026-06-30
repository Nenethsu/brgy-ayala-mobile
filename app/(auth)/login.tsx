import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { loginApi, getProfileApi } from '../../lib/api/authApi';
import { useAuthStore } from '../../store/authStore';
import type { LoginPayload } from '../../types/auth';

const LoginScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setAuth, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPayload>({ defaultValues: { email: '', password: '' } });

  const onSubmit = async (data: LoginPayload) => {
    setIsLoading(true);
    try {
      const tokens = await loginApi(data);
      setAuth(tokens.accessToken, tokens.refreshToken);
      // Fetch profile in background — not blocking navigation
      getProfileApi().then(setUser).catch(() => {});
      router.replace('/(app)/citizens');
    } catch (error: any) {
      Alert.alert(
        'Sign In Failed',
        error?.response?.data?.message ?? 'Invalid credentials. Please try again.',
        [{ text: 'OK' }],
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: 'white' }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* ── Brand Section ── */}
        <Animated.View
          entering={FadeIn.delay(100).duration(600)}
          style={{ paddingTop: insets.top + 48 }}
          className="items-center pb-10 px-8"
        >
          {/* DigiBarangay platform logo — place logo.png in assets/images/ */}
          <View
          >
            <Image
              source={require('../../assets/images/logo.png')}
              style={{ width: 192, height: 114 }}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* ── Login Card ── */}
        <Animated.View
          entering={FadeInDown.delay(250).duration(500).springify()}
          className="bg-white rounded-t-3xl flex-1 px-8 pt-10 pb-8"
          style={{ minHeight: 420 }}
        >
          <Text className="text-navy-900 text-2xl font-bold mb-1">Sign In</Text>
          <Text className="text-slate-400 text-sm mb-8">
            Enter your credentials to continue
          </Text>

          {/* Email */}
          <View className="mb-4">
            <Text className="text-slate-600 text-xs font-semibold uppercase tracking-wider mb-2">
              Email
            </Text>
            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email address',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  className={`flex-row items-center border rounded-xl px-4 h-14 bg-slate-50 ${
                    errors.email ? 'border-red-300' : 'border-slate-200'
                  }`}
                >
                  <Ionicons name="mail-outline" size={18} color="#94A3B8" />
                  <TextInput
                    className="flex-1 ml-3 text-slate-800 text-base"
                    placeholder="admin@barangay.gov.ph"
                    placeholderTextColor="#CBD5E1"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              )}
            />
            {errors.email && (
              <Text className="text-red-500 text-xs mt-1.5">{errors.email.message}</Text>
            )}
          </View>

          {/* Password */}
          <View className="mb-8">
            <Text className="text-slate-600 text-xs font-semibold uppercase tracking-wider mb-2">
              Password
            </Text>
            <Controller
              control={control}
              name="password"
              rules={{ required: 'Password is required' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  className={`flex-row items-center border rounded-xl px-4 h-14 bg-slate-50 ${
                    errors.password ? 'border-red-300' : 'border-slate-200'
                  }`}
                >
                  <Ionicons name="lock-closed-outline" size={18} color="#94A3B8" />
                  <TextInput
                    className="flex-1 ml-3 text-slate-800 text-base"
                    placeholder="Enter your password"
                    placeholderTextColor="#CBD5E1"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((p) => !p)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.password && (
              <Text className="text-red-500 text-xs mt-1.5">{errors.password.message}</Text>
            )}
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            activeOpacity={0.85}
            className="bg-navy-900 rounded-2xl h-14 items-center justify-center"
            style={{
              shadowColor: '#0D2B5E',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-base font-bold tracking-wide">Sign In</Text>
            )}
          </TouchableOpacity>

          <Text
            className="text-slate-300 text-xs text-center mt-8"
            style={{ paddingBottom: insets.bottom }}
          >
            DigiBarangay · v1.0.0
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default LoginScreen;

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Corner from '../scanner/scannerScreen/components/Corner';
import ScanBeam from '../scanner/scannerScreen/components/ScanBeam';
import { ScannerBackButton } from '@/components/ui/ScannerBackButton';
import { useGetCitizenById } from '@/lib/hooks/useCitizens';
import { FRAME_SIZE } from '@/constants/scanner';

const CitizenScannerScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedId, setScannedId] = useState<string | null>(null);
  const cooldownRef = useRef(false);
  const navigatedRef = useRef(false);

  const {
    data: citizen,
    isLoading,
    isError,
    isSuccess,
  } = useGetCitizenById(scannedId ?? undefined);

  // Navigate to citizen detail on successful lookup
  useEffect(() => {
    if (isSuccess && citizen && scannedId && !navigatedRef.current) {
      navigatedRef.current = true;
      router.replace(`/(app)/citizens/${scannedId}`);
    }
  }, [isSuccess, citizen, scannedId]);

  // Auto-reset after failed lookup so the camera can scan again
  useEffect(() => {
    if (isError && scannedId) {
      const t = setTimeout(() => {
        setScannedId(null);
        cooldownRef.current = false;
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [isError, scannedId]);

  const handleScan = useCallback(({ data }: { data: string }) => {
    if (cooldownRef.current) return;
    cooldownRef.current = true;
    setScannedId(data.trim());
  }, []);

  // ── Permission: loading ───────────────────────────────────────────────────────
  if (!permission) {
    return (
      <View className="flex-1 bg-[#080F1E] items-center justify-center">
        <Animated.View entering={FadeIn} className="items-center">
          <Ionicons name="camera-outline" size={48} color="#475569" />
          <Text className="text-slate-400 text-sm mt-3">Loading camera…</Text>
        </Animated.View>
      </View>
    );
  }

  // ── Permission: denied ────────────────────────────────────────────────────────
  if (!permission.granted) {
    return (
      <View className="flex-1 bg-[#080F1E] items-center justify-center px-8">
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute items-center justify-center"
          style={{ top: insets.top + 8, left: 20 }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>

        <Animated.View entering={FadeIn.duration(500)} className="items-center">
          <View className="w-24 h-24 rounded-full bg-navy-900 items-center justify-center mb-6">
            <MaterialCommunityIcons name="camera-off-outline" size={44} color="#1877E8" />
          </View>
          <Text className="text-white text-xl font-bold text-center mb-2">
            Camera Access Required
          </Text>
          <Text className="text-slate-400 text-sm text-center mb-8 leading-6">
            Allow camera access to scan citizen QR codes
          </Text>
          <TouchableOpacity
            onPress={requestPermission}
            className="bg-gold-500 rounded-2xl px-10 py-4"
          >
            <Text className="text-white font-bold text-base">Grant Access</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  // ── Main scanner UI ───────────────────────────────────────────────────────────
  return (
    <View className="flex-1 bg-[#080F1E]">
      {/* Camera — keep style prop; CameraView doesn't support className */}
      <CameraView
        style={StyleSheet.absoluteFill}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={!scannedId ? handleScan : undefined}
      />

      {/* Dark overlay with clear QR frame */}
      <View className="absolute inset-0" pointerEvents="none">
        <View className="flex-1 bg-[rgba(8,15,30,0.65)]" />
        <View className="flex-row" style={{ height: FRAME_SIZE }}>
          <View className="flex-1 bg-[rgba(8,15,30,0.65)]" />
          <View style={{ width: FRAME_SIZE, height: FRAME_SIZE }}>
            <Corner position="tl" />
            <Corner position="tr" />
            <Corner position="bl" />
            <Corner position="br" />
            {!scannedId && <ScanBeam />}
          </View>
          <View className="flex-1 bg-[rgba(8,15,30,0.65)]" />
        </View>
        <View className="flex-1 bg-[rgba(8,15,30,0.65)]" />
      </View>

      {/* Top bar with back button */}
      <View
        className="flex-row items-center gap-3 px-5 pb-4"
        style={{ paddingTop: insets.top + 12 }}
      >
        <ScannerBackButton />
        <View>
          <Text className="text-white font-bold text-[15px]">Scan Citizen QR</Text>
          <Text className="text-white/50 text-xs mt-0.5">
            Point camera at citizen's QR code
          </Text>
        </View>
      </View>

      {/* Centre hint */}
      <View
        className="absolute left-0 right-0"
        style={{ top: '50%', marginTop: FRAME_SIZE / 2 + 16 }}
        pointerEvents="none"
      >
        <Text className="text-white/50 text-sm text-center px-8">
          Align QR code within the frame
        </Text>
      </View>

      {/* Loading — looking up citizen */}
      {isLoading && (
        <Animated.View
          entering={FadeIn.duration(150)}
          className="absolute bottom-10 left-5 right-5"
          pointerEvents="none"
        >
          <View className="bg-white/10 rounded-2xl px-5 py-4 flex-row items-center gap-4">
            <ActivityIndicator color="white" size="small" />
            <Text className="text-white font-semibold text-sm">Looking up citizen…</Text>
          </View>
        </Animated.View>
      )}

      {/* Error — QR doesn't match any citizen */}
      {isError && (
        <Animated.View
          entering={FadeInDown.duration(200)}
          className="absolute bottom-10 left-5 right-5"
          pointerEvents="none"
        >
          <View className="bg-red-500 rounded-2xl px-5 py-4 flex-row items-center gap-4">
            <View className="w-10 h-10 rounded-full bg-red-400 items-center justify-center shrink-0">
              <Ionicons name="person-remove-outline" size={20} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-base">Citizen Not Found</Text>
              <Text className="text-white/80 text-sm mt-0.5">
                QR code does not match any registered citizen
              </Text>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

export default CitizenScannerScreen;
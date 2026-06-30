import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { useLocalSearchParams } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useGetEvents, useScanAttendee } from "../../../../lib/hooks/useEvents";
import { ScanResultOverlay } from "../../../../features/scanner/ScanResultOverlay";
import {
  formatEventSchedule,
  getEventCategory,
  isOngoing,
  getEventId,
} from "../../../../features/events/eventHelpers";
import type { BrgyEvent } from "../../../../types/event";
import ScanBeam from "./components/ScanBeam";
import Corner from "./components/Corner";
import EventPickerModal from "./components/EventPickerModal";
import { ScannerBackButton } from "@/components/ui/ScannerBackButton";
import { COOLDOWN_MS, FRAME_SIZE } from "@/constants/scanner";

const ScannerScreen = () => {
  const { from: _from } = useLocalSearchParams<{
    from?: "events" | "citizens";
  }>();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const { data: events = [], isLoading: eventsLoading } = useGetEvents();

  const ongoingEvents = useMemo(() => events.filter(isOngoing), [events]);

  const [selectedEvent, setSelectedEvent] = useState<BrgyEvent | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [scanResult, setScanResult] = useState<{
    type: "success" | "error" | "idle";
    message: string;
  }>({
    type: "idle",
    message: "",
  });

  const cooldownRef = useRef(false);

  const { mutate: scanAttendee } = useScanAttendee(
    selectedEvent ? getEventId(selectedEvent) : null,
  );

  useEffect(() => {
    if (ongoingEvents.length > 0 && !selectedEvent) {
      setSelectedEvent(ongoingEvents[0]);
    }
  }, [ongoingEvents]);

  const handleScan = useCallback(
    ({ data }: { data: string }) => {
      if (cooldownRef.current || !selectedEvent) return;
      cooldownRef.current = true;

      const eventId = getEventId(selectedEvent);
      scanAttendee(
        { eventId, citizenId: [data] },
        {
          onSuccess: (result) => {
            setScanResult({
              type: "success",
              message:
                result?.message ?? `Citizen ${data} checked in successfully.`,
            });
          },
          onError: (err: any) => {
            setScanResult({
              type: "error",
              message:
                err?.response?.data?.message ??
                "Scan failed. Please try again.",
            });
          },
        },
      );

      setTimeout(() => {
        cooldownRef.current = false;
      }, COOLDOWN_MS);
    },
    [selectedEvent, scanAttendee],
  );

  // ── Permission gate ──────────────────────────────────────────────────────────
  if (!permission) {
    return (
      <View className="flex-1 bg-[#080F1E] items-center justify-center">
        <Animated.View entering={FadeIn}>
          <Ionicons name="camera-outline" size={48} color="#475569" />
          <Text className="text-slate-400 text-sm mt-3">Loading camera…</Text>
        </Animated.View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-[#080F1E] items-center justify-center px-8">
        <View className="absolute" style={{ top: insets.top + 8, left: 20 }}>
          <ScannerBackButton />
        </View>
        <Animated.View entering={FadeIn.duration(500)} className="items-center">
          <View className="w-24 h-24 rounded-full bg-navy-900 items-center justify-center mb-6">
            <MaterialCommunityIcons
              name="camera-off-outline"
              size={44}
              color="#1877E8"
            />
          </View>
          <Text className="text-white text-xl font-bold text-center mb-2">
            Camera Access Required
          </Text>
          <Text className="text-slate-400 text-sm text-center mb-8 leading-6">
            Allow camera access to scan QR codes for event check-in
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

  // ── Main scanner UI ──────────────────────────────────────────────────────────
  return (
    <View className="flex-1 bg-[#080F1E]">
      {/* Camera */}
      <CameraView
        style={StyleSheet.absoluteFill}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={selectedEvent ? handleScan : undefined}
      />

      {/* Dark overlay with clear QR zone */}
      <View className="absolute inset-0" pointerEvents="none">
        <View className="flex-1 bg-[rgba(8,15,30,0.65)]" />
        <View className="flex-row" style={{ height: FRAME_SIZE }}>
          <View className="flex-1 bg-[rgba(8,15,30,0.65)]" />
          <View style={{ width: FRAME_SIZE, height: FRAME_SIZE }}>
            <Corner position="tl" />
            <Corner position="tr" />
            <Corner position="bl" />
            <Corner position="br" />
            <ScanBeam />
          </View>
          <View className="flex-1 bg-[rgba(8,15,30,0.65)]" />
        </View>
        <View className="flex-1 bg-[rgba(8,15,30,0.65)]" />
      </View>

      {/* Top bar — back button + event selector */}
      <View
        style={{ paddingTop: insets.top + 12 }}
        className="flex-row items-start gap-3 px-5 pb-4"
      >
        <ScannerBackButton />
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          className="flex-1"
        >
          {selectedEvent ? (
            <TouchableOpacity
              onPress={() => setShowPicker(true)}
              className="bg-white/10 backdrop-blur rounded-2xl px-4 py-3.5 border border-white/10"
            >
              <View className="flex-row items-center">
                <View className="flex-1">
                  <View className="flex-row items-center mb-0.5">
                    <View className="w-2 h-2 rounded-full bg-teal-400 mr-2" />
                    <Text className="text-teal-400 text-xs font-bold uppercase tracking-widest">
                      Ongoing
                    </Text>
                  </View>
                  <Text
                    className="text-white font-bold text-[15px]"
                    numberOfLines={1}
                  >
                    {selectedEvent.name}
                  </Text>
                  <Text className="text-white/50 text-xs mt-0.5">
                    {formatEventSchedule(selectedEvent)} ·{" "}
                    {selectedEvent.location}
                  </Text>
                </View>
                <View className="flex-row items-center ml-2">
                  {ongoingEvents.length > 1 && (
                    <Text className="text-white/40 text-xs mr-1.5">
                      {ongoingEvents.length}
                    </Text>
                  )}
                  <Ionicons
                    name="chevron-down"
                    size={16}
                    color="rgba(255,255,255,0.5)"
                  />
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setShowPicker(true)}
              className="bg-white/10 rounded-2xl px-4 py-4 border border-white/10 items-center"
            >
              <Ionicons name="calendar-outline" size={20} color="#94A3B8" />
              <Text className="text-slate-400 text-sm mt-1.5">
                {eventsLoading ? "Loading events…" : "No ongoing events"}
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>

      {/* Center hint */}
      <View
        className="absolute left-0 right-0 items-center"
        style={{ top: '50%', marginTop: FRAME_SIZE / 2 + 16 }}
        pointerEvents="none"
      >
        <Text className="text-white/50 text-sm text-center px-8">
          {selectedEvent
            ? "Point camera at citizen QR code"
            : "Select an ongoing event to start scanning"}
        </Text>
        {selectedEvent && (
          <View className="flex-row items-center mt-2">
            <Ionicons
              name="people-outline"
              size={12}
              color="rgba(255,255,255,0.3)"
            />
            <Text className="text-white/30 text-xs ml-1">
              {getEventCategory(selectedEvent)}
            </Text>
          </View>
        )}
      </View>

      {/* Bottom stats strip */}
      {selectedEvent && (
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          className="absolute left-5 right-5"
          style={{ bottom: insets.bottom + 80 }}
        >
          <View className="bg-white/10 rounded-2xl px-5 py-3 flex-row border border-white/10">
            {[
              {
                label: "Remaining",
                value: selectedEvent.noSlotLimit ? "∞" : selectedEvent.remSlot,
              },
              {
                label: "Total Slots",
                value: selectedEvent.noSlotLimit
                  ? "No limit"
                  : selectedEvent.totalSlot,
              },
            ].map((stat, i) => (
              <View
                key={stat.label}
                className={`flex-1 items-center ${i > 0 ? "border-l border-white/10" : ""}`}
              >
                <Text className="text-white font-bold text-lg">
                  {stat.value}
                </Text>
                <Text className="text-white/40 text-xs">{stat.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      )}

      {/* Scan result overlay */}
      <ScanResultOverlay
        type={scanResult.type}
        message={scanResult.message}
        onHide={() => setScanResult({ type: "idle", message: "" })}
      />

      {/* Event picker modal */}
      <EventPickerModal
        visible={showPicker}
        events={ongoingEvents}
        selectedId={selectedEvent ? getEventId(selectedEvent) : null}
        onSelect={setSelectedEvent}
        onClose={() => setShowPicker(false)}
      />
    </View>
  );
}

export default ScannerScreen;

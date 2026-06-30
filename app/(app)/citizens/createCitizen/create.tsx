import React, { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import { useAddCitizen } from "../../../../lib/hooks/useCitizens";
import PersonalInformationSection from "./components/PersonalInformationSection";
import ContactInformation from "./components/ContactInformation";
import AccountCredentials from "./components/AccountCredentials";
import type { FormValues } from "@/types/createCitizen";

// ─── Screen ───────────────────────────────────────────────────────────────────

const CreateCitizenScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { mutate: addCitizen, isPending } = useAddCitizen();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      middleName: "",
      suffix: "",
      birthdate: "",
      sex: "",
      district: "",
      inhabitantType: "",
      citizenType: "",
      citizenTypeClassification: "",
      email: "",
      mobileNumber: "",
      username: "",
    },
  });

  const confirmExit = useCallback(() => {
    if (!isDirty) { router.back(); return; }
    Alert.alert(
      'Discard Changes?',
      'You have unsaved changes. Are you sure you want to go back?',
      [
        { text: 'Stay', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => router.back() },
      ],
    );
  }, [isDirty, router]);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        confirmExit();
        return true;
      });
      return () => sub.remove();
    }, [confirmExit]),
  );

  const onSubmit = (data: FormValues) => {
    const fd = new FormData();
    fd.append('firstName', data.firstName.trim());
    fd.append('lastName', data.lastName.trim());
    if (data.middleName.trim()) fd.append('middleName', data.middleName.trim());
    if (data.suffix) fd.append('suffix', data.suffix);
    fd.append('birthdate', data.birthdate.trim());
    fd.append('sex', data.sex);
    fd.append('type', data.citizenType);
    if (data.district) fd.append('district', data.district);
    if (data.inhabitantType) fd.append('inhabitantType', data.inhabitantType);
    if (data.citizenTypeClassification) fd.append('classification', data.citizenTypeClassification);
    if (data.email.trim()) fd.append('email', data.email.trim());
    if (data.mobileNumber.trim()) fd.append('mobileNumber', data.mobileNumber.trim());
    fd.append('username', data.username.trim());

    addCitizen(fd, {
      onSuccess: (citizen) => {
        console.log('[CreateCitizen] success:', citizen);
        Alert.alert(
          "Citizen Registered",
          `${data.firstName} ${data.lastName} has been successfully registered.`,
          [
            {
              text: "View Profile",
              onPress: () => router.replace(`/(app)/citizens/${citizen.accountId}`),
            },
            {
              text: "Add Another",
              onPress: () => router.replace("/(app)/citizens/createCitizen/create"),
            },
          ],
        );
      },
      onError: (err: any) => {
        console.log('[CreateCitizen] error:', err?.response?.data ?? err);
        Alert.alert(
          "Registration Failed",
          err?.response?.data?.message ??
            "An error occurred. Please check your inputs and try again.",
        );
      },
    });
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 bg-slate-50">
        {/* Header */}
        <View
          className="bg-navy-900 px-5 pb-5"
          style={{ paddingTop: insets.top + 12 }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <TouchableOpacity
                onPress={confirmExit}
                className="mr-3 w-9 h-9 items-center justify-center rounded-full"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="chevron-back" size={20} color="white" />
              </TouchableOpacity>
              <View>
                <Text className="text-white text-xl font-bold">Register Citizen</Text>
                <Text className="text-white/50 text-xs mt-0.5">Fill in all required fields</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isPending}
              className="px-5 py-2.5 rounded-full flex-row items-center border border-white"
              style={{ opacity: isPending ? 0.7 : 1 }}
            >
              {isPending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={16} color="white" />
                  <Text className="text-white font-bold text-sm ml-1">Save</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingTop: 20, paddingBottom: insets.bottom + 48 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <PersonalInformationSection control={control} errors={errors} setValue={setValue} />
          <ContactInformation control={control} errors={errors} />
          <AccountCredentials control={control} errors={errors} />

          {/* Submit */}
          <View className="mx-4 mt-2">
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isPending}
              activeOpacity={0.85}
              className="bg-navy-900 rounded-2xl h-14 items-center justify-center flex-row"
              style={{
                shadowColor: "#0D2B5E",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.25,
                shadowRadius: 12,
                elevation: 6,
                opacity: isPending ? 0.7 : 1,
              }}
            >
              {isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="person-add-outline" size={20} color="white" />
                  <Text className="text-white text-base font-bold ml-2">Register Citizen</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default CreateCitizenScreen;

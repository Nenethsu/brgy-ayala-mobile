import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { differenceInYears, format, parseISO } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { useGetCitizenById, useUploadCitizenSignature, useUploadCitizenFile } from '../../../lib/hooks/useCitizens';
import type { OtherInfo } from '../../../types/citizen';

// ─── Layout constants ─────────────────────────────────────────────────────────

const HERO_H = 268;
const BAR_BASE = 56;
const AVATAR_LG = 74;
const AVATAR_SM = 34;

const fmtDate = (d?: string | null) => {
  if (!d) return null;
  try { return format(parseISO(d), 'MMM d, yyyy'); } catch { return d; }
};

const statusVariant = (s?: string) =>
  s === 'APPROVED' ? 'approved' as const
    : s === 'PENDING' ? 'pending' as const
    : 'rejected' as const;

// ─── Field row primitives ─────────────────────────────────────────────────────

const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
  <View className="flex-row items-center py-[15px] border-b border-[#F1F5F9]">
    <Text className="text-[#94A3B8] text-[13.5px] leading-[18px] w-32 shrink-0">
      {label}
    </Text>
    <Text
      className="flex-1 text-[#1E293B] text-[13.5px] font-medium leading-[18px] text-right"
      numberOfLines={2}
    >
      {value || '—'}
    </Text>
  </View>
);

const InfoRow2Col = ({
  left,
  right,
}: {
  left: { label: string; value?: string | null };
  right: { label: string; value?: string | null };
}) => (
  <View className="flex-row items-start py-[14px] border-b border-[#F1F5F9]">
    <View className="flex-1 pr-3">
      <Text className="text-[#94A3B8] text-[11.5px] mb-[3px]">{left.label}</Text>
      <Text className="text-[#1E293B] text-[13.5px] font-medium" numberOfLines={1}>
        {left.value || '—'}
      </Text>
    </View>
    <View className="w-px self-stretch bg-[#E2E8F0] my-0.5" />
    <View className="flex-1 pl-3">
      <Text className="text-[#94A3B8] text-[11.5px] mb-[3px]">{right.label}</Text>
      <Text className="text-[#1E293B] text-[13.5px] font-medium" numberOfLines={1}>
        {right.value || '—'}
      </Text>
    </View>
  </View>
);

const BirthdateRow = ({ birthdate, age }: { birthdate?: string; age: number | null }) => (
  <View className="flex-row items-center py-[15px] border-b border-[#F1F5F9]">
    <Text className="text-[#94A3B8] text-[13.5px] leading-[18px] w-32 shrink-0">
      Birthdate
    </Text>
    <View className="flex-1 flex-row items-center justify-end gap-2">
      <Text className="text-[#1E293B] text-[13.5px] font-medium leading-[18px] text-right">
        {fmtDate(birthdate) || '—'}
      </Text>
      {age != null && (
        <View className="bg-[rgba(13,43,94,0.08)] px-[9px] py-0.5 rounded-full">
          <Text className="text-[#0D2B5E] text-[11px] font-bold">{age}y</Text>
        </View>
      )}
    </View>
  </View>
);

const SectionLabel = ({ title }: { title: string }) => (
  <View className="flex-row items-center px-5 pt-[30px] pb-1 gap-2">
    <View className="w-[3px] h-[14px] rounded-sm bg-[#1877E8]" />
    <Text className="text-[#0D2B5E] text-[10.5px] font-extrabold tracking-[1.3px] uppercase">
      {title}
    </Text>
    <View className="flex-1 h-px bg-[#E2E8F0] ml-1" />
  </View>
);

// ─── Signature HTML ───────────────────────────────────────────────────────────

const SIGNATURE_HTML = `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
  html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#F8FAFC;}
  canvas{display:block;width:100%;height:100%;touch-action:none;}
</style>
</head>
<body>
<canvas id="sig"></canvas>
<script>
(function(){
  var c=document.getElementById('sig'),ctx=c.getContext('2d');
  var drawing=false,hasContent=false;
  function setup(){ctx.strokeStyle='#000000';ctx.lineWidth=2.5;ctx.lineCap='round';ctx.lineJoin='round';}
  function resize(){
    var snap=hasContent?c.toDataURL():null;
    c.width=window.innerWidth;c.height=window.innerHeight;setup();
    if(snap){var img=new Image();img.onload=function(){ctx.drawImage(img,0,0);};img.src=snap;}
  }
  resize();window.addEventListener('resize',resize);
  function pos(e){var r=c.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
  c.addEventListener('touchstart',function(e){e.preventDefault();var p=pos(e.touches[0]);ctx.beginPath();ctx.moveTo(p.x,p.y);drawing=true;},{passive:false});
  c.addEventListener('touchmove',function(e){e.preventDefault();if(!drawing)return;var p=pos(e.touches[0]);ctx.lineTo(p.x,p.y);ctx.stroke();hasContent=true;},{passive:false});
  c.addEventListener('touchend',function(e){e.preventDefault();drawing=false;},{passive:false});
  function onMsg(e){
    if(e.data==='clear'){ctx.clearRect(0,0,c.width,c.height);hasContent=false;}
    else if(e.data==='save'){
      if(!hasContent){window.ReactNativeWebView.postMessage(JSON.stringify({type:'empty'}));}
      else{window.ReactNativeWebView.postMessage(JSON.stringify({type:'ok',data:c.toDataURL('image/png')}));}
    }
  }
  document.addEventListener('message',onMsg);window.addEventListener('message',onMsg);
})();
</script>
</body>
</html>`;

// ─── Signature Modal ──────────────────────────────────────────────────────────

interface SignatureModalProps {
  visible: boolean;
  isSaving: boolean;
  onSave: (b64: string) => void;
  onClose: () => void;
}

const SignatureModal = ({ visible, isSaving, onSave, onClose }: SignatureModalProps) => {
  const insets = useSafeAreaInsets();
  const webRef = useRef<WebView>(null);

  const inject = (cmd: string) =>
    webRef.current?.injectJavaScript(`window.postMessage('${cmd}','*');true;`);

  const handleMessage = useCallback((e: any) => {
    try {
      const { type, data } = JSON.parse(e.nativeEvent.data);
      if (type === 'empty') {
        Alert.alert('Empty signature', 'Please draw your signature before confirming.');
      } else if (type === 'ok') {
        const pure = data.replace(/^data:image\/\w+;base64,/, '');
        onSave(pure);
      }
    } catch {
      Alert.alert('Error', 'Could not read signature. Please try again.');
    }
  }, [onSave]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl" style={{ paddingBottom: insets.bottom + 8 }}>
          <View className="items-center pt-3 pb-1">
            <View className="w-10 h-1 rounded-full bg-slate-200" />
          </View>

          <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
            <View>
              <Text className="text-navy-900 text-base font-bold">Draw Signature</Text>
              <Text className="text-slate-400 text-xs mt-0.5">
                Use your finger to sign in the box below
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
            >
              <Ionicons name="close" size={16} color="#000000" />
            </TouchableOpacity>
          </View>

          <View
            className="mx-4 border border-slate-200 rounded-2xl"
            style={{ height: 260, backgroundColor: '#F8FAFC' }}
          >
            <WebView
              ref={webRef}
              source={{ html: SIGNATURE_HTML }}
              onMessage={handleMessage}
              javaScriptEnabled
              originWhitelist={['*']}
              scrollEnabled={false}
              bounces={false}
              style={{ flex: 1, backgroundColor: '#F8FAFC', borderRadius: 16 }}
            />
          </View>

          <Text className="text-center text-slate-400 text-xs mt-3 mb-4">
            Sign within the box above
          </Text>

          <View className="flex-row items-center gap-3 px-4">
            <TouchableOpacity
              onPress={() => inject('clear')}
              disabled={isSaving}
              activeOpacity={0.7}
              className="flex-1 h-12 rounded-2xl border border-slate-200 flex-row items-center justify-center gap-2"
            >
              <Ionicons name="refresh-outline" size={16} color="#000000" />
              <Text className="text-slate-600 font-semibold text-sm">Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => inject('save')}
              disabled={isSaving}
              activeOpacity={0.85}
              className="flex-[2] h-12 rounded-2xl bg-navy-900 flex-row items-center justify-center gap-2"
              style={{ opacity: isSaving ? 0.7 : 1 }}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={16} color="white" />
                  <Text className="text-white font-bold text-sm">Confirm Signature</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─── Doc Camera Modal ─────────────────────────────────────────────────────────

interface DocCameraModalProps {
  visible: boolean;
  isUploading: boolean;
  label: string;
  onCapture: (uri: string) => void;
  onClose: () => void;
}

const DocCameraModal = ({ visible, isUploading, label, onCapture, onClose }: DocCameraModalProps) => {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('back');

  const capture = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
    if (photo?.uri) onCapture(photo.uri);
  };

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#000', paddingTop: insets.top }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
          <TouchableOpacity
            onPress={onClose}
            disabled={isUploading}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={{ flex: 1, color: 'white', fontSize: 16, fontWeight: '700', textAlign: 'center' }}>
            {label}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {!permission?.granted ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
            <Ionicons name="camera-outline" size={52} color="rgba(255,255,255,0.4)" />
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 8, textAlign: 'center' }}>
              Camera Access Needed
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 28 }}>
              Allow camera access to photograph the document
            </Text>
            <TouchableOpacity
              onPress={requestPermission}
              style={{ backgroundColor: '#1877E8', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
            >
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>Grant Access</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <CameraView ref={cameraRef} facing={facing} style={{ flex: 1 }} />
            <View style={{ backgroundColor: '#000', paddingTop: 24, paddingBottom: insets.bottom + 20, paddingHorizontal: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Flip */}
              <TouchableOpacity
                onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}
                disabled={isUploading}
                style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons name="camera-reverse-outline" size={22} color="white" />
              </TouchableOpacity>
              {/* Shutter */}
              <TouchableOpacity
                onPress={capture}
                disabled={isUploading}
                style={{ width: 76, height: 76, borderRadius: 38, borderWidth: 3, borderColor: 'rgba(255,255,255,0.45)', alignItems: 'center', justifyContent: 'center' }}
              >
                <View style={{ width: 62, height: 62, borderRadius: 31, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }}>
                  {isUploading && <ActivityIndicator color="#0D2B5E" />}
                </View>
              </TouchableOpacity>
              <View style={{ width: 48 }} />
            </View>
          </>
        )}
      </View>
    </Modal>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────

const CitizenDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: citizen, isLoading, isError } = useGetCitizenById(id);
  const { mutate: uploadSignature, isPending: isSavingSig } = useUploadCitizenSignature(id ?? '');
  const { mutate: uploadFile, isPending: isUploadingFile } = useUploadCitizenFile(id ?? '');

  const [sigModalVisible, setSigModalVisible] = useState(false);
  const [capturedSigB64, setCapturedSigB64] = useState<string | null>(null);
  const [camModalVisible, setCamModalVisible] = useState(false);
  const [uploadingField, setUploadingField] = useState<'identification' | 'document' | null>(null);

  const BAR_H = insets.top + BAR_BASE;
  const COLLAPSE = HERO_H - BAR_H;

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => { scrollY.value = e.contentOffset.y; },
  });

  const otherInfo = React.useMemo<OtherInfo>(() => {
    if (!citizen?.otherInfo) return {};
    try { return JSON.parse(citizen.otherInfo); } catch { return {}; }
  }, [citizen?.otherInfo]);

  const fullName = citizen
    ? [citizen.firstName, citizen.middleName, citizen.lastName, citizen.suffix]
        .filter(Boolean).join(' ')
    : '';

  const initials = citizen
    ? `${citizen.firstName.charAt(0)}${citizen.lastName.charAt(0)}`.toUpperCase()
    : '—';

  const age = citizen?.birthdate
    ? differenceInYears(new Date(), parseISO(citizen.birthdate))
    : null;

  const sexLabel = citizen?.sex === 0 ? 'Male' : citizen?.sex === 1 ? 'Female' : null;

  const profileIdFile = citizen?.files?.find(f => f.type === 'PROFILE_ID' && f.isDeleted === '0');
  const documentFile = citizen?.files?.find(f => f.type === 'PROFILE_DOCUMENT' && f.isDeleted === '0');
  const signatureFile = citizen?.files?.find(f => f.type === 'PROFILE_SIGNATURE' && f.isDeleted === '0');
  const sigUri = capturedSigB64
    ? `data:image/png;base64,${capturedSigB64}`
    : signatureFile
    ? `${process.env.EXPO_PUBLIC_BASE_URL}/${signatureFile.image}`
    : null;

  const handleSignatureSave = useCallback((b64: string) => {
    uploadSignature(b64, {
      onSuccess: () => {
        setCapturedSigB64(b64);
        setSigModalVisible(false);
        Alert.alert('Saved', 'Signature has been saved successfully.');
      },
      onError: (err: any) => {
        Alert.alert(
          'Failed',
          err?.response?.data?.message ?? 'Could not save signature. Please try again.',
        );
      },
    });
  }, [uploadSignature]);

  const openDocCamera = useCallback((field: 'identification' | 'document') => {
    setUploadingField(field);
    setCamModalVisible(true);
  }, []);

  const handleDocUpload = useCallback((uri: string) => {
    if (!uploadingField) return;
    uploadFile({ fieldName: uploadingField, uri }, {
      onSuccess: () => {
        setCamModalVisible(false);
        setUploadingField(null);
        Alert.alert('Uploaded', 'Document has been uploaded successfully.');
      },
      onError: (err: any) => {
        Alert.alert(
          'Failed',
          err?.response?.data?.message ?? 'Could not upload document. Please try again.',
        );
      },
    });
  }, [uploadingField, uploadFile]);

  // ── Animated styles ─────────────────────────────────────────────────────────

  const headerHeightStyle = useAnimatedStyle(() => ({
    height: interpolate(scrollY.value, [0, COLLAPSE], [HERO_H, BAR_H], Extrapolation.CLAMP),
  }));

  const heroStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, COLLAPSE * 0.55], [1, 0], Extrapolation.CLAMP),
    transform: [{
      translateY: interpolate(scrollY.value, [0, COLLAPSE], [0, -14], Extrapolation.CLAMP),
    }],
  }));

  const compactStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [COLLAPSE * 0.4, COLLAPSE], [0, 1], Extrapolation.CLAMP),
  }));

  // ── Guards ──────────────────────────────────────────────────────────────────

  if (isLoading) return <LoadingState message="Loading profile…" />;
  if (isError)
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Failed to load"
        subtitle="Unable to fetch citizen record."
      />
    );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <View className="flex-1 bg-[#0D2B5E]">

      {/* Collapsing sticky header */}
      <Animated.View
        className="absolute top-0 left-0 right-0 z-10 bg-[#0D2B5E] overflow-hidden"
        style={headerHeightStyle}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
          className="absolute left-2 z-20 flex-row items-center min-h-[44px] px-2"
          style={{ top: insets.top + 7 }}
        >
          <Ionicons name="chevron-back" size={20} color="white" />
        </Pressable>

        {/* Expanded hero */}
        <Animated.View
          className="absolute bottom-[22px] left-0 right-0 items-center"
          style={heroStyle}
        >
          <View
            style={{ width: AVATAR_LG, height: AVATAR_LG, borderRadius: AVATAR_LG / 2 }}
            className="bg-[rgba(24,119,232,0.13)] border-2 border-[#1877E8] items-center justify-center mb-[13px]"
          >
            <Text className="text-[#3D9AEF] text-2xl font-bold">{initials}</Text>
          </View>
          <Text
            className="text-white text-lg font-bold text-center mb-1 px-8 leading-[26px]"
            numberOfLines={2}
          >
            {fullName}
          </Text>
          <Text className="text-white text-[11.5px] tracking-[0.5px] mb-[11px]">
            {citizen?.idNumber}
          </Text>
          <View className="self-center">
            <Badge variant={statusVariant(citizen?.status)} />
          </View>
        </Animated.View>

        {/* Compact bar */}
        <Animated.View
          className="absolute left-[52px] right-3 flex-row items-center gap-[10px]"
          style={[{ top: insets.top, height: BAR_BASE }, compactStyle]}
        >
          <View className="flex-1 min-w-0 items-end">
            <Text className="text-white text-xs font-semibold leading-5" numberOfLines={1}>
              {fullName}
            </Text>
            <Text className="text-white text-[11px] tracking-[0.3px] mt-px" numberOfLines={1}>
              {citizen?.idNumber}
            </Text>
          </View>
          <View
            style={{ width: AVATAR_SM + 4, height: AVATAR_SM + 4, borderRadius: (AVATAR_SM + 4) / 2 }}
            className="bg-[rgba(24,119,232,0.18)] border-[1.5px] border-[#1877E8] items-center justify-center shrink-0"
          >
            <Text className="text-[#3D9AEF] text-xs font-bold">{initials}</Text>
          </View>
        </Animated.View>
      </Animated.View>

      {/* Scrollable content */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        bounces
        className="bg-[#F8FAFC]"
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View style={{ height: HERO_H }} />

        <View className="bg-[#F8FAFC] rounded-t-3xl -mt-6 overflow-hidden pt-4">
          {citizen && (
            <>
              {/* Personal Information */}
              <SectionLabel title="Personal Information" />
              <View className="px-5 pt-1">
                <InfoRow label="First Name" value={citizen.firstName} />
                <InfoRow label="Middle Name" value={citizen.middleName} />
                <InfoRow label="Last Name" value={citizen.lastName} />
                {citizen.suffix ? <InfoRow label="Suffix" value={citizen.suffix} /> : null}
                <BirthdateRow birthdate={citizen.birthdate} age={age} />
                <InfoRow2Col
                  left={{ label: 'Sex', value: sexLabel }}
                  right={{ label: 'Blood Type', value: otherInfo.bloodType }}
                />
                <InfoRow2Col
                  left={{ label: 'Birthplace', value: otherInfo.birthplace }}
                  right={{ label: 'Civil Status', value: otherInfo.civilStatus }}
                />
                <InfoRow2Col
                  left={{ label: 'Citizenship', value: otherInfo.citizenship }}
                  right={{ label: 'Occupation', value: otherInfo.occupation }}
                />
              </View>

              {/* Contact Information */}
              <SectionLabel title="Contact Information" />
              <View className="px-5 pt-1">
                <InfoRow label="Mobile" value={citizen.primaryMobile} />
                <InfoRow label="Email" value={citizen.primaryEmail} />
                <InfoRow label="Address" value={otherInfo.address} />
                <InfoRow2Col
                  left={{ label: 'Contact Person', value: otherInfo.contactPerson }}
                  right={{ label: 'Contact #', value: otherInfo.contactPersonNumber }}
                />
              </View>

              {/* Government IDs */}
              <SectionLabel title="Government IDs" />
              <View className="px-5 pt-1">
                <InfoRow label="SSS Number" value={otherInfo.sssNumber} />
                <InfoRow label="PhilHealth" value={otherInfo.philhealthNumber} />
                <InfoRow label="Pag-IBIG" value={otherInfo.pagibigNumber} />
                <InfoRow label="TIN" value={otherInfo.tinNumber} />
                <InfoRow label="Precinct #" value={otherInfo.precinct} />
              </View>

              {/* Record Details */}
              <SectionLabel title="Record Details" />
              <View className="px-5 pt-1">
                <InfoRow label="Account ID" value={citizen.accountId} />
                <InfoRow label="ID Number" value={citizen.idNumber} />
                <InfoRow label="Username" value={citizen.username} />
                <InfoRow label="District" value={citizen.district ? `District ${citizen.district}` : null} />
                <InfoRow label="Citizen Type" value={citizen.typeName} />
                <InfoRow label="Classification" value={citizen.classificationName} />
                <InfoRow label="Inhabitant Type" value={citizen.inhabitantName} />
                <InfoRow label="Date Issued" value={fmtDate(otherInfo.dateIssued)} />
                <InfoRow label="Date Created" value={fmtDate(citizen.dateCreated)} />
                <InfoRow label="Last Updated" value={fmtDate(citizen.dateUpdated)} />
              </View>

              {/* Documents */}
              <SectionLabel title="Documents" />
              <View className="px-5 pt-3 pb-2 gap-3">

                {/* ── Profile ID ── */}
                {profileIdFile ? (
                  <View className="bg-white rounded-2xl overflow-hidden border border-slate-100" style={{ elevation: 1, shadowColor: '#0D2B5E', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 }}>
                    <View>
                      <Image source={{ uri: `${process.env.EXPO_PUBLIC_BASE_URL}/${profileIdFile.image}` }} style={{ width: '100%', height: 150 }} resizeMode="cover" />
                    </View>
                    <View className="flex-row items-center px-4 py-3 border-t border-slate-100">
                      <View className="flex-1">
                        <Text className="text-[#1E293B] text-xs font-semibold">Profile ID Document</Text>
                        <Text className="text-[#94A3B8] text-[10px] mt-0.5">Uploaded {fmtDate(profileIdFile.dateCreated)}</Text>
                      </View>
                      <TouchableOpacity onPress={() => openDocCamera('identification')} activeOpacity={0.75} className="flex-row items-center gap-1.5 bg-slate-100 px-3 py-2 rounded-xl">
                        <Ionicons name="camera-outline" size={13} color="#475569" />
                        <Text className="text-slate-600 text-xs font-semibold">Re-upload</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity onPress={() => openDocCamera('identification')} activeOpacity={0.85}>
                    <View style={{ borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#E2E8F0', borderRadius: 16, backgroundColor: '#FAFBFC' }}>
                      <View className="flex-row items-center gap-4 px-5 py-4">
                        <View className="w-11 h-11 rounded-xl bg-slate-100 items-center justify-center">
                          <Ionicons name="card-outline" size={22} color="#94A3B8" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-[#1E293B] text-sm font-semibold">Profile ID Document</Text>
                          <Text className="text-slate-400 text-xs mt-0.5">No file uploaded yet</Text>
                        </View>
                        <View className="bg-[#0D2B5E] px-3 py-2 rounded-xl">
                          <Text className="text-white text-xs font-bold">Upload</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}

                {/* ── Document ── */}
                {documentFile ? (
                  <View className="bg-white rounded-2xl overflow-hidden border border-slate-100" style={{ elevation: 1, shadowColor: '#0D2B5E', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 }}>
                    <View>
                      <Image source={{ uri: `${process.env.EXPO_PUBLIC_BASE_URL}/${documentFile.image}` }} style={{ width: '100%', height: 150 }} resizeMode="cover" />
                    </View>
                    <View className="flex-row items-center px-4 py-3 border-t border-slate-100">
                      <View className="flex-1">
                        <Text className="text-[#1E293B] text-xs font-semibold">Document</Text>
                        <Text className="text-[#94A3B8] text-[10px] mt-0.5">Uploaded {fmtDate(documentFile.dateCreated)}</Text>
                      </View>
                      <TouchableOpacity onPress={() => openDocCamera('document')} activeOpacity={0.75} className="flex-row items-center gap-1.5 bg-slate-100 px-3 py-2 rounded-xl">
                        <Ionicons name="camera-outline" size={13} color="#475569" />
                        <Text className="text-slate-600 text-xs font-semibold">Re-upload</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity onPress={() => openDocCamera('document')} activeOpacity={0.85}>
                    <View style={{ borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#E2E8F0', borderRadius: 16, backgroundColor: '#FAFBFC' }}>
                      <View className="flex-row items-center gap-4 px-5 py-4">
                        <View className="w-11 h-11 rounded-xl bg-slate-100 items-center justify-center">
                          <Ionicons name="document-text-outline" size={22} color="#94A3B8" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-[#1E293B] text-sm font-semibold">Document</Text>
                          <Text className="text-slate-400 text-xs mt-0.5">No file uploaded yet</Text>
                        </View>
                        <View className="bg-[#0D2B5E] px-3 py-2 rounded-xl">
                          <Text className="text-white text-xs font-bold">Upload</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}

                {/* ── Signature ── */}
                {sigUri ? (
                  <View className="bg-white rounded-2xl overflow-hidden border border-slate-100" style={{ elevation: 1, shadowColor: '#0D2B5E', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 }}>
                    <View style={{ backgroundColor: '#FAFBFC', paddingTop: 20, paddingBottom: 20, paddingHorizontal: 16, position: 'relative' }}>
                      <View style={{ position: 'absolute', bottom: 24, left: 24, right: 24, height: 1, backgroundColor: '#E2E8F0' }} />
                      <Image source={{ uri: sigUri }} style={{ width: '100%', height: 100 }} resizeMode="contain" />
                      <View style={{ position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F0FDF4', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 }}>
                        <Ionicons name="checkmark-circle" size={11} color="#16a34a" />
                        <Text style={{ color: '#15803d', fontSize: 10, fontWeight: '700' }}>Signed</Text>
                      </View>
                    </View>
                    <View className="flex-row items-center px-4 py-3 border-t border-slate-100">
                      <View className="flex-1">
                        <Text className="text-[#1E293B] text-xs font-semibold">Signature</Text>
                        {signatureFile && <Text className="text-[#94A3B8] text-[10px] mt-0.5">Signed {fmtDate(signatureFile.dateCreated)}</Text>}
                      </View>
                      <TouchableOpacity onPress={() => setSigModalVisible(true)} activeOpacity={0.75} className="flex-row items-center gap-1.5 bg-slate-100 px-3 py-2 rounded-xl">
                        <Ionicons name="create-outline" size={13} color="#475569" />
                        <Text className="text-slate-600 text-xs font-semibold">Re-sign Now</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity onPress={() => setSigModalVisible(true)} activeOpacity={0.85}>
                    <View style={{ borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#E2E8F0', borderRadius: 16, backgroundColor: '#FAFBFC' }}>
                      <View className="flex-row items-center gap-4 px-5 py-4">
                        <View className="w-11 h-11 rounded-xl bg-slate-100 items-center justify-center">
                          <Ionicons name="create-outline" size={22} color="#94A3B8" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-[#1E293B] text-sm font-semibold">Signature</Text>
                          <Text className="text-slate-400 text-xs mt-0.5">No signature captured yet</Text>
                        </View>
                        <View className="bg-[#0D2B5E] px-3 py-2 rounded-xl">
                          <Text className="text-white text-xs font-bold">Sign Now</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}

              </View>

              <View className="h-5" />
            </>
          )}
        </View>
      </Animated.ScrollView>

      <SignatureModal
        visible={sigModalVisible}
        isSaving={isSavingSig}
        onSave={handleSignatureSave}
        onClose={() => setSigModalVisible(false)}
      />
      <DocCameraModal
        visible={camModalVisible}
        isUploading={isUploadingFile}
        label={uploadingField === 'identification' ? 'Profile ID Document' : 'Document'}
        onCapture={handleDocUpload}
        onClose={() => { if (!isUploadingFile) { setCamModalVisible(false); setUploadingField(null); } }}
      />
    </View>
  );
};

export default CitizenDetailScreen;

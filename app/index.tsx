import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/authStore';
import { ONBOARDING_DONE_KEY } from './(auth)/onboarding';

const Index = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const onboardingDone = await AsyncStorage.getItem(ONBOARDING_DONE_KEY);

      if (cancelled) return;

      if (!onboardingDone) {
        router.replace('/(auth)/onboarding');
        return;
      }

      if (isAuthenticated) {
        router.replace('/(app)/citizens');
      } else {
        router.replace('/(auth)/login');
      }
    };

    // Small defer so Expo Router's root layout has mounted
    const timer = setTimeout(bootstrap, 80);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isAuthenticated]);

  return null;
}

export default Index;

// Slide id doubles as the key for the illustration factory in OnboardingSlide.tsx
export type SlideId = 'splash' | 'community' | 'events' | 'records';

export interface Slide {
  id: SlideId;
  /** Short uppercase tag displayed above the headline */
  tag: string;
  /** Two-line headline — use \n for the break */
  headline: string;
  /** 1–2 sentence supporting copy tied to a real citizen-service use case */
  subtext: string;
  /** Slide background (hex) */
  bg: string;
  /** Primary accent colour: icon fill, button, active dot, tag text (hex) */
  accent: string;
  /** Light tint of accent: halos, decorative shapes (hex) */
  accentLight: string;
}

export const SLIDES: Slide[] = [
  {
    id: 'splash',
    tag: 'Welcome to',
    headline: 'DigiBarangay',
    subtext: 'Your official digital platform — fast, paperless, and always with you.',
    bg: '#EEF4FF',
    accent: '#1877E8',
    accentLight: '#93B8F5',
  },
  {
    id: 'community',
    tag: 'Your Community',
    headline: 'Your Barangay,\nAt Your Fingertips',
    subtext:
      'Request certificates, verify your residency, and stay informed about local announcements — without ever queuing at the hall.',
    bg: '#EEF4FF',
    accent: '#1877E8',
    accentLight: '#93B8F5',
  },
  {
    id: 'events',
    tag: 'Community Events',
    headline: 'Check In With\nA Single Scan',
    subtext:
      'Show your unique QR code at barangay events. Attendance is logged instantly — no paper forms, no waiting in line.',
    bg: '#EEF4FF',
    accent: '#1877E8',
    accentLight: '#93B8F5',
  },
  {
    id: 'records',
    tag: 'Citizen Records',
    headline: 'Your Records,\nAlways Accurate',
    subtext:
      'Your household profile, documents, and application history are maintained by your barangay and ready whenever you need them.',
    bg: '#EEF4FF',
    accent: '#1877E8',
    accentLight: '#93B8F5',
  },
];

export type VideoProvider = "heygen" | "d-id" | "synthesia";

export interface AvatarConfig {
  id: string;
  provider: VideoProvider;
  providerAvatarIdEnv: string;
  name: string;
  presentation: "professional" | "formal";
  description: string;
  approvalRequired: boolean;
}

export interface VoiceConfig {
  id: string;
  provider: "provider-managed";
  providerVoiceIdEnv: string;
  name: string;
  language: "en-US";
  speed: number;
  pitch: number;
  approvalRequired: boolean;
}

export const avatarConfigs: AvatarConfig[] = [
  { id: "avatar_professional_male_1", provider: "heygen", providerAvatarIdEnv: "HEYGEN_AVATAR_FOUNDER", name: "Founder presentation avatar", presentation: "professional", description: "Approved leadership avatar placeholder for founder scripts.", approvalRequired: true },
  { id: "avatar_professional_female_1", provider: "heygen", providerAvatarIdEnv: "HEYGEN_AVATAR_SECURITY_LEAD", name: "Security presentation avatar", presentation: "professional", description: "Approved avatar placeholder for cybersecurity scripts.", approvalRequired: true },
  { id: "avatar_professional_male_2", provider: "heygen", providerAvatarIdEnv: "HEYGEN_AVATAR_COMPLIANCE_LEAD", name: "Compliance presentation avatar", presentation: "professional", description: "Approved avatar placeholder for compliance scripts.", approvalRequired: true },
  { id: "avatar_professional_male_3", provider: "heygen", providerAvatarIdEnv: "HEYGEN_AVATAR_SUPPORT_LEAD", name: "Support presentation avatar", presentation: "professional", description: "Approved avatar placeholder for support operations scripts.", approvalRequired: true },
  { id: "avatar_professional_male_4", provider: "heygen", providerAvatarIdEnv: "HEYGEN_AVATAR_VIP_LEAD", name: "VIP presentation avatar", presentation: "formal", description: "Approved avatar placeholder for VIP desk scripts.", approvalRequired: true },
  { id: "avatar_professional_male_5", provider: "heygen", providerAvatarIdEnv: "HEYGEN_AVATAR_PROPERTY_LEAD", name: "Property presentation avatar", presentation: "professional", description: "Approved avatar placeholder for property-risk scripts.", approvalRequired: true },
  { id: "avatar_professional_male_6", provider: "heygen", providerAvatarIdEnv: "HEYGEN_AVATAR_BUSINESS_LEAD", name: "Business development avatar", presentation: "professional", description: "Approved avatar placeholder for business-development scripts.", approvalRequired: true },
];

export const voiceConfigs: VoiceConfig[] = [
  { id: "voice_professional_male_us", provider: "provider-managed", providerVoiceIdEnv: "VIDEO_VOICE_MALE_US", name: "Professional US voice", language: "en-US", speed: 1, pitch: 0, approvalRequired: true },
  { id: "voice_professional_female_us", provider: "provider-managed", providerVoiceIdEnv: "VIDEO_VOICE_FEMALE_US", name: "Professional US voice", language: "en-US", speed: 1, pitch: 0, approvalRequired: true },
];

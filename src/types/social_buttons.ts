import type EmailTemplate from '@/types/email_template'

export enum SocialType {
  GitHub = 'github',
  Home = 'home',
  HireMe = 'hire-me',
  LinkedIn = 'linkedin',
};

export interface ISocialButton {
  title: string;
  to: string|EmailTemplate;
  icon: string[];
};

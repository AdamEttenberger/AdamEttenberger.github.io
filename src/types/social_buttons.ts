import type EmailTemplate from '@/types/email_template'

export enum SocialType {
  About = 'about',
  GitHub = 'github',
  HireMe = 'hire-me',
  LinkedIn = 'linkedin',
};

export interface ISocialButton {
  title: string;
  to: string|EmailTemplate;
  icon: string[];
};

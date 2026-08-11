import type EmailTemplate from '@/types/email_template'

export enum SocialType {
  GitHub = 'github',
  HireMe = 'hire-me',
  LinkedIn = 'linkedin',
};

export interface ISocialButton {
  type: SocialType;
  title: string;
  to: string|EmailTemplate;
  icon: string[];
};

import { SocialType, type ISocialButton } from '@/types/social_buttons'
import EmailTemplate from '@/types/email_template'

export const EmailFeedback = new EmailTemplate('feedback@adamettenberger.com', '[Privacy|Security] <[High|Medium|Low]:Severity>, <Concern>');
export const EmailHiring = new EmailTemplate('hire-me@adamettenberger.com','[Hiring] <Company>, <Position>, <Location>, <Remote|Hybrid|Office>, <Salary Range>');

export const SocialButtonList: Record<SocialType, ISocialButton> = {
  [SocialType.Home]: {
    title: "Home",
    to: "/",
    icon: ['fas', 'house'],
  },
  [SocialType.GitHub]: {
    title: "GitHub",
    to: "https://github.com/AdamEttenberger/",
    icon: ['fab', 'github'],
  },
  [SocialType.HireMe]: {
    title: "E-mail, hire me!",
    to: EmailHiring,
    icon: ['fas', 'envelope'],
  },
  [SocialType.LinkedIn]: {
    title: "LinkedIn",
    to: "https://www.linkedin.com/in/adamettenberger/",
    icon: ['fab', 'linkedin-in'],
  },
};
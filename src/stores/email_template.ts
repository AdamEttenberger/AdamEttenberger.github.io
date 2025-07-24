import { defineStore } from 'pinia'
import EmailTemplate from '@/types/email_template'

export const useEmailTemplateStore = defineStore('email-templates', () => {
  const feedback = new EmailTemplate('feedback@adamettenberger.com', '[Privacy|Security] <[High|Medium|Low]:Severity>, <Concern>');
  const hiring = new EmailTemplate('hire-me@adamettenberger.com','[Hiring] <Company>, <Position>, <Location>, <Remote|Hybrid|Office>, <Salary Range>');

  return {
    feedback,
    hiring,
  }
})

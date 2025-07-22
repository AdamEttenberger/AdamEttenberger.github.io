import { defineStore } from 'pinia'
import EmailTemplate from '@/types/email_template'

export const emailTemplateStore = defineStore('email-templates', {
  state: () => ({
    hiring: new EmailTemplate('hire-me@adamettenberger.com', '[Hiring] <Company>, <Position>, <Location>, <Remote|Hybrid|Office>, <Salary Range>'),
    feedback: new EmailTemplate('feedback@adamettenberger.com', '[Privacy|Security] <[High|Medium|Low]:Severity>, <Concern>'),
  }),
})

<script setup lang="ts">
import Button from '@/components/button.vue'
import Code from '@/components/code.vue'
import Column from '@/components/column.vue'
import EmailLink from '@/components/email_link.vue'
import ExternalLink from '@/components/external_link.vue'
import Section from '@/components/section.vue'
import Quote from '@/components/quote.vue'
import SettingsButton from '@/components/settings_button.vue'
import { emailTemplateStore } from '@/stores/email_template_store'

const emails = emailTemplateStore();
</script>

<template>
  <Column>
    <Section heading="Disclaimer">
      <p>
        The materials on this website are not intended to be, nor should they be interpreted as, a legally binding contract or agreement.
        Please consider I am not a lawyer, and this website is a personal project which produces no income.
      </p>
      <br />
      <div class="section-quote centered max">
        <Quote name="Adam Ettenberger">( Please don't sue me. )</Quote>
      </div>
    </Section>

    <Section heading="Summary">
      <p>
        I strongly believe that privacy is a fundamental human right.
        As such I will never use this website to collect private user information beyond what's required to operate the website.
        Raw telemetry data collected by this website will never by sold and will never be shared unless required to operate the website or compelled by applicable laws or a warrant.
        Anonymized aggregate date, including but not limited to "(annual || monthly) visitors" or "(most || least) popular (page || game)", may either be shared on this website upon reaching significant milestones or while interviewing with potential employers.
      </p>
    </Section>

    <Section heading="Feedback">
      <p>
        If you believe I do not meet this standard and have feedback that is both specific and actionable, please use the following email template including as much detail as possible and I will attempt to mitigate or resolve concerns in a timely manner.
      </p>
      <br />
      <Button class="feedback" :mailto="emails.feedback" />
      <br />
      <p>
        Reasons may include, but are not limited to:
      </p>
      <br />
      <ul>
        <li>A security vulnerability, weakness, or code flaw was found in the <ExternalLink to="https://github.com/AdamEttenberger/AdamEttenberger.github.io">Github repo</ExternalLink>.</li>
        <li>A dependency of this project is found to be critically insecure or could inadvertently leak user information.</li>
        <li>Error messages are displayed on the page or in console output.</li>
        <li>Behavior on the website is an anti-pattern, please include its common name or reasoning.</li>
        <li>Contents of this website have been found elsewhere.</li>
        <li>You believe someone may be impersonating me, or you received any unsolicited digital communication from someone claiming to be myself in a context where that would be unusual.</li>
        <li>You found a link on this website that is dead, stale, misdirected, or otherwise not working as intended.</li>
      </ul>
    </Section>

    <Section heading="Email Policy">
      <p>
        The email domain "@adamettenberger.com" will only be used for receiving and responding to inquiries and feedback.
        The email domain will <b>never</b> be used for unsolicited contact.
        Should you choose to send an email to any "@adamettenberger.com" address, information shared will be treated as confidential and will not be shared beyond the requirements to facilitate communication through relevant third-party email services, or when compelled by applicable laws or a warrant.
      </p>
      <br />
      <p>
        Should you choose to send an email to any "@adamettenberger.com" address, your email address will not be used to include you in any mailing list(s).
      </p>
      <br />
      <p>
        If you're a company hiring manager or recruiter seeking to hire me through the alias <EmailLink :mailto="emails.hiring" />, I will aim to respond within 1-5 business days.
      </p>
      <br />
      <p>
        If you raise a concern through the alias <EmailLink :mailto="emails.feedback" />, I will aim to respond only when necessary and within 1-5 business days depending on the severity of the concern.
      </p>
      <br />
      <p>
        Unless given express written consent through an email, any  email address will not be used for any other purpose.
      </p>
    </Section>

    <Section heading="Third-party Processing">
      <p>
        This website is hosted by <ExternalLink to="https://pages.github.com/">GitHub Pages</ExternalLink>, and therefore handling of traffic to this website is subject to their terms and conditions, including but not limited to applicable data handling, retention, and privacy policies.
      </p>
      <br />
      <p>
        Any emails sent to or from this domain name ("@adamettenberger.com") are processed by a third-party proxy service and hosted by a third-party email service, in part to aid with filtering potential spam and malware and are subject to their terms and conditions, including but not limited to applicable data handling, retention, and privacy policies.
      </p>
    </Section>

    <Section heading="First-party Analytics">
      <p>
        This website would like to collect some anonymized telemetry using a self-hosted instance of <ExternalLink to="https://plausible.io/self-hosted-web-analytics">Plausible Community Edition</ExternalLink>, a website analytics tool which claims to be General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA) compliant by not using cookies, only sending anonymized data, and doesn't support cross-domain or cross-device user tracking.
        The server which hosts the analytics platform, and both collects and processes telemetry, is located within the United States of America (USA).
      </p>
      <br />
      <p>
        Should you consent to first-party [metrics, telemetry, analytics, data collection], any data collected will be treated with care and only ever shared in aggregate form.
        Examples of "aggregate form" include but are not limited to; "(annual || monthly) visitors", "(most || least) popular (page || game)".
        Data collected will <b>NEVER</b> be sold or shared with advertisers.
        Data collected will only be used for the purpose of making informed decisions about the website, or for sharing in aggregated form as mentioned.
      </p>
      <br />
      <p>
        If you selected "Ok" on the dialog shown to new visitors at the top of the page, you have consented to collecting first-party analytics data.
        If you would like to change your selection, you may do so by visiting "/settings" by pressing the <SettingsButton class="inline-button" /> near the top of the page.
      </p>
      <br />
      <p>
        Following is an example of what a first-party analytics event should look like:
      </p>
      <br />
      <Code lang="javascript"
            caption="Example of a first-party analytics API call."
            text="https://data.adamettenberger.com/api/event" />
    </Section>
  </Column>
</template>

<style scoped>
.max,
.feedback {
  width: max-content;
}

.small {
  font-size: smaller;
}

.inline-button {
  display: inline;
  width: 2rem;
  vertical-align: sub;
}

.section-quote {
  border: 3px solid var(--color-divider);
  padding: var(--size-padding-round) calc(var(--size-padding-round) * 2);
  border-radius: var(--size-border-radius);
}
</style>

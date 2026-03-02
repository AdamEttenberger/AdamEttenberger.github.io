<script setup lang="ts">
import Button from '@/components/buttons/button.vue'
import CodeMirror from '@/components/code-mirror.vue'
import Link from '@/components/link.vue'
import Quote from '@/components/quote.vue'
import Section from '@/components/section.vue'
import SettingsButton from '@/components/buttons/settings.vue'
import { EmailFeedback, EmailHiring } from '@/content/socials'
</script>

<template>
  <article>
    <Section heading="Disclaimer">
      <p>
        The materials on this website are not intended to be, nor should they be interpreted as, a legally binding contract or agreement.
        Please consider I am not a lawyer, and this website is a personal project which produces no income.
      </p>
      <div class="section-quote centered max round">
        <Quote name="Adam Ettenberger">( Please don't sue me. )</Quote>
      </div>
    </Section>

    <Section heading="Summary">
      <p>
        I strongly believe that privacy is a fundamental human right.
        This website will not be used to collect private user information beyond what's required to operate the website.
      </p>
      <p>
        However, <b>with your consent</b>, the website would like to collect some information regarding which pages receive traffic.
        Setting aside privacy laws, integrating page tracking as an opt-in feature was important to me because it's plausible to correlate "spontaneous" traffic with an individual or organization.
        While this information would provide valuable insights into website traffic, it's technically not essential for the website to operate.
      </p>
      <p>
        This website isn't concerned with "who" in particular is visiting, only a rough gauge of website performance such as which pages receive traffic, how many pages were visited before leaving or refreshing the website, the bounce (navigating away from a page within 10 seconds) rate for articles to help identify issues, first and largest page load/paint latency, coarse geolocation information, and any feedback you may have on an any articles or demos which include a feedback mechanism (either some form of voting button, or pre-selected statements).
      </p>
      <p>
        Raw telemetry data collected by this website will never by sold, and data collected will never be shared beyond the extent required to operate the website and process the data collected, or if compelled by applicable laws or a warrant.
        Anonymized aggregate date, including but not limited to "(annual || monthly) visitors" or "(most || least) popular (page || game)", may either be shared on this website upon reaching significant milestones or while interviewing with potential employers.
      </p>
      <p>
        Additionally <b>with your consent</b>, this website will store your consent selections and website preferences in browser local storage, to re-apply after reloading or visiting the app again from the same device.
        As a bonus feature, if a user has multiple instances of this website open within the same browser and device, then the browser local storage events paired with reactive bindings enables automatic synchronization of preferences between tabs.
      </p>
    </Section>

    <Section heading="Feedback">
      <p>
        If you believe I do not meet this standard and have feedback that is both specific and actionable, please use the following email template including as much detail as possible and I will attempt to mitigate or resolve concerns in a timely manner.
      </p>
      <Button class="centered feedback" :to="EmailFeedback" />
      <p>
        Reasons may include, but are not limited to:
      </p>
      <ul>
        <li>A security vulnerability, weakness, or code flaw was found in the <Link to="https://github.com/AdamEttenberger/AdamEttenberger.github.io">Github repo</Link>.</li>
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
        The email domain "@adamettenberger.com" will only be used to receive email, responding to inquiries and feedback, or to apply for a new opportunity.
        Should you choose to send an email to any "@adamettenberger.com" address, information shared will be treated as confidential and will not be shared without consent beyond what's required to send and receive email through relevant third-party email services, or if compelled by applicable laws or a warrant.
      </p>
      <ul>
        <li>If you're a company hiring manager or recruiter seeking to hire me through the alias <Link :to="EmailHiring">{{ EmailHiring.toDomainAlias() }}</Link>, I will aim to respond within 1-5 business days.</li>
        <li>If you raise a concern through the alias <Link :to="EmailFeedback">{{ EmailFeedback.toDomainAlias() }}</Link>, I will aim to respond only when necessary and within 1-5 business days depending on the severity of the concern.</li>
        <li>Unless given express written consent, your email address will not be used for any other purpose.</li>
      </ul>
    </Section>

    <Section heading="Third-party Processing">
      <p>
        This website is built with the help of some third-party services and is subject to applicable terms and conditions, including but not limited to data handling, retention, and privacy policies.
        For example:
      </p>
      <ul>
        <li>This website is hosted by <Link to="https://pages.github.com/">GitHub Pages</Link>.</li>
        <li>This website will, <b>with your consent</b>, collect anonymized telemetry with <Link to="https://posthog.com/">PostHog Cloud</Link> and route traffic through a proxy as recommended.</li>
      </ul>
    </Section>

    <Section heading="First-party Analytics">
      <p>
        This website would like to collect some anonymized telemetry with the help of <Link to="https://posthog.com/">PostHog Cloud</Link>, which among its many offerings includes anonymized cookieless website analytics and may be configured to be General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA) compliant.
        The PostHog Cloud server which hosts and processes the collected analytics is located in the United States of America (USA).
        The account will only process traffic to this domain name, and both the client and server configurations has been configured to be more privacy preserving (e.g., discarding client IP data, disabling session replay).
      </p>
      <p>
        The client configuration may be found at <Link to="https://raw.githubusercontent.com/AdamEttenberger/AdamEttenberger.github.io/refs/heads/main/src/plugins/posthog.js">'@/plugins/posthog.js'</Link>.
      </p>
      <p>
        Should you consent to first-party [metrics, telemetry, analytics, data collection], any data collected will only ever shared in aggregate form as mentioned on this page.
        Examples of "aggregate form" include but are not limited to; "(annual || monthly) visitors", "(most || least) popular (page || game)".
        Data collected will <b>never</b> be sold or shared with for advertising.
      </p>
      <p>
        If you selected "Ok" on the dialog shown to new visitors at the top of the page, you have consented to collecting first-party analytics data.
        If you would like to change this selection, open the settings menu by pressing the settings button ( <SettingsButton class="inline-button" /> ) to the right of the page header.
      </p>
      <p>
        Following is an example of what a first-party analytics event should look like:
      </p>
      <CodeMirror lang="text"
                  caption="Example of a first-party analytics API call."
                  content="
        # Telemetry event URL
        'https://posthog-data.adamettenberger.com/i/v0/e/?ip=0&_={ANTI_CACHE_TIMESTAMP}&ver={VERSION}&compression=gzip-js'

        # POST Payload (an example uncompressed event entry)
        # RANDOM_HYPHENATED_32_BYTE_VALUE_NAME and RANDOM_HYPHENATED_32_BYTE_VALUE_ID
        # generated when the single page app is first loaded or when reloaded.
        # Associates page visits until leaving (or reloaded) the website.
        {
          'event': '$autocapture',
          'Person': {
              'display_name': '{RANDOM_HYPHENATED_32_BYTE_VALUE_NAME}',
              'id': '{RANDOM_HYPHENATED_32_BYTE_VALUE_ID}'
          },
          'Url / Screen': 'https://adamettenberger.com/#/projects/match_three',
          'properties.$lib': 'web',
          'timestamp': '{TIMESTAMP}'
        },

        # PostHog local storage token to opt-in to collection.
        __ph_opt_in_out_{DOMAIN_TOKEN}
      " />
    </Section>
  </article>
</template>

<style scoped>
.max,
.feedback {
  width: max-content;
}

.inline-button {
  width: 2rem;
  vertical-align: sub;
  text-align: center;
}

.section-quote {
  padding: var(--padding-normal) var(--padding-xlarge);
}
</style>

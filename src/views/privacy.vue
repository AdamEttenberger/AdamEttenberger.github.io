<script setup lang="ts">
import Button from '@/components/buttons/button.vue'
import Divider from '@/components/divider.vue'
import Details from '@/components/details.vue'
import Note from '@/components/note.vue'
import Section from '@/components/section.vue'
import SettingsButton from '@/components/buttons/settings.vue'
import { ThemeColor } from '@/composables/theme'
import { EmailFeedback } from '@/content/socials'
</script>

<template>
  <article>
    <Section heading="Privacy Policy">
      <Note>Effective Date: August 9, 2026</Note>

      <p>This Privacy Policy describes how information is handled when you visit <b>adamettenberger.com</b> (the "Website").</p>
      <p>The Website is a personal portfolio and professional website. It does not sell personal information, use personal information for advertising, or operate a marketing program.</p>

      <Divider heading="Information Collected Automatically" />
      <p>When you visit the Website, certain information may be processed automatically by the services used to host and deliver it.</p>

      <Details summary="GitHub Pages">
        <p>The Website is hosted using GitHub Pages. GitHub may collect and retain information about requests to the Website, including IP addresses, for operational and security purposes. GitHub's handling of this information is governed by its own privacy policies.</p>
      </Details>

      <Details summary="Cloudflare">
        <p>The Website uses Cloudflare for DNS and network services. Cloudflare provides aggregate traffic statistics for the domain, which may include metrics such as unique visitors, total requests, cached requests, and data served.</p>
        <p>These statistics are used to understand the general amount of traffic reaching the Website and to maintain the service. I have not enabled Cloudflare Web Analytics or another website analytics platform.</p>
        <p>Cloudflare's handling of information is governed by its own privacy policy and applicable terms.</p>
      </Details>

      <Divider heading="Browser Storage" />
      <p>The Website may use browser <b>localStorage</b> to remember preferences or feature settings for features that require it.</p>
      <p>Where a feature uses <b>localStorage</b>, the Website will ask for your consent before storing information in your browser for that purpose. You may choose whether to enable those features.</p>
      <p>Information stored in <b>localStorage</b> remains on your device and is used to preserve your selected preferences or feature settings between visits and, where applicable, between multiple open tabs.</p>
      <p>The Website does not use <b>localStorage</b> for advertising, analytics, or cross-site tracking.</p>
      <p>You can remove locally stored information through your browser's settings, or by using the storage controls available on the <b>settings</b> (<SettingsButton />) page.</p>

      <Divider heading="Information You Provide" />
      <p>The Website provides email links for professional inquiries, hiring opportunities, and feedback.</p>
      <p>If you contact me by email, I may receive information such as your email address, name, the contents of your message, and any other information you choose to provide.</p>
      <p>This information is used only to receive and respond to your inquiry or feedback, or to communicate regarding a professional opportunity. It is not used for marketing purposes and will not be shared with third parties except as necessary to provide email services, with your consent, or when required by law.</p>
      <p>Email communications may be retained for as long as reasonably necessary to respond to an inquiry, maintain appropriate business records, or address legal or security matters.</p>

      <Divider heading="Third-Party Services" />
      <p>The Website relies on third-party services to operate:</p>
      <ul>
        <li><b>GitHub Pages</b> provides website hosting.</li>
        <li><b>Cloudflare</b> provides DNS and related network services.</li>
        <li><b>Font Awesome</b> provides icons used by the Website.</li>
        <li>
          Before consent is provided, <b>YouTube</b> videos are provided as external links and are not loaded or embedded on this website.
          Following a <b>YouTube</b> link will take you to the <b>YouTube</b> website, where <b>Google</b> and <b>YouTube</b> may collect information about your visit and interaction with the video, including through cookies and other storage technologies, subject to the privacy practices of <b>Google</b> and <b>YouTube</b>.
          If you provide consent, this website may embed <b>YouTube</b> videos directly within certain pages. Embedded videos may cause <b>YouTube</b> to collect information about your visit and interaction with the video, including through cookies and other storage technologies.
        </li>
        <li>Links to <b>GitHub</b> and <b>LinkedIn</b> may take you to those services. Once you leave this Website, the privacy practices of the respective service apply.</li>
      </ul>
      <p>These services may process information according to their own privacy policies and terms.</p>

      <Divider heading="Cookies and Tracking" />
      <p>The Website does not intentionally use cookies for advertising, behavioral profiling, or cross-site tracking.</p>
      <p>The Website also does not currently use a dedicated website analytics service such as Google Analytics, Microsoft Clarity, or similar services.</p>
      <p>Third-party infrastructure providers may nevertheless process technical information as part of delivering, securing, and operating the Website.</p>

      <Divider heading="Sharing and Sale of Information" />
      <p>Personal information provided directly to the Website is not sold or rented.</p>
      <p>Information is not shared for advertising or marketing purposes. Information may be processed or disclosed when necessary to operate the Website through service providers, to protect the security of the Website, to comply with applicable law, or to respond to a valid legal process.</p>

      <Divider heading="Data Security" />
      <p>Reasonable technical and organizational measures are used to protect information under my control. However, no website, electronic communication, or storage system can be guaranteed to be completely secure.</p>

      <Divider heading="Your Privacy Rights" />
      <p>Depending on where you live, you may have rights concerning your personal information, including rights to request access, correction, deletion, restriction of processing, or information about how your information is used.</p>
      <p>If the GDPR or another applicable privacy law applies to you, you may also have additional rights provided by that law, including the right to withdraw consent where processing is based on consent.</p>
      <p>To exercise an applicable privacy right or ask a question about this policy, please contact me using the email address provided on the Website. I will consider and respond to requests in accordance with applicable law.</p>
      <p>You may also have the right to lodge a complaint with the relevant data protection or privacy authority in your jurisdiction.</p>

      <Divider heading="Changes to This Policy" />
      <p>This Privacy Policy may be updated when the Website's functionality, services, or applicable legal requirements change. The effective date at the top of this page indicates when the current version took effect.</p>

      <Divider heading="Contact" />
      <p>For questions about this Privacy Policy, privacy concerns, or requests concerning personal information, please use the Website's feedback or contact email links.</p>
      <Button class="centered feedback" :to="EmailFeedback" :color="ThemeColor.Accent" />


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

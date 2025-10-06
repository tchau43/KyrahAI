import { PolicyProps } from '../types';

export const termsPolicy: PolicyProps[] = [
  {
    id: 'purpose-of-use',
    policyName: 'Purpose of Use',
    policyContent:
      'Kyrah.ai is provided for awareness and informational purposes only. It is <span class="font-semibold">not a substitute for medical, legal, or emergency services.</span>',
  },
  {
    id: 'eligibility',
    policyName: 'Eligibility',
    policyContent:
      'You must be at least 13 years old to use Kyrah.ai. If you are under 18, you should use the service with parental or guardian guidance.',
  },
  {
    id: 'user-control-consent',
    policyName: 'User Control & Consent',
    policyContent: [
      'You decide what information to share with us.',
      'We will only contact you if you have explicitly opted in (for example, signing up for Early Access or our newsletter).',
      'You can withdraw your consent or delete your data at any time by contacting <span class="font-semibold">[Ask@Kyrah.AI]</span>.',
    ],
  },
  {
    id: 'no-emergency-response',
    policyName: 'No Emergency Response',
    policyContent:
      'Kyrah.ai cannot respond to emergencies. If you are in crisis or feel unsafe, <span class="font-semibold">call 911 (U.S.), 999 (U.K.)</span>, or your local emergency number.',
  },
  {
    id: 'intellectual-property',
    policyName: 'Intellectual Property',
    policyContent:
      'All content, branding, and technology related to Kyrah.ai are the property of DNC Technologies LLC.',
  },
  {
    id: 'liability-limitation',
    policyName: 'Liability Limitation',
    policyContent:
      'Kyrah.ai and DNC Technologies LLC are not liable for any decisions, outcomes, or damages resulting from the use of this platform.',
  },
  {
    id: 'modifications',
    policyName: 'Modifications',
    policyContent:
      'We may update these Terms of Service at any time. If changes are significant, we will notify users who have opted in. Continued use of Kyrah.ai means acceptance of updated terms.',
  },
];

export const privacyPolicy: PolicyProps[] = [
  {
    id: 'what-we-collect',
    policyName: 'What We Collect (MVP stage)',
    policyContent: [
      'Name and email address, but <span class="font-semibold">only if you sign up</span> for Early Access or our newsletter.',
      'We do not collect or store sensitive personal information.',
    ],
  },
  {
    id: 'how-we-use-it',
    policyName: 'How We Use It',
    policyContent: [
      'To send updates or information <span class="font-semibold">only if you have opted in</span> (newsletter, Early Access form).',
      'To improve our platform with anonymized user feedback.',
    ],
  },
  {
    id: 'what-we-dont-do',
    policyName: "What We Don't Do",
    policyContent: [
      'We do not sell or share your personal data with third parties.',
      'We do not use your data for advertising.',
      "We do not contact you unless you've given explicit permission.",
    ],
  },
  {
    id: 'security',
    policyName: 'Security',
    policyContent: [
      'We use industry-standard encryption and secure storage practices.',
      'Because Kyrah.ai is in development, no health or confidential conversations are stored.',
    ],
  },
  {
    id: 'your-rights',
    policyName: 'Your Rights',
    policyContent: [
      'You can unsubscribe or opt out of communication at any time.',
      'You may request deletion of your data at any time by contacting us at <span class="font-semibold">[Ask@Kyrah.AI]</span>.',
    ],
  },
];

export const cookiePolicy: PolicyProps[] = [
  {
    id: 'what-are-cookies',
    policyName: 'What are cookies?',
    policyContent:
      'Cookies are small text files stored on your device when you visit a website. They help remember your preferences and improve functionality.',
  },
  {
    id: 'how-we-use-cookies',
    policyName: 'How we use cookies',
    policyContent: [
      'To make the site work properly (essential cookies).',
      'To understand website traffic and improve user experience (analytics cookies).',
    ],
  },
  {
    id: 'what-we-dont-do',
    policyName: "What We Don't Do",
    policyContent: [
      'We do not use cookies for targeted advertising.',
      'We do not sell cookie data to third parties.',
    ],
  },
  {
    id: 'your-choices',
    policyName: 'Your choices',
    policyContent: [
      'You can accept or decline cookies when you first visit our site. You can also manage or disable cookies through your browser settings at any time.',
      'For questions about our Cookie Policy, contact us at <span class="font-semibold">[Ask@Kyrah.AI]</span>.',
    ],
  },
];

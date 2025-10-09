import PolicyPage from '@/components/policy-service/form';
import { privacyPolicy } from '@/features/policy/data';

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage
      title="Privacy Policy"
      description="Your privacy matters. Here's how we collect, use, and protect your information."
      effectiveDate="Effective September 23, 2025"
      illustrationSrc="/ice-cream.svg"
      illustrationAlt="Privacy Policy Illustration"
      policies={privacyPolicy}
    />
  );
}

import PolicyPage from '@/components/policy-service/form';
import { termsPolicy } from '@/features/policy/data';

export default function TermsOfServicePage() {
  return (
    <PolicyPage
      title="Terms of Service"
      description="By using Kyrah.ai, you agree to the following terms. These guidelines exist to protect you and ensure a safe, supportive experience."
      effectiveDate="Effective September 23, 2025"
      illustrationSrc="/unboxing.svg"
      illustrationAlt="Terms of Service Illustration"
      policies={termsPolicy}
    />
  );
}

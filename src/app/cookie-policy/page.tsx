import PolicyPage from '@/components/policy-service/form';
import { cookiePolicy } from '@/features/policy/data';

export default function CookiePolicyPage() {
  return (
    <PolicyPage
      title="Cookie Policy"
      description="Learn about how we use cookies to improve your experience on Kyrah.ai."
      effectiveDate="Effective September 23, 2025"
      illustrationSrc="/cookie.svg"
      illustrationAlt="Cookie Policy Illustration"
      policies={cookiePolicy}
    />
  );
}

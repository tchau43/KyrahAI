import MeditatingSection from '@/components/safety-tips/MeditatingSection';
import SafetyGuideSection from '@/components/safety-tips/SafetyGuideSection';
import SafetySteps from '@/components/safety-tips/SafetySteps';

export default function SafetyTipsPage() {
  return (
    <div className="font-spectral grid grid-cols-12 grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen overflow-hidden">
      <SafetyGuideSection />
      <SafetySteps />
      <MeditatingSection />
    </div>
  );
}

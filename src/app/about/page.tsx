import ActionSection from '@/components/about/ActionSection';
import HelpingSection from '@/components/about/HelpingSection';
import ImpactSection from '@/components/about/ImpactSection';
import Introduce from '@/components/about/Introduce';
import SourceSection from '@/components/about/SourceSection';
import SupportedSection from '@/components/about/SupportedSection';
import WhyWeExistSection from '@/components/about/WhyWeExistSection';

export default function AboutPage() {
  return (
    <div className="font-spectral grid grid-cols-12 grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen overflow-hidden">
      <Introduce />
      <SupportedSection />
      <WhyWeExistSection />
      <HelpingSection />
      <ActionSection />
      <ImpactSection />
      <SourceSection />
    </div>
  );
}

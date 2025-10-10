import HeroSection from '@/components/homepage/HeroSection';
import TopRated from '@/components/homepage/TopRated';
import DiscoverSection from '@/components/homepage/DiscoverSection';
import MissionSection from '@/components/homepage/MissionSection';
import HowItWorksSection from '@/components/homepage/HowItWorksSection';
import SafetySection from '@/components/homepage/SafetySection';
import ResourceSection from '@/components/homepage/ResourceSection';
import BlogSection from '@/components/homepage/BlogSection';
import NewsLetterSection from '@/components/homepage/NewsLetterSection';

export default function Home() {
  return (
    <div className="font-spectral grid grid-cols-12 grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen bg-primary overflow-hidden pt-32 md:pt-40">
      <HeroSection />
      <TopRated />
      <MissionSection />
      <DiscoverSection />
      <HowItWorksSection />
      <SafetySection />
      <ResourceSection />
      <BlogSection />
      <NewsLetterSection />
    </div>
  );
}

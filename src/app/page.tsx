import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import YouTubeAnalysisSection from '@/components/YouTubeAnalysisSection';
import SampleSection from '@/components/SampleSection';
import FeatureSection from '@/components/FeatureSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <YouTubeAnalysisSection />
        <SampleSection />
        <FeatureSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}

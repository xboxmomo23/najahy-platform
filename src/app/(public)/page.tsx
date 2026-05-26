import {
  AIDemoSection,
  ComparisonSection,
  FAQSection,
  FinalCTASection,
  HeroSection,
  PricingTeaserSection,
  TestimonialsSection,
  ThreePillarsSection,
} from "@/components/public/landing";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ThreePillarsSection />
      <ComparisonSection />
      <AIDemoSection />
      <TestimonialsSection />
      <PricingTeaserSection />
      <FAQSection />
      <FinalCTASection />
    </>
  );
}

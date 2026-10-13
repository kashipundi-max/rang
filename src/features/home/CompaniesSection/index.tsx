import CompaniesMarquee from "./components/CompaniesMarquee";

export default function CompaniesSection() {
  return (
    <section id="platforms" className="scroll-mt-24 landing-mode-section bg-bg-dark pb-4 sm:pb-12 md:pb-5 pt-17 relative select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <CompaniesMarquee />
      </div>
    </section>
  );
}


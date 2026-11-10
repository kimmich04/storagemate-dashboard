import { SiteHeader, SiteFooter } from '../features/home/HomeChrome'
import { Hero } from '../features/home/Hero'
import { ProblemSection } from '../features/home/ProblemSection'
import { AiSection } from '../features/home/AiSection'
import { FlowSection } from '../features/home/FlowSection'
import { DemoSection } from '../features/home/DemoSection'
import { ComparisonSection } from '../features/home/ComparisonSection'
import { FinalCta } from '../features/home/FinalCta'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream font-sans text-sm text-ink tabular-nums antialiased">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-pine focus:px-4 focus:py-2 focus:text-cream focus:no-underline"
      >
        Bỏ qua tới nội dung chính
      </a>
      <SiteHeader />
      <main id="main-content">
        <Hero />
        <ProblemSection />
        <AiSection />
        <FlowSection />
        <DemoSection />
        <ComparisonSection />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  )
}

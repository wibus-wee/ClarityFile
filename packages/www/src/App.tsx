import { Header, Footer } from './components'
import { BenefitsSection } from './components/sections/benefits-section'
import { CTASection } from './components/sections/cta-section'
import { FeaturesSection } from './components/sections/features-section'
import { HeroSection } from './components/sections/hero-section'
import { ProblemsSection } from './components/sections/problems-section'

// Main Dashboard Component
function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <ProblemsSection />
        <FeaturesSection />
        <BenefitsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}

export default App

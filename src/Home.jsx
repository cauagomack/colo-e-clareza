import SiteHeader from './SiteHeader.jsx';
import Hero from './Hero.jsx';
import MapaCTA from './MapaCTA.jsx';
import Introduction from './Introduction.jsx';
import HowItWorks from './HowItWorks.jsx';
import Services from './Services.jsx';
import SiteFooter from './SiteFooter.jsx';

export default function Home() {
  return (
    <div className="page">
      <SiteHeader />
      <main>
        <Hero />
        <MapaCTA />
        <Introduction />
        <HowItWorks />
        <Services />
      </main>
      <SiteFooter />
    </div>
  );
}
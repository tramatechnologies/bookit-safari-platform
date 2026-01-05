import { ArrowRight, Users, MapPin, Bus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchForm from '@/components/SearchForm';
import PopularRoutes from '@/components/PopularRoutes';
import HowItWorks from '@/components/HowItWorks';
import Features from '@/components/Features';
import Testimonials from '@/components/Testimonials';
import CTASection from '@/components/CTASection';
import heroBus from '@/assets/hero-bus.jpg';

const Index = () => {
  const { t } = useTranslation();
  
  const stats = [
    { icon: Users, value: '50,000+', label: t('stats.happyTravelers') },
    { icon: MapPin, value: '31', label: t('stats.regionsCovered') },
    { icon: Bus, value: '100+', label: t('stats.busOperators') },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroBus}
            alt="Bus traveling through Tanzania"
            className="w-full h-full object-cover"
            loading="eager"
            onError={(e) => {
              // Fallback if image fails to load
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/40" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 mb-6 animate-fade-up">
              <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
              <span className="text-sm text-primary-foreground/90">
                {t('header.tagline')}
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight animate-fade-up" style={{ animationDelay: '100ms' }}>
              {t('hero.headline')}
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-xl animate-fade-up" style={{ animationDelay: '200ms' }}>
              {t('hero.subheadline')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-12 animate-fade-up" style={{ animationDelay: '300ms' }}>
              <Button variant="hero" size="xl" asChild>
                <Link to="/search">
                  {t('hero.bookYourTrip')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="xl" asChild>
                <Link to="/routes">
                  {t('hero.viewAllRoutes')}
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 animate-fade-up" style={{ animationDelay: '400ms' }}>
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber/20 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-amber" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-primary-foreground">{stat.value}</p>
                    <p className="text-sm text-primary-foreground/60">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="relative z-20 -mt-16 pb-12">
        <div className="container mx-auto px-4">
          <SearchForm />
        </div>
      </section>

      {/* How It Works */}
      <HowItWorks />

      {/* Popular Routes */}
      <PopularRoutes />

      {/* Features */}
      <Features />

      {/* Testimonials */}
      <Testimonials />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;

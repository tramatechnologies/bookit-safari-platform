import { Megaphone, Eye, Target, TrendingUp, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';

const Advertise = () => {
  const advertisingOptions = [
    {
      icon: Eye,
      title: 'Banner Advertising',
      description: 'Display your brand on our high-traffic pages and reach thousands of travelers daily.',
      features: ['Homepage banners', 'Search results placement', 'Mobile & desktop', 'Targeted by region'],
    },
    {
      icon: Target,
      title: 'Sponsored Routes',
      description: 'Promote your routes and schedules to travelers searching for specific destinations.',
      features: ['Top placement in search', 'Featured route badges', 'Priority in results', 'Increased visibility'],
    },
    {
      icon: TrendingUp,
      title: 'Email Marketing',
      description: 'Reach our subscriber base with targeted email campaigns and promotional offers.',
      features: ['Newsletter placements', 'Promotional emails', 'Segmented audiences', 'Performance tracking'],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-teal/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-20 h-20 rounded-2xl bg-amber/10 flex items-center justify-center mx-auto mb-6">
              <Megaphone className="w-10 h-10 text-amber" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Advertise With Us
            </h1>
            <p className="text-lg text-muted-foreground">
              Reach thousands of travelers across Tanzania. Promote your business, services, or products to our engaged audience.
            </p>
          </div>
        </div>
      </section>

      {/* Advertising Options */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-foreground mb-12 text-center">
              Advertising Options
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {advertisingOptions.map((option, index) => {
                const Icon = option.icon;
                return (
                  <div
                    key={index}
                    className="bg-card rounded-2xl p-8 border border-border/50 hover:shadow-xl transition-all"
                  >
                    <div className="w-16 h-16 rounded-xl bg-amber/10 flex items-center justify-center mb-6">
                      <Icon className="w-8 h-8 text-amber" />
                    </div>
                    <h3 className="font-semibold text-xl text-foreground mb-3">{option.title}</h3>
                    <p className="text-muted-foreground mb-6">{option.description}</p>
                    <ul className="space-y-2">
                      {option.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-amber mt-1">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Audience Stats */}
      <section className="py-16 bg-gradient-to-br from-teal/5 to-amber/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-foreground mb-12 text-center">
              Our Audience
            </h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-4xl font-bold text-teal mb-2">50,000+</p>
                <p className="text-muted-foreground">Active Users</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-teal mb-2">100,000+</p>
                <p className="text-muted-foreground">Monthly Page Views</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-teal mb-2">31</p>
                <p className="text-muted-foreground">Regions Covered</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-card rounded-2xl p-8 border border-border text-center">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Get Started Today
            </h2>
            <p className="text-muted-foreground mb-8">
              Contact our advertising team to discuss your campaign and get a custom quote.
            </p>
            <div className="space-y-4 mb-8">
              <a
                href="mailto:advertising@bookitsafari.com"
                className="flex items-center justify-center gap-3 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <Mail className="w-5 h-5 text-teal" />
                <span className="font-medium text-foreground">advertising@bookitsafari.com</span>
              </a>
              <a
                href="tel:+255740360478"
                className="flex items-center justify-center gap-3 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <Phone className="w-5 h-5 text-teal" />
                <span className="font-medium text-foreground">+255 740 360 478</span>
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              We offer flexible advertising packages tailored to your budget and goals.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Advertise;


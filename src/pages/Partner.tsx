import { Handshake, TrendingUp, Users, Award, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';

const Partner = () => {
  const partnershipTypes = [
    {
      icon: Users,
      title: 'Travel Agencies',
      description: 'Partner with us to offer bus booking services to your customers. Earn commissions on every booking.',
      benefits: ['Commission on bookings', 'White-label solutions', 'API access', 'Marketing support'],
    },
    {
      icon: TrendingUp,
      title: 'Technology Partners',
      description: 'Integrate BookitSafari into your platform or build innovative solutions on top of our API.',
      benefits: ['API access', 'Technical support', 'Co-marketing opportunities', 'Revenue sharing'],
    },
    {
      icon: Award,
      title: 'Corporate Partnerships',
      description: 'Provide bus booking services for your employees or customers through our corporate solutions.',
      benefits: ['Bulk booking discounts', 'Dedicated account manager', 'Custom reporting', 'Flexible payment terms'],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-teal/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-20 h-20 rounded-2xl bg-teal/10 flex items-center justify-center mx-auto mb-6">
              <Handshake className="w-10 h-10 text-teal" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Partner With Us
            </h1>
            <p className="text-lg text-muted-foreground">
              Join forces with BookitSafari and grow your business. We offer various partnership opportunities for travel agencies, technology companies, and corporate clients.
            </p>
          </div>
        </div>
      </section>

      {/* Partnership Types */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-foreground mb-12 text-center">
              Partnership Opportunities
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {partnershipTypes.map((type, index) => {
                const Icon = type.icon;
                return (
                  <div
                    key={index}
                    className="bg-card rounded-2xl p-8 border border-border/50 hover:shadow-xl transition-all"
                  >
                    <div className="w-16 h-16 rounded-xl bg-teal/10 flex items-center justify-center mb-6">
                      <Icon className="w-8 h-8 text-teal" />
                    </div>
                    <h3 className="font-semibold text-xl text-foreground mb-3">{type.title}</h3>
                    <p className="text-muted-foreground mb-6">{type.description}</p>
                    <ul className="space-y-2">
                      {type.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-teal mt-1">✓</span>
                          <span>{benefit}</span>
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

      {/* Why Partner */}
      <section className="py-16 bg-gradient-to-br from-teal/5 to-amber/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-foreground mb-12 text-center">
              Why Partner With BookitSafari?
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-card rounded-xl p-6 border border-border/50">
                <h3 className="font-semibold text-lg text-foreground mb-2">Growing Platform</h3>
                <p className="text-muted-foreground text-sm">
                  Join a rapidly growing platform with thousands of active users and expanding reach across Tanzania.
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border/50">
                <h3 className="font-semibold text-lg text-foreground mb-2">Proven Technology</h3>
                <p className="text-muted-foreground text-sm">
                  Leverage our robust booking platform, payment systems, and customer support infrastructure.
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border/50">
                <h3 className="font-semibold text-lg text-foreground mb-2">Marketing Support</h3>
                <p className="text-muted-foreground text-sm">
                  Benefit from our marketing efforts, brand recognition, and customer acquisition strategies.
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border/50">
                <h3 className="font-semibold text-lg text-foreground mb-2">Dedicated Support</h3>
                <p className="text-muted-foreground text-sm">
                  Get dedicated account management and technical support to help you succeed.
                </p>
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
              Ready to Partner?
            </h2>
            <p className="text-muted-foreground mb-8">
              Contact our partnership team to discuss how we can work together to grow your business.
            </p>
            <div className="space-y-4 mb-8">
              <a
                href="mailto:partners@bookitsafari.com"
                className="flex items-center justify-center gap-3 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <Mail className="w-5 h-5 text-teal" />
                <span className="font-medium text-foreground">partners@bookitsafari.com</span>
              </a>
              <a
                href="tel:+255740360478"
                className="flex items-center justify-center gap-3 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <Phone className="w-5 h-5 text-teal" />
                <span className="font-medium text-foreground">+255 740 360 478</span>
              </a>
            </div>
            <Button variant="teal" size="lg" asChild>
              <Link to="/operator/register">Express Interest as Operator</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Partner;


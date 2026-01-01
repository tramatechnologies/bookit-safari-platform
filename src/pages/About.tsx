import { Users, Target, Award, Heart, MapPin, Clock, Shield } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const About = () => {
  const values = [
    {
      icon: Shield,
      title: 'Safety First',
      description: 'We prioritize passenger safety above all else. All operators are vetted and buses are regularly inspected.',
    },
    {
      icon: Heart,
      title: 'Customer Focus',
      description: 'Your satisfaction is our mission. We\'re committed to providing exceptional service at every step.',
    },
    {
      icon: Award,
      title: 'Quality Service',
      description: 'We partner only with trusted operators who meet our high standards for comfort and reliability.',
    },
    {
      icon: Users,
      title: 'Community Impact',
      description: 'Connecting communities across Tanzania and supporting local bus operators and travelers.',
    },
  ];

  const stats = [
    { icon: Users, value: '50,000+', label: 'Happy Travelers' },
    { icon: MapPin, value: '31', label: 'Regions Covered' },
    { icon: Clock, value: '24/7', label: 'Support Available' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-teal/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              About BookitSafari
            </h1>
            <p className="text-lg text-muted-foreground">
              Your trusted partner for bus travel across Tanzania. We're making travel accessible, safe, and convenient for everyone.
            </p>
            <p className="text-sm text-muted-foreground/80 mt-4">
              Bookit Safari is a product of <strong>Trama Technologies (Holding Company)</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                  Our Mission
                </h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  BookitSafari was founded with a simple mission: to make bus travel across Tanzania easier, safer, and more accessible for everyone. We believe that travel should be simple, whether you're visiting family, going on business, or exploring the beautiful regions of our country.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  By connecting travelers with trusted bus operators through our digital platform, we're transforming how people book and experience bus travel in Tanzania.
                </p>
              </div>
              <div className="bg-gradient-to-br from-teal/10 to-amber/10 rounded-2xl p-8">
                <Target className="w-16 h-16 text-teal mb-4" />
                <h3 className="font-semibold text-xl text-foreground mb-2">Our Vision</h3>
                <p className="text-muted-foreground">
                  To become Tanzania's leading bus booking platform, connecting all 31 regions and empowering both travelers and operators with innovative technology.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gradient-to-br from-teal/5 to-amber/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 rounded-xl bg-teal/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-teal" />
                  </div>
                  <p className="text-3xl font-bold text-foreground mb-2">{stat.value}</p>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-foreground mb-12 text-center">
              Our Values
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div key={index} className="bg-card rounded-xl p-6 border border-border/50">
                    <div className="w-12 h-12 rounded-lg bg-teal/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-teal" />
                    </div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">{value.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gradient-to-br from-teal/5 to-amber/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-foreground mb-12 text-center">
              Why Choose BookitSafari?
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-teal/10 flex items-center justify-center shrink-0">
                  <Shield className="w-6 h-6 text-teal" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Verified Operators</h3>
                  <p className="text-muted-foreground">
                    All bus operators on our platform are verified and vetted for safety, reliability, and quality service.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-teal/10 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-teal" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Real-Time Updates</h3>
                  <p className="text-muted-foreground">
                    Get instant notifications about schedule changes, delays, and important travel information.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-teal/10 flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6 text-teal" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Best Prices</h3>
                  <p className="text-muted-foreground">
                    Compare prices from multiple operators and choose the best option for your budget and schedule.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-teal/10 flex items-center justify-center shrink-0">
                  <Heart className="w-6 h-6 text-teal" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">24/7 Support</h3>
                  <p className="text-muted-foreground">
                    Our customer support team is available around the clock to assist you with any questions or concerns.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of travelers who trust BookitSafari for their bus travel needs across Tanzania.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="teal" size="lg" asChild>
              <Link to="/search">Book Your Trip</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/operator/register">Express Interest as Operator</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;


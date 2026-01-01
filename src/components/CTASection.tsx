import { Button } from '@/components/ui/button';
import { ArrowRight, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <section className="py-20 bg-sand">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Passenger CTA */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal to-teal-dark p-8 lg:p-12 text-primary-foreground">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-foreground/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary-foreground/10 text-amber text-sm font-medium mb-4">
                For Travelers
              </span>
              <h3 className="font-display text-2xl lg:text-3xl font-bold mb-4">
                Start Your Journey Today
              </h3>
              <p className="text-primary-foreground/80 mb-8 max-w-md">
                Create your free account and book your first trip. Join thousands of satisfied travelers across Tanzania.
              </p>
              <Button variant="hero" size="lg" asChild>
                <Link to="/auth?mode=register">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Operator CTA */}
          <div className="relative overflow-hidden rounded-3xl bg-card border border-border/50 p-8 lg:p-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-amber/10 flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-amber" />
              </div>
              <h3 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-4">
                Grow Your Business
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md">
                Express your interest to join BookitSafari. Our team will contact you to discuss partnership opportunities and set up your operator account.
              </p>
              <Button variant="teal" size="lg" asChild>
                <Link to="/operator/register">
                  Express Interest as Operator
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

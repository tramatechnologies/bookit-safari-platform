import { Search, CreditCard, Ticket, Bus } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Search',
    description: 'Enter your departure city, destination, and travel date to find available buses.',
    color: 'teal',
  },
  {
    icon: Bus,
    title: 'Choose',
    description: 'Compare buses, departure times, prices, and amenities to find your perfect ride.',
    color: 'amber',
  },
  {
    icon: CreditCard,
    title: 'Pay',
    description: 'Securely pay using ClickPesa, mobile money, or card payments.',
    color: 'teal',
  },
  {
    icon: Ticket,
    title: 'Travel',
    description: 'Receive your e-ticket with QR code. Show it at boarding and enjoy your journey!',
    color: 'amber',
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-teal/10 text-teal text-sm font-medium mb-4">
            Simple Process
          </span>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground">
            Book your bus ticket in just a few simple steps. Fast, easy, and secure.
          </p>
        </div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-teal via-amber to-teal transform -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative flex flex-col items-center text-center group"
              >
                {/* Step Number */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center z-20">
                  {index + 1}
                </div>

                {/* Icon */}
                <div
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${
                    step.color === 'teal'
                      ? 'bg-teal/10 text-teal group-hover:bg-teal group-hover:text-primary-foreground'
                      : 'bg-amber/10 text-amber group-hover:bg-amber group-hover:text-accent-foreground'
                  }`}
                >
                  <step.icon className="w-8 h-8" />
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

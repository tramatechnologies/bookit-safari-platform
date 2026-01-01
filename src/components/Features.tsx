import { Shield, Clock, CreditCard, Headphones, MapPin, Star } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Secure Booking',
    description: 'Your data and payments are protected with bank-level encryption.',
  },
  {
    icon: Clock,
    title: 'Real-time Updates',
    description: 'Get instant notifications about schedule changes and delays.',
  },
  {
    icon: CreditCard,
    title: 'Easy Payments',
    description: 'Pay with M-Pesa, Tigo Pesa, Airtel Money, or cards via ClickPesa.',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Our team is always here to help you with any questions.',
  },
  {
    icon: MapPin,
    title: 'All of Tanzania',
    description: 'Connect to all 31 regions with trusted bus operators.',
  },
  {
    icon: Star,
    title: 'Verified Operators',
    description: 'All operators are vetted for safety and quality service.',
  },
];

const Features = () => {
  return (
    <section className="py-20 gradient-hero text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-foreground/10 text-amber text-sm font-medium mb-4">
            Why BookitSafari
          </span>
          <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
            Travel With Confidence
          </h2>
          <p className="text-primary-foreground/70">
            We're committed to making your journey across Tanzania safe, comfortable, and hassle-free.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-primary-foreground/5 border border-primary-foreground/10 hover:bg-primary-foreground/10 hover:border-amber/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-amber/20 flex items-center justify-center mb-4 group-hover:bg-amber group-hover:scale-110 transition-all duration-300">
                <feature.icon className="w-6 h-6 text-amber group-hover:text-accent-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-primary-foreground/70 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

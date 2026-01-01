import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Grace Mwakasege',
    location: 'Dar es Salaam',
    rating: 5,
    text: 'BookitSafari made booking my trip to Arusha so easy! The process was smooth and I loved receiving the QR ticket on my phone.',
    avatar: 'GM',
  },
  {
    name: 'Joseph Mwambene',
    location: 'Mwanza',
    rating: 5,
    text: 'I travel frequently for business and BookitSafari has become my go-to app. The real-time updates are incredibly helpful.',
    avatar: 'JM',
  },
  {
    name: 'Fatuma Hassan',
    location: 'Mbeya',
    rating: 5,
    text: 'The mobile money payment option is perfect for me. No need to go to the bus station anymore - I book from home!',
    avatar: 'FH',
  },
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-amber/10 text-amber text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
            What Our Travelers Say
          </h2>
          <p className="text-muted-foreground">
            Thousands of Tanzanians trust BookitSafari for their travel needs. Here's what they have to say.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative p-6 lg:p-8 rounded-2xl bg-card border border-border/50 shadow-md hover:shadow-xl transition-all duration-300"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-amber/20" />
              
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber text-amber" />
                ))}
              </div>

              {/* Text */}
              <p className="text-foreground/80 text-sm leading-relaxed mb-6">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal flex items-center justify-center text-primary-foreground font-semibold text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
                  <p className="text-muted-foreground text-xs">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

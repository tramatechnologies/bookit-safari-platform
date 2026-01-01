import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Mail, MessageCircle, BookOpen, CreditCard, Bus, User, Shield, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQ[] = [
  {
    id: '1',
    category: 'Booking',
    question: 'How do I book a bus ticket?',
    answer: 'Booking is easy! Simply search for your route using the search form on our homepage, select your preferred schedule, choose your seats, enter passenger details, and complete payment. You\'ll receive a confirmation email with your booking details.',
  },
  {
    id: '2',
    category: 'Booking',
    question: 'Can I cancel my booking?',
    answer: 'Yes, you can cancel your booking from the "My Bookings" page. Cancellations made 24+ hours before departure are eligible for a full refund. Cancellations made less than 24 hours before departure may be subject to partial refunds based on our cancellation policy.',
  },
  {
    id: '3',
    category: 'Payment',
    question: 'What payment methods do you accept?',
    answer: 'We accept multiple payment methods including M-Pesa, Tigo Pesa, Airtel Money, and card payments via ClickPesa. All payments are processed securely.',
  },
  {
    id: '4',
    category: 'Payment',
    question: 'Is my payment information secure?',
    answer: 'Yes, absolutely! We use bank-level encryption to protect your payment information. We never store your full card details, and all transactions are processed through secure payment gateways.',
  },
  {
    id: '5',
    category: 'Travel',
    question: 'How do I find my bus at the terminal?',
    answer: 'Your booking confirmation email includes your bus number, plate number, and bus type. Look for this information at the terminal. We recommend arriving at least 30 minutes before departure.',
  },
  {
    id: '6',
    category: 'Travel',
    question: 'Can I change my seat after booking?',
    answer: 'Seat changes are subject to availability. Please contact our support team at least 24 hours before departure to request a seat change. Changes may incur additional fees.',
  },
  {
    id: '7',
    category: 'Account',
    question: 'How do I create an account?',
    answer: 'Click "Sign Up" in the header, enter your email and password, and verify your email address. You can also sign up using your Google account for faster registration.',
  },
  {
    id: '8',
    category: 'Account',
    question: 'I forgot my password. How do I reset it?',
    answer: 'Click "Forgot password?" on the sign-in page, enter your email address, and we\'ll send you a password reset link. Follow the instructions in the email to create a new password.',
  },
  {
    id: '9',
    category: 'Safety',
    question: 'Are the bus operators verified?',
    answer: 'Yes, all bus operators on BookitSafari are verified and vetted for safety and quality. We regularly review operator credentials and bus conditions to ensure passenger safety.',
  },
  {
    id: '10',
    category: 'Safety',
    question: 'What safety measures are in place?',
    answer: 'All buses must meet safety standards, operators are licensed, and we maintain insurance coverage. We also provide 24/7 customer support for any travel-related concerns.',
  },
];

const categories = [
  { id: 'all', name: 'All Topics', icon: BookOpen },
  { id: 'Booking', name: 'Booking', icon: Bus },
  { id: 'Payment', name: 'Payment', icon: CreditCard },
  { id: 'Travel', name: 'Travel', icon: MapPin },
  { id: 'Account', name: 'Account', icon: User },
  { id: 'Safety', name: 'Safety', icon: Shield },
];

const Help = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-teal/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              How Can We Help You?
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Find answers to common questions or contact our support team for assistance.
            </p>
            
            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for help..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-teal text-primary-foreground'
                      : 'bg-card text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-4">
              {filteredFAQs.length > 0 ? (
                filteredFAQs.map((faq) => (
                  <div
                    key={faq.id}
                    className="bg-card rounded-xl border border-border/50 overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFAQ(openFAQ === faq.id ? null : faq.id)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-teal/10 text-teal">
                            {faq.category}
                          </span>
                        </div>
                        <h3 className="font-semibold text-foreground">{faq.question}</h3>
                      </div>
                      {openFAQ === faq.id ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0 ml-4" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0 ml-4" />
                      )}
                    </button>
                    {openFAQ === faq.id && (
                      <div className="px-6 pb-6">
                        <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No results found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try a different search term or category
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 bg-gradient-to-br from-teal/5 to-amber/5">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Still Need Help?
            </h2>
            <p className="text-muted-foreground mb-8">
              Our support team is here to help you 24/7. Get in touch with us through any of these channels.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="mailto:support@bookitsafari.com"
                className="flex items-center gap-3 p-6 bg-card rounded-xl border border-border/50 hover:border-teal transition-colors group"
              >
                <div className="w-12 h-12 rounded-lg bg-teal/10 flex items-center justify-center group-hover:bg-teal transition-colors">
                  <Mail className="w-6 h-6 text-teal group-hover:text-primary-foreground" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">Email Us</p>
                  <p className="text-sm text-muted-foreground">support@bookitsafari.com</p>
                </div>
              </a>
              <a
                href="tel:+255740360478"
                className="flex items-center gap-3 p-6 bg-card rounded-xl border border-border/50 hover:border-teal transition-colors group"
              >
                <div className="w-12 h-12 rounded-lg bg-teal/10 flex items-center justify-center group-hover:bg-teal transition-colors">
                  <MessageCircle className="w-6 h-6 text-teal group-hover:text-primary-foreground" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">Call Us</p>
                  <p className="text-sm text-muted-foreground">+255 740 360 478</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Help;


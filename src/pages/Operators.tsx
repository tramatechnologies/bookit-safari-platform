import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Star, MapPin, Phone, Mail, Search, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const Operators = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: operators, isLoading } = useQuery({
    queryKey: ['operators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bus_operators')
        .select('*')
        .eq('status', 'approved')
        .order('company_name', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const filteredOperators = operators?.filter(op =>
    op.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    op.company_email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-teal/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Trusted Bus Operators
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Connect with verified bus operators across Tanzania. All operators are vetted for safety and quality service.
            </p>
            
            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search operators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Operators Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-muted-foreground">Loading operators...</p>
            </div>
          ) : filteredOperators.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOperators.map((operator) => (
                <div
                  key={operator.id}
                  className="group bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border/50 hover:-translate-y-1"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-teal" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-lg">{operator.company_name}</h3>
                          {operator.is_verified && (
                            <div className="flex items-center gap-1 mt-1">
                              <CheckCircle className="w-4 h-4 text-teal" />
                              <span className="text-xs text-muted-foreground">Verified</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {operator.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {operator.description}
                      </p>
                    )}

                    <div className="space-y-2 mb-4">
                      {operator.company_phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <a href={`tel:${operator.company_phone}`} className="hover:text-teal transition-colors">
                            {operator.company_phone}
                          </a>
                        </div>
                      )}
                      {operator.company_email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <a href={`mailto:${operator.company_email}`} className="hover:text-teal transition-colors">
                            {operator.company_email}
                          </a>
                        </div>
                      )}
                    </div>

                    <Button variant="teal-outline" className="w-full" asChild>
                      <Link to={`/search?operator=${operator.id}`}>
                        View Routes
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No operators found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm ? 'Try a different search term' : 'Operators will appear here once they register'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Become an Operator CTA */}
      <section className="py-16 bg-gradient-to-br from-teal/5 to-amber/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">
            Are you a bus operator?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Interested in joining BookitSafari? Express your interest and our team will contact you to discuss partnership opportunities.
          </p>
          <Button variant="teal" size="lg" asChild>
            <Link to="/operator/register">
              Express Interest as Operator
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Operators;


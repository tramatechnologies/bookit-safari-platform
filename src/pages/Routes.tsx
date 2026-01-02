import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useSearchSchedules } from '@/hooks/use-schedules';
import { useRegions } from '@/hooks/use-regions';
import { formatPrice } from '@/lib/constants';
import { format } from 'date-fns';

const Routes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: regions } = useRegions();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Fetch popular routes (Dar es Salaam to major cities)
  const darEsSalaamId = regions?.find(r => r.name.toLowerCase().includes('dar'))?.id;
  const popularDestinations = regions?.filter(r => 
    ['arusha', 'mwanza', 'dodoma', 'mbeya', 'tanga', 'kilimanjaro'].some(name => 
      r.name.toLowerCase().includes(name)
    )
  ) || [];

  const { data: schedules, isLoading } = useSearchSchedules({
    fromRegionId: darEsSalaamId || undefined,
    toRegionId: undefined,
    date: format(tomorrow, 'yyyy-MM-dd'),
  });

  const filteredRoutes = schedules?.filter(schedule => {
    if (!searchTerm) return true;
    const route = schedule.route;
    const departure = route?.departure_region?.name || '';
    const destination = route?.destination_region?.name || '';
    return departure.toLowerCase().includes(searchTerm.toLowerCase()) ||
           destination.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-teal/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Popular Routes Across Tanzania
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Discover the most traveled bus routes in Tanzania. Book your journey with trusted operators.
            </p>
            
            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search routes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Routes Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden shadow-md border border-border/50 animate-pulse">
                  <div className="p-6 bg-gradient-to-br from-teal/5 to-amber/5">
                    <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                  <div className="p-6 border-t border-border/50">
                    <div className="h-5 bg-muted rounded w-24 mb-4" />
                    <div className="h-10 bg-muted rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredRoutes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRoutes.map((schedule) => {
                const route = schedule.route;
                const departure = route?.departure_region?.name || 'N/A';
                const destination = route?.destination_region?.name || 'N/A';
                
                return (
                  <div
                    key={schedule.id}
                    className="group bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border/50 hover:-translate-y-1"
                  >
                    <div className="p-6 bg-gradient-to-br from-teal/5 to-amber/5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          <p className="text-lg font-semibold text-foreground">{departure}</p>
                          <p className="text-sm text-muted-foreground">Departure</p>
                        </div>
                        <div className="px-4">
                          <div className="w-12 h-12 rounded-full bg-amber/10 flex items-center justify-center group-hover:bg-amber group-hover:text-accent-foreground transition-colors">
                            <ArrowRight className="w-5 h-5 text-amber group-hover:text-accent-foreground" />
                          </div>
                        </div>
                        <div className="flex-1 text-right">
                          <p className="text-lg font-semibold text-foreground">{destination}</p>
                          <p className="text-sm text-muted-foreground">Arrival</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 border-t border-border/50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{schedule.departure_time?.substring(0, 5) || 'N/A'}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">From</p>
                          <p className="text-xl font-bold text-teal">
                            {formatPrice(schedule.price_tzs || 0)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{schedule.route?.operator?.company_name || 'Operator'}</span>
                      </div>
                      <Button variant="teal-outline" className="w-full" asChild>
                        <Link to={`/search?from=${route?.departure_region_id}&to=${route?.destination_region_id}`}>
                          View Buses
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No routes found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm ? 'Try a different search term' : 'Routes will appear here once operators add schedules'}
              </p>
              <Button variant="outline" asChild>
                <Link to="/search">Search All Routes</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Routes;


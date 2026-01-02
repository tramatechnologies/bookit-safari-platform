import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, ArrowRight, Filter, Wifi, Wind, Zap, Users, AlertCircle, Loader2, Bus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { formatPrice } from '@/lib/constants';
import { useSearchSchedules } from '@/hooks/use-schedules';
import { useRegions } from '@/hooks/use-regions';

const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  ac: Wind,
  usb: Zap,
};

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const date = searchParams.get('date');

  const { data: regions = [] } = useRegions();
  const fromRegion = regions.find(r => r.id === from || r.code === from);
  const toRegion = regions.find(r => r.id === to || r.code === to);

  const { data: schedules = [], isLoading, error } = useSearchSchedules({
    fromRegionId: from || undefined,
    toRegionId: to || undefined,
    date: date || undefined,
  });

  const [sortBy, setSortBy] = useState<'departure' | 'price' | 'duration'>('departure');

  const sortedSchedules = useMemo(() => {
    return [...schedules].sort((a, b) => {
      if (sortBy === 'price') {
        return Number(a.price_tzs) - Number(b.price_tzs);
      }
      if (sortBy === 'departure') {
        return a.departure_time.localeCompare(b.departure_time);
      }
      if (sortBy === 'duration') {
        const aDuration = a.route?.duration_hours || 0;
        const bDuration = b.route?.duration_hours || 0;
        return Number(aDuration) - Number(bDuration);
      }
      return 0;
    });
  }, [schedules, sortBy]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-TZ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Search Summary */}
      <section className="pt-24 pb-8 gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 text-2xl lg:text-3xl font-display font-bold mb-2">
                <span>{fromRegion?.name || from}</span>
                <ArrowRight className="w-6 h-6 text-amber" />
                <span>{toRegion?.name || to}</span>
              </div>
              <div className="flex items-center gap-4 text-primary-foreground/70">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(date)}</span>
                </div>
                <span>•</span>
                <span>{schedules.length} buses available</span>
              </div>
            </div>
            <Button variant="hero-outline" size="lg" onClick={() => navigate('/')} asChild>
              <Link to="/">Modify Search</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10 px-3 rounded-lg border-2 border-input bg-background text-sm focus:border-primary outline-none transition-colors"
              >
                <option value="departure">Departure Time</option>
                <option value="price">Price (Low to High)</option>
                <option value="duration">Duration</option>
              </select>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Showing {sortedSchedules.length} results</span>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-destructive mb-1">Error loading schedules</h3>
                <p className="text-sm text-muted-foreground">
                  {error instanceof Error ? error.message : 'Failed to load bus schedules. Please try again.'}
                </p>
              </div>
            </div>
          )}

          {/* No Results */}
          {!isLoading && !error && sortedSchedules.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No buses found for your search criteria.</p>
              <Button variant="outline" onClick={() => navigate('/')}>
                Modify Search
              </Button>
            </div>
          )}

          {/* Bus Cards */}
          {!isLoading && !error && sortedSchedules.length > 0 && (
            <div className="space-y-4">
              {sortedSchedules.map((schedule, index) => {
                const durationHours = schedule.route?.duration_hours 
                  ? `${Math.floor(Number(schedule.route.duration_hours))}h ${Math.round((Number(schedule.route.duration_hours) % 1) * 60)}m`
                  : 'N/A';
                
                return (
                  <div
                    key={schedule.id}
                    className="bg-card rounded-2xl border border-border/50 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden animate-fade-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    {/* Operator Info */}
                    <div className="flex-shrink-0 lg:w-48">
                      <div className="flex items-center gap-2 mb-2">
                        {schedule.route?.operator?.logo_url ? (
                          <img
                            src={schedule.route.operator.logo_url}
                            alt={schedule.route.operator.company_name || 'Operator logo'}
                            className="w-10 h-10 rounded-lg object-cover border border-border"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-teal/20 flex items-center justify-center">
                            <Users className="w-5 h-5 text-teal" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-display font-semibold text-lg text-foreground">
                              {schedule.route?.operator?.company_name || 'Bus Operator'}
                            </h3>
                            {schedule.route?.operator?.status === 'approved' && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-500/20 text-green-600 rounded text-xs font-medium">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                Verified
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {schedule.bus?.bus_type && (
                        <span className="inline-block px-2 py-1 bg-secondary rounded text-xs font-medium text-secondary-foreground mt-1">
                          {schedule.bus.bus_type}
                        </span>
                      )}
                      {/* Bus Information */}
                      {schedule.bus && (
                        <div className="mt-2 space-y-1.5">
                          {schedule.bus.plate_number && (
                            <div className="flex items-center gap-2 text-sm">
                              <Bus className="w-4 h-4 text-amber" />
                              <span className="text-xs text-muted-foreground font-mono">
                                {schedule.bus.plate_number}
                              </span>
                            </div>
                          )}
                          {schedule.bus.amenities && schedule.bus.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {schedule.bus.amenities.slice(0, 3).map((amenity, idx) => (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.5 bg-muted rounded text-xs text-muted-foreground"
                                >
                                  {amenity}
                                </span>
                              ))}
                              {schedule.bus.amenities.length > 3 && (
                                <span className="px-1.5 py-0.5 text-xs text-muted-foreground">
                                  +{schedule.bus.amenities.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                        {/* Time Info */}
                        <div className="flex-1 flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-foreground">
                              {schedule.departure_time.substring(0, 5)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {schedule.route?.departure_region?.name || fromRegion?.name || 'Departure'}
                            </p>
                          </div>
                          <div className="flex-1 flex flex-col items-center gap-1">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span className="text-sm">{durationHours}</span>
                            </div>
                            <div className="w-full h-0.5 bg-border relative">
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-teal" />
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber" />
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-foreground">
                              {schedule.arrival_time ? schedule.arrival_time.substring(0, 5) : 'N/A'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {schedule.route?.destination_region?.name || toRegion?.name || 'Destination'}
                            </p>
                          </div>
                        </div>

                        {/* Amenities */}
                        <div className="flex items-center gap-2 lg:w-32">
                          {schedule.bus?.amenities?.map((amenity) => {
                            const Icon = amenityIcons[amenity.toLowerCase()];
                            return Icon ? (
                              <div
                                key={amenity}
                                className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center"
                                title={amenity.toUpperCase()}
                              >
                                <Icon className="w-4 h-4 text-muted-foreground" />
                              </div>
                            ) : null;
                          })}
                        </div>

                        {/* Price & Booking */}
                        <div className="flex flex-col items-end gap-2 lg:w-48">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-teal">
                              {formatPrice(Number(schedule.price_tzs))}
                            </p>
                            <p className="text-sm text-muted-foreground">per seat</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Users className="w-4 h-4" />
                              <span>{schedule.available_seats} seats left</span>
                            </div>
                          </div>
                          <Button 
                            variant="amber" 
                            className="w-full lg:w-auto"
                            onClick={() => navigate(`/booking/${schedule.id}`)}
                            disabled={schedule.available_seats === 0}
                            asChild
                          >
                            <Link to={`/booking/${schedule.id}`}>
                              {schedule.available_seats === 0 ? 'Sold Out' : 'Select Seats'}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SearchResults;

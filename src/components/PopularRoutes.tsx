import { ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { POPULAR_ROUTES } from '@/lib/constants';

// Popular routes component - displays most traveled bus routes
const PopularRoutes = () => {
  return (
    <section className="py-20 bg-sand">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-amber/10 text-amber text-sm font-medium mb-4">
            Popular Routes
          </span>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Most Traveled Routes
          </h2>
          <p className="text-muted-foreground">
            Explore the most popular bus routes across Tanzania. Book your next journey with confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {POPULAR_ROUTES.map((route, index) => (
            <div
              key={route.id}
              className="group bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border/50 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Route Visual */}
              <div className="p-6 bg-gradient-to-br from-teal/5 to-amber/5">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-foreground">{route.fromName}</p>
                    <p className="text-sm text-muted-foreground">Departure</p>
                  </div>
                  <div className="px-4">
                    <div className="w-12 h-12 rounded-full bg-amber/10 flex items-center justify-center group-hover:bg-amber group-hover:text-accent-foreground transition-colors">
                      <ArrowRight className="w-5 h-5 text-amber group-hover:text-accent-foreground" />
                    </div>
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-lg font-semibold text-foreground">{route.toName}</p>
                    <p className="text-sm text-muted-foreground">Arrival</p>
                  </div>
                </div>
              </div>

              {/* Route Info */}
              <div className="p-6 border-t border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{route.duration}</span>
                  </div>
                </div>
                <Button variant="teal-outline" className="w-full" asChild>
                  <Link to={`/search?from=${route.from}&to=${route.to}`}>
                    View Buses
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button variant="outline" size="lg" asChild>
            <Link to="/routes">
              View All Routes
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PopularRoutes;

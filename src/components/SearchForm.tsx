import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Search, ArrowRightLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRegions, usePopularRegions } from '@/hooks/use-regions';

const SearchForm = () => {
  const navigate = useNavigate();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');

  const { data: allRegions = [], isLoading: loadingAll } = useRegions();
  const { data: popularRegions = [], isLoading: loadingPopular } = usePopularRegions();

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (from && to && date) {
      navigate(`/search?from=${from}&to=${to}&date=${date}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="bg-card rounded-2xl shadow-xl p-4 lg:p-6 border border-border/50">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto,1fr,1fr,auto] gap-4 items-end">
          {/* From */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal" />
              From
            </label>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border-2 border-input bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
              required
              disabled={loadingAll || loadingPopular}
            >
              <option value="">Select departure</option>
              {loadingPopular ? (
                <option disabled>Loading...</option>
              ) : (
                <>
                  {popularRegions.length > 0 && (
                    <optgroup label="Popular">
                      {popularRegions.map((region) => (
                        <option key={region.id} value={region.id}>
                          {region.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="All Regions">
                    {allRegions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </optgroup>
                </>
              )}
            </select>
          </div>

          {/* Swap Button */}
          <button
            type="button"
            onClick={handleSwap}
            className="hidden lg:flex w-10 h-10 rounded-full bg-secondary hover:bg-muted items-center justify-center transition-colors self-end mb-1"
          >
            <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* To */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber" />
              To
            </label>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border-2 border-input bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
              required
              disabled={loadingAll || loadingPopular}
            >
              <option value="">Select destination</option>
              {loadingPopular ? (
                <option disabled>Loading...</option>
              ) : (
                <>
                  {popularRegions.length > 0 && (
                    <optgroup label="Popular">
                      {popularRegions.map((region) => (
                        <option key={region.id} value={region.id}>
                          {region.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="All Regions">
                    {allRegions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </optgroup>
                </>
              )}
            </select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal" />
              Travel Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full h-12 px-4 rounded-xl border-2 border-input bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
              required
            />
          </div>

          {/* Search Button */}
          <Button type="submit" variant="amber" size="lg" className="h-12">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SearchForm;

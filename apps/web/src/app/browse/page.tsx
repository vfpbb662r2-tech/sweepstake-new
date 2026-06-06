'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, SortAsc, SortDesc, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SweepstakeCard } from '@/components/sweepstake/SweepstakeCard';
import { JoinModal } from '@/components/sweepstake/JoinModal';
import { toast } from 'sonner';

// Mock data - replace with actual API calls
const mockSweepstakes = [
  {
    id: '1',
    name: 'World Cup 2024 Champions League',
    description: 'Join us for the ultimate World Cup experience with fantastic prizes!',
    createdBy: {
      id: '1',
      name: 'John Smith',
      avatar: null,
    },
    tournament: {
      name: 'FIFA World Cup 2024',
      startDate: '2024-11-20T10:00:00Z',
    },
    settings: {
      isPublic: true,
      maxParticipants: 32,
      entryFee: 25,
      currency: '$',
    },
    participants: [
      { id: '1', user: { name: 'Alice Johnson', avatar: null } },
      { id: '2', user: { name: 'Bob Wilson', avatar: null } },
      { id: '3', user: { name: 'Carol Davis', avatar: null } },
    ],
    status: 'open' as const,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Friends & Family Cup',
    description: 'A fun sweepstake for friends and family members only.',
    createdBy: {
      id: '2',
      name: 'Sarah Miller',
      avatar: null,
    },
    tournament: {
      name: 'FIFA World Cup 2024',
      startDate: '2024-11-20T10:00:00Z',
    },
    settings: {
      isPublic: false,
      maxParticipants: 16,
    },
    participants: [
      { id: '4', user: { name: 'Mike Brown', avatar: null } },
      { id: '5', user: { name: 'Lisa Taylor', avatar: null } },
    ],
    status: 'open' as const,
    createdAt: '2024-01-20T14:30:00Z',
  },
  {
    id: '3',
    name: 'Office Tournament',
    description: 'Company-wide World Cup sweepstake with great prizes!',
    createdBy: {
      id: '3',
      name: 'David Chen',
      avatar: null,
    },
    tournament: {
      name: 'FIFA World Cup 2024',
      startDate: '2024-11-20T10:00:00Z',
    },
    settings: {
      isPublic: true,
      maxParticipants: 64,
      entryFee: 10,
      currency: '$',
    },
    participants: Array.from({ length: 45 }, (_, i) => ({
      id: `office-${i}`,
      user: { name: `Office User ${i + 1}`, avatar: null },
    })),
    status: 'open' as const,
    createdAt: '2024-01-18T09:00:00Z',
  },
  {
    id: '4',
    name: 'High Stakes Championship',
    description: 'For serious players only - big entry fee, bigger prizes!',
    createdBy: {
      id: '4',
      name: 'Emma Wilson',
      avatar: null,
    },
    tournament: {
      name: 'FIFA World Cup 2024',
      startDate: '2024-11-20T10:00:00Z',
    },
    settings: {
      isPublic: true,
      maxParticipants: 32,
      entryFee: 100,
      currency: '$',
    },
    participants: Array.from({ length: 32 }, (_, i) => ({
      id: `high-${i}`,
      user: { name: `Player ${i + 1}`, avatar: null },
    })),
    status: 'full' as const,
    createdAt: '2024-01-10T16:00:00Z',
  },
];

interface FilterState {
  status: string[];
  hasEntryFee: boolean | null;
  isPublic: boolean | null;
}

type SortOption = 'newest' | 'oldest' | 'participants' | 'entryFee';

export default function BrowsePage() {
  const [sweepstakes, setSweepstakes] = useState(mockSweepstakes);
  const [filteredSweepstakes, setFilteredSweepstakes] = useState(mockSweepstakes);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    hasEntryFee: null,
    isPublic: null,
  });

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedSweepstake, setSelectedSweepstake] = useState<string | null>(null);

  // Filter and sort sweepstakes
  useEffect(() => {
    let filtered = sweepstakes.filter((sweepstake) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = sweepstake.name.toLowerCase().includes(query);
        const matchesDescription = sweepstake.description?.toLowerCase().includes(query);
        const matchesTournament = sweepstake.tournament.name.toLowerCase().includes(query);
        const matchesCreator = sweepstake.createdBy.name.toLowerCase().includes(query);
        
        if (!matchesName && !matchesDescription && !matchesTournament && !matchesCreator) {
          return false;
        }
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(sweepstake.status)) {
        return false;
      }

      // Entry fee filter
      if (filters.hasEntryFee !== null) {
        const hasEntryFee = Boolean(sweepstake.settings.entryFee);
        if (hasEntryFee !== filters.hasEntryFee) {
          return false;
        }
      }

      // Public/Private filter
      if (filters.isPublic !== null && sweepstake.settings.isPublic !== filters.isPublic) {
        return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'newest':
        case 'oldest':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          if (sortBy === 'newest') comparison *= -1;
          break;
        
        case 'participants':
          comparison = a.participants.length - b.participants.length;
          break;
        
        case 'entryFee':
          comparison = (a.settings.entryFee || 0) - (b.settings.entryFee || 0);
          break;
      }

      return sortDirection === 'desc' ? -comparison : comparison;
    });

    setFilteredSweepstakes(filtered);
  }, [sweepstakes, searchQuery, sortBy, sortDirection, filters]);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, you would fetch fresh data here
      toast.success('Sweepstakes refreshed');
    } catch (error) {
      toast.error('Failed to refresh sweepstakes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinSweepstake = async (sweepstakeId: string) => {
    const sweepstake = sweepstakes.find(s => s.id === sweepstakeId);
    if (!sweepstake) return;

    if (!sweepstake.settings.isPublic) {
      setSelectedSweepstake(sweepstakeId);
      setShowJoinModal(true);
      return;
    }

    try {
      // Simulate joining
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Successfully joined "${sweepstake.name}"!`);
    } catch (error) {
      toast.error('Failed to join sweepstake');
    }
  };

  const handleJoinWithCode = async (joinCode?: string) => {
    if (!selectedSweepstake) return;

    const sweepstake = sweepstakes.find(s => s.id === selectedSweepstake);
    if (!sweepstake) return;

    try {
      // Simulate joining with code
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`Successfully joined "${sweepstake.name}"!`);
      setShowJoinModal(false);
      setSelectedSweepstake(null);
    } catch (error) {
      toast.error('Invalid join code or failed to join');
    }
  };

  const toggleFilter = (filterType: keyof FilterState, value: any) => {
    setFilters(prev => {
      if (filterType === 'status') {
        const statusArray = prev.status.includes(value)
          ? prev.status.filter(s => s !== value)
          : [...prev.status, value];
        return { ...prev, status: statusArray };
      }
      
      return {
        ...prev,
        [filterType]: prev[filterType] === value ? null : value,
      };
    });
  };

  const clearFilters = () => {
    setFilters({
      status: [],
      hasEntryFee: null,
      isPublic: null,
    });
    setSearchQuery('');
  };

  const activeFilterCount = Object.values(filters).filter(f => 
    Array.isArray(f) ? f.length > 0 : f !== null
  ).length + (searchQuery ? 1 : 0);

  const selectedSweepstakeData = selectedSweepstake 
    ? sweepstakes.find(s => s.id === selectedSweepstake)
    : null;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">
            Browse Sweepstakes
          </h1>
          <p className="text-gray-400">
            Discover and join exciting sweepstakes from around the community
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search sweepstakes, tournaments, or creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-900 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-blue-500"
            />
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge className="ml-2 bg-blue-600 text-white">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-900 border-gray-700 text-gray-100 w-64">
                <DropdownMenuLabel className="text-gray-300">Filter Options</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                
                <DropdownMenuLabel className="text-gray-400 font-normal">Status</DropdownMenuLabel>
                {['open', 'full', 'started', 'completed'].map(status => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={filters.status.includes(status)}
                    onCheckedChange={() => toggleFilter('status', status)}
                    className="text-gray-300 focus:bg-gray-800"
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </DropdownMenuCheckboxItem>
                ))}
                
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuLabel className="text-gray-400 font-normal">Entry Fee</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={filters.hasEntryFee === true}
                  onCheckedChange={() => toggleFilter('hasEntryFee', true)}
                  className="text-gray-300 focus:bg-gray-800"
                >
                  Has Entry Fee
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.hasEntryFee === false}
                  onCheckedChange={() => toggleFilter('hasEntryFee', false)}
                  className="text-gray-300 focus:bg-gray-800"
                >
                  Free to Join
                </DropdownMenuCheckboxItem>
                
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuLabel className="text-gray-400 font-normal">Visibility</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={filters.isPublic === true}
                  onCheckedChange={() => toggleFilter('isPublic', true)}
                  className="text-gray-300 focus:bg-gray-800"
                >
                  Public
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.isPublic === false}
                  onCheckedChange={() => toggleFilter('isPublic', false)}
                  className="text-gray-300 focus:bg-gray-800"
                >
                  Private
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort Options */}
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-48 bg-gray-900 border-gray-700 text-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700 text-gray-100">
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="participants">Most Participants</SelectItem>
                <SelectItem value="entryFee">Entry Fee</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Direction */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              {sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>

            {/* Clear Filters */}
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-400 hover:text-gray-300 hover:bg-gray-800"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-400">
              Found {filteredSweepstakes.length} sweepstake{filteredSweepstakes.length !== 1 ? 's' : ''}
            </p>
          </div>

          {filteredSweepstakes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">No sweepstakes found</div>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or filters
              </p>
              <Button
                onClick={clearFilters}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSweepstakes.map((sweepstake) => (
                <SweepstakeCard
                  key={sweepstake.id}
                  sweepstake={sweepstake}
                  onJoin={handleJoinSweepstake}
                  className="h-full"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Join Modal */}
      <JoinModal
        isOpen={showJoinModal}
        onClose={() => {
          setShowJoinModal(false);
          setSelectedSweepstake(null);
        }}
        onConfirm={handleJoinWithCode}
        sweepstake={selectedSweepstakeData ? {
          name: selectedSweepstakeData.name,
          description: selectedSweepstakeData.description,
          tournament: selectedSweepstakeData.tournament.name,
          entryFee: selectedSweepstakeData.settings.entryFee,
          currency: selectedSweepstakeData.settings.currency,
          participantCount: selectedSweepstakeData.participants.length,
          maxParticipants: selectedSweepstakeData.settings.maxParticipants,
        } : undefined}
        requiresJoinCode={!selectedSweepstakeData?.settings.isPublic}
      />
    </div>
  );
}
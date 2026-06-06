'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useJoinSweepstake } from '@/hooks/useJoinSweepstake';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Users, Calendar, Trophy, ArrowLeft, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SweepstakePreview {
  id: string;
  name: string;
  description: string;
  maxParticipants: number;
  currentParticipants: number;
  entryFee: number;
  currency: string;
  prizeDistribution: {
    first: number;
    second: number;
    third: number;
  };
  startDate: string;
  endDate: string;
  status: 'open' | 'starting' | 'in_progress' | 'completed';
  createdBy: string;
  rules: string[];
}

const mockSweepstakeData: SweepstakePreview = {
  id: '1',
  name: 'World Cup 2024 Office League',
  description: 'Join our exciting World Cup sweepstake! Random team assignment with amazing prizes.',
  maxParticipants: 32,
  currentParticipants: 18,
  entryFee: 10,
  currency: 'GBP',
  prizeDistribution: {
    first: 60,
    second: 25,
    third: 15
  },
  startDate: '2024-06-14T18:00:00Z',
  endDate: '2024-07-14T21:00:00Z',
  status: 'open',
  createdBy: 'John Smith',
  rules: [
    'Teams will be randomly assigned after all spots are filled',
    'Entry fee must be paid before team assignment',
    'No refunds once tournament starts',
    'Winners will be contacted within 24 hours of tournament end'
  ]
};

export default function JoinSweepstakePage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  
  const [sweepstake, setSweepstake] = useState<SweepstakePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const {
    joinSweepstake,
    loading: joining,
    error: joinError,
    success: joinSuccess
  } = useJoinSweepstake();

  useEffect(() => {
    const fetchSweepstake = async () => {
      try {
        setLoading(true);
        // Simulate API call to fetch sweepstake by code
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (code === 'INVALID') {
          throw new Error('Invalid or expired invite code');
        }
        
        setSweepstake(mockSweepstakeData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load sweepstake');
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      fetchSweepstake();
    }
  }, [code]);

  const handleJoin = async () => {
    if (!sweepstake) return;
    
    try {
      await joinSweepstake(sweepstake.id, code);
    } catch (err) {
      // Error handled by hook
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'starting':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'completed':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Open for Registration';
      case 'starting':
        return 'Starting Soon';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
              <p className="text-slate-400">Loading sweepstake details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !sweepstake) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="mb-6 text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <XCircle className="h-12 w-12 text-red-400" />
                <h2 className="text-xl font-semibold text-slate-100">Sweepstake Not Found</h2>
                <p className="text-slate-400 max-w-md">
                  {error || 'The sweepstake you\'re looking for doesn\'t exist or the invite code has expired.'}
                </p>
                <Button 
                  onClick={() => router.push('/dashboard')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Browse Available Sweepstakes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (joinSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <CheckCircle className="h-12 w-12 text-emerald-400" />
                <h2 className="text-xl font-semibold text-slate-100">Successfully Joined!</h2>
                <p className="text-slate-400 max-w-md">
                  Welcome to "{sweepstake.name}"! You'll receive team assignment details once the sweepstake starts.
                </p>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => router.push('/dashboard')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    View My Sweepstakes
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/join')}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                  >
                    Join Another
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const canJoin = sweepstake.status === 'open' && sweepstake.currentParticipants < sweepstake.maxParticipants;
  const spotsRemaining = sweepstake.maxParticipants - sweepstake.currentParticipants;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="mb-6 text-slate-400 hover:text-slate-100 hover:bg-slate-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="space-y-6">
          {/* Header Card */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-2xl text-slate-100">{sweepstake.name}</CardTitle>
                  <CardDescription className="text-slate-400 text-base">
                    {sweepstake.description}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(sweepstake.status)}>
                  {getStatusText(sweepstake.status)}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Participation Info */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-100">
                  <Users className="mr-2 h-5 w-5 text-blue-400" />
                  Participation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Participants</span>
                  <span className="text-slate-100">
                    {sweepstake.currentParticipants} / {sweepstake.maxParticipants}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Spots Remaining</span>
                  <span className={`font-medium ${spotsRemaining <= 5 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                    {spotsRemaining}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Entry Fee</span>
                  <span className="text-slate-100 font-medium">
                    {formatCurrency(sweepstake.entryFee, sweepstake.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Organizer</span>
                  <span className="text-slate-100">{sweepstake.createdBy}</span>
                </div>
                
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(sweepstake.currentParticipants / sweepstake.maxParticipants) * 100}%` 
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    {Math.round((sweepstake.currentParticipants / sweepstake.maxParticipants) * 100)}% full
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Prize & Schedule Info */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-100">
                  <Trophy className="mr-2 h-5 w-5 text-yellow-400" />
                  Prizes & Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Prize Distribution</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">1st Place</span>
                      <span className="text-yellow-400 font-medium">{sweepstake.prizeDistribution.first}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">2nd Place</span>
                      <span className="text-slate-300 font-medium">{sweepstake.prizeDistribution.second}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">3rd Place</span>
                      <span className="text-amber-600 font-medium">{sweepstake.prizeDistribution.third}%</span>
                    </div>
                  </div>
                </div>
                
                <Separator className="bg-slate-800" />
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Calendar className="h-4 w-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-300">Starts</p>
                      <p className="text-xs text-slate-400">{formatDate(sweepstake.startDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Calendar className="h-4 w-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-300">Ends</p>
                      <p className="text-xs text-slate-400">{formatDate(sweepstake.endDate)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rules */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-100">Rules & Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {sweepstake.rules.map((rule, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span className="text-slate-300 text-sm">{rule}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Error Display */}
          {joinError && (
            <Alert className="bg-red-950 border-red-900 text-red-400">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                {joinError}
              </AlertDescription>
            </Alert>
          )}

          {/* Join Actions */}
          <Card className="bg-slate-900 border-slate-800">
            <CardFooter className="flex flex-col space-y-4 pt-6">
              {canJoin ? (
                <>
                  <div className="text-center space-y-2">
                    <p className="text-slate-300">
                      Ready to join "{sweepstake.name}"?
                    </p>
                    <p className="text-sm text-slate-400">
                      Your team will be randomly assigned once all spots are filled.
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleJoin}
                    disabled={joining}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    size="lg"
                  >
                    {joining ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      <>
                        Join for {formatCurrency(sweepstake.entryFee, sweepstake.currency)}
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className="text-center space-y-2 w-full">
                  <p className="text-slate-400">
                    {sweepstake.status === 'open' 
                      ? 'This sweepstake is full' 
                      : 'This sweepstake is no longer accepting new participants'
                    }
                  </p>
                  <Button 
                    onClick={() => router.push('/join')}
                    variant="outline"
                    className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                  >
                    Browse Other Sweepstakes
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
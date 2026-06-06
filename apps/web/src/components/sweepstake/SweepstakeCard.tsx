'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarIcon, UsersIcon, TrophyIcon, LockIcon, UnlockIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { JoinModal } from './JoinModal';

export interface SweepstakeCardProps {
  sweepstake: {
    id: string;
    name: string;
    description?: string;
    createdBy: {
      id: string;
      name: string;
      avatar?: string;
    };
    tournament: {
      name: string;
      startDate: string;
    };
    settings: {
      isPublic: boolean;
      maxParticipants?: number;
      entryFee?: number;
      currency?: string;
    };
    participants: Array<{
      id: string;
      user: {
        name: string;
        avatar?: string;
      };
    }>;
    status: 'open' | 'full' | 'started' | 'completed';
    createdAt: string;
  };
  onJoin?: (sweepstakeId: string) => void;
  className?: string;
}

export function SweepstakeCard({ sweepstake, onJoin, className }: SweepstakeCardProps) {
  const [showJoinModal, setShowJoinModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-900/20 text-green-400 border-green-900/30';
      case 'full':
        return 'bg-yellow-900/20 text-yellow-400 border-yellow-900/30';
      case 'started':
        return 'bg-blue-900/20 text-blue-400 border-blue-900/30';
      case 'completed':
        return 'bg-gray-700/20 text-gray-400 border-gray-700/30';
      default:
        return 'bg-gray-700/20 text-gray-400 border-gray-700/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Open to Join';
      case 'full':
        return 'Full';
      case 'started':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const canJoin = sweepstake.status === 'open' && 
    (!sweepstake.settings.maxParticipants || 
     sweepstake.participants.length < sweepstake.settings.maxParticipants);

  const participantCount = sweepstake.participants.length;
  const maxParticipants = sweepstake.settings.maxParticipants;

  const handleJoinClick = () => {
    if (canJoin) {
      setShowJoinModal(true);
    }
  };

  const handleJoinConfirm = () => {
    onJoin?.(sweepstake.id);
    setShowJoinModal(false);
  };

  return (
    <>
      <Card className={`bg-gray-900/50 border-gray-700/50 hover:bg-gray-900/70 transition-colors ${className}`}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-gray-100 text-lg font-semibold truncate">
                {sweepstake.name}
              </CardTitle>
              <CardDescription className="text-gray-400 mt-1 line-clamp-2">
                {sweepstake.description || 'Join this sweepstake for a chance to win!'}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(sweepstake.status)}>
              {getStatusText(sweepstake.status)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Tournament Info */}
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <TrophyIcon className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">{sweepstake.tournament.name}</span>
          </div>

          {/* Tournament Start Date */}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <CalendarIcon className="h-4 w-4" />
            <span>
              Starts {formatDistanceToNow(new Date(sweepstake.tournament.startDate), { addSuffix: true })}
            </span>
          </div>

          {/* Participants */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <UsersIcon className="h-4 w-4" />
              <span>
                {participantCount}
                {maxParticipants && ` / ${maxParticipants}`} participants
              </span>
            </div>
            
            {/* Privacy Indicator */}
            <div className="flex items-center gap-1 text-xs text-gray-500">
              {sweepstake.settings.isPublic ? (
                <>
                  <UnlockIcon className="h-3 w-3" />
                  <span>Public</span>
                </>
              ) : (
                <>
                  <LockIcon className="h-3 w-3" />
                  <span>Private</span>
                </>
              )}
            </div>
          </div>

          {/* Entry Fee */}
          {sweepstake.settings.entryFee && (
            <div className="text-sm text-gray-300">
              Entry Fee: {sweepstake.settings.currency || '$'}{sweepstake.settings.entryFee}
            </div>
          )}

          {/* Creator Info */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-700/50">
            <Avatar className="h-6 w-6">
              <AvatarImage src={sweepstake.createdBy.avatar} alt={sweepstake.createdBy.name} />
              <AvatarFallback className="bg-gray-700 text-gray-300 text-xs">
                {sweepstake.createdBy.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm text-gray-400">
              Created by <span className="text-gray-300">{sweepstake.createdBy.name}</span>
            </div>
          </div>

          {/* Recent Participants Preview */}
          {participantCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {sweepstake.participants.slice(0, 4).map((participant) => (
                  <Avatar key={participant.id} className="h-6 w-6 border-2 border-gray-900">
                    <AvatarImage src={participant.user.avatar} alt={participant.user.name} />
                    <AvatarFallback className="bg-gray-700 text-gray-300 text-xs">
                      {participant.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              {participantCount > 4 && (
                <span className="text-xs text-gray-500">
                  +{participantCount - 4} more
                </span>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-4">
          <Button
            onClick={handleJoinClick}
            disabled={!canJoin}
            className={`w-full ${
              canJoin
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {sweepstake.status === 'full' 
              ? 'Full' 
              : sweepstake.status !== 'open' 
                ? 'Cannot Join'
                : 'Join Sweepstake'
            }
          </Button>
        </CardFooter>
      </Card>

      <JoinModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onConfirm={handleJoinConfirm}
        sweepstake={{
          name: sweepstake.name,
          description: sweepstake.description,
          tournament: sweepstake.tournament.name,
          entryFee: sweepstake.settings.entryFee,
          currency: sweepstake.settings.currency,
          participantCount: participantCount,
          maxParticipants: sweepstake.settings.maxParticipants
        }}
      />
    </>
  );
}
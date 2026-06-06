'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircleIcon, TrophyIcon, UsersIcon, CreditCardIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (joinCode?: string) => void;
  sweepstake?: {
    name: string;
    description?: string;
    tournament: string;
    entryFee?: number;
    currency?: string;
    participantCount: number;
    maxParticipants?: number;
  };
  requiresJoinCode?: boolean;
  error?: string;
}

export function JoinModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  sweepstake,
  requiresJoinCode = false,
  error
}: JoinModalProps) {
  const [joinCode, setJoinCode] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (requiresJoinCode && !joinCode.trim()) {
      return;
    }

    if (sweepstake?.entryFee && !acceptedTerms) {
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm(joinCode.trim() || undefined);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setJoinCode('');
      setAcceptedTerms(false);
      onClose();
    }
  };

  const canJoin = (!requiresJoinCode || joinCode.trim()) && 
                  (!sweepstake?.entryFee || acceptedTerms) &&
                  !isLoading;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-gray-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-100">
            {requiresJoinCode ? 'Enter Join Code' : 'Join Sweepstake'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {requiresJoinCode 
              ? 'Enter the join code to access this private sweepstake.'
              : sweepstake 
                ? `Confirm your participation in "${sweepstake.name}".`
                : 'Confirm that you want to join this sweepstake.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert className="bg-red-900/20 border-red-900/30">
              <AlertCircleIcon className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-400">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {requiresJoinCode && (
            <div className="space-y-2">
              <Label htmlFor="joinCode" className="text-gray-300">
                Join Code
              </Label>
              <Input
                id="joinCode"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter join code..."
                className="bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-500 focus:border-blue-500"
                maxLength={8}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                Join codes are typically 6-8 characters long
              </p>
            </div>
          )}

          {sweepstake && (
            <div className="space-y-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <div className="flex items-center gap-2 text-sm">
                <TrophyIcon className="h-4 w-4 text-yellow-500" />
                <span className="font-medium text-gray-200">{sweepstake.tournament}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-400">
                <UsersIcon className="h-4 w-4" />
                <span>
                  {sweepstake.participantCount}
                  {sweepstake.maxParticipants && ` / ${sweepstake.maxParticipants}`} participants
                </span>
              </div>

              {sweepstake.entryFee && (
                <div className="flex items-center gap-2 text-sm">
                  <CreditCardIcon className="h-4 w-4 text-green-500" />
                  <span className="text-gray-200">
                    Entry Fee: {sweepstake.currency || '$'}{sweepstake.entryFee}
                  </span>
                </div>
              )}

              {sweepstake.description && (
                <p className="text-sm text-gray-400 mt-2">
                  {sweepstake.description}
                </p>
              )}
            </div>
          )}

          {sweepstake?.entryFee && (
            <div className="space-y-3">
              <Alert className="bg-blue-900/20 border-blue-900/30">
                <AlertCircleIcon className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-300">
                  This sweepstake has an entry fee of {sweepstake.currency || '$'}{sweepstake.entryFee}. 
                  Payment will be processed after confirmation.
                </AlertDescription>
              </Alert>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={setAcceptedTerms}
                  disabled={isLoading}
                  className="border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <Label 
                  htmlFor="terms" 
                  className="text-sm text-gray-400 leading-relaxed cursor-pointer"
                >
                  I agree to pay the entry fee and understand that it is non-refundable once the sweepstake begins.
                </Label>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-gray-100"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!canJoin}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-700 disabled:text-gray-400"
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white" />
                Joining...
              </>
            ) : sweepstake?.entryFee ? (
              `Pay ${sweepstake.currency || '$'}${sweepstake.entryFee} & Join`
            ) : (
              'Join Sweepstake'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
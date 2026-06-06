'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Users, Trophy, Zap } from 'lucide-react'
import { toast } from 'sonner'

interface QuickActionsProps {
  onSweepstakeCreated: () => void
}

export function QuickActions({ onSweepstakeCreated }: QuickActionsProps) {
  const router = useRouter()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [joinDialogOpen, setJoinDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [sweepstakeName, setSweepstakeName] = useState('')
  const [inviteCode, setInviteCode] = useState('')

  const handleCreateSweepstake = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!sweepstakeName.trim()) {
      toast.error('Please enter a sweepstake name')
      return
    }

    try {
      setIsCreating(true)
      const response = await fetch('/api/sweepstakes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: sweepstakeName.trim(),
          maxParticipants: 32, // Default for World Cup
          tournament: 'world-cup-2026'
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Sweepstake created successfully!')
        setCreateDialogOpen(false)
        setSweepstakeName('')
        onSweepstakeCreated()
        router.push(`/sweepstakes/${data.sweepstake.id}`)
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to create sweepstake')
      }
    } catch (error) {
      console.error('Failed to create sweepstake:', error)
      toast.error('Failed to create sweepstake')
    } finally {
      setIsCreating(false)
    }
  }

  const handleJoinSweepstake = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inviteCode.trim()) {
      toast.error('Please enter an invite code')
      return
    }

    try {
      setIsJoining(true)
      const response = await fetch('/api/sweepstakes/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          inviteCode: inviteCode.trim().toUpperCase()
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Successfully joined sweepstake!')
        setJoinDialogOpen(false)
        setInviteCode('')
        onSweepstakeCreated()
        router.push(`/sweepstakes/${data.sweepstake.id}`)
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to join sweepstake')
      }
    } catch (error) {
      console.error('Failed to join sweepstake:', error)
      toast.error('Failed to join sweepstake')
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Create Sweepstake */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogTrigger asChild>
          <Card className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 transition-all duration-200 cursor-pointer group">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-3 p-3 bg-green-500/10 rounded-full group-hover:bg-green-500/20 transition-colors">
                <Plus className="h-8 w-8 text-green-400" />
              </div>
              <CardTitle className="text-lg text-white group-hover:text-green-400 transition-colors">
                Create Sweepstake
              </CardTitle>
              <CardDescription className="text-gray-400">
                Start a new sweepstake and invite friends
              </CardDescription>
            </CardHeader>
          </Card>
        </DialogTrigger>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Sweepstake</DialogTitle>
            <DialogDescription className="text-gray-400">
              Create a sweepstake for the 2026 World Cup and invite your friends to join.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSweepstake}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Sweepstake Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Office World Cup 2026"
                  value={sweepstakeName}
                  onChange={(e) => setSweepstakeName(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-gray-400 focus:border-green-500"
                  disabled={isCreating}
                />
              </div>
              <div className="text-sm text-gray-400">
                <p>• Maximum 32 participants (World Cup teams)</p>
                <p>• You'll be able to customize settings after creation</p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                disabled={isCreating}
                className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isCreating || !sweepstakeName.trim()}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isCreating ? 'Creating...' : 'Create Sweepstake'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Join Sweepstake */}
      <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
        <DialogTrigger asChild>
          <Card className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 transition-all duration-200 cursor-pointer group">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-3 p-3 bg-blue-500/10 rounded-full group-hover:bg-blue-500/20 transition-colors">
                <Users className="h-8 w-8 text-blue-400" />
              </div>
              <CardTitle className="text-lg text-white group-hover:text-blue-400 transition-colors">
                Join Sweepstake
              </CardTitle>
              <CardDescription className="text-gray-400">
                Enter an invite code to join existing sweepstake
              </CardDescription>
            </CardHeader>
          </Card>
        </DialogTrigger>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Join Sweepstake</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter the invite code shared by the sweepstake creator.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleJoinSweepstake}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-white">Invite Code</Label>
                <Input
                  id="code"
                  placeholder="e.g. ABC123"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-gray-400 focus:border-blue-500 font-mono text-center text-lg"
                  disabled={isJoining}
                  maxLength={6}
                />
              </div>
              <div className="text-sm text-gray-400">
                <p>• Codes are 6 characters long</p>
                <p>• Ask the creator for the invite code</p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setJoinDialogOpen(false)}
                disabled={isJoining}
                className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isJoining || !inviteCode.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isJoining ? 'Joining...' : 'Join Sweepstake'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Quick Browse */}
      <Card 
        className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 transition-all duration-200 cursor-pointer group"
        onClick={() => router.push('/browse')}
      >
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 p-3 bg-purple-500/10 rounded-full group-hover:bg-purple-500/20 transition-colors">
            <Trophy className="h-8 w-8 text-purple-400" />
          </div>
          <CardTitle className="text-lg text-white group-hover:text-purple-400 transition-colors">
            Browse Public
          </CardTitle>
          <CardDescription className="text-gray-400">
            Discover and join public sweepstakes
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
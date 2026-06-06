'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { 
  Users, 
  Calendar, 
  MoreVertical, 
  Settings, 
  Play, 
  Eye, 
  Share2, 
  Trash2,
  Trophy,
  Clock,
  Flag
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface Sweepstake {
  id: string
  name: string
  status: 'pending' | 'active' | 'completed'
  participantCount: number
  maxParticipants: number
  createdAt: string
  startDate: string | null
  isCreator: boolean
  userTeam?: {
    name: string
    flag: string
  }
}

interface SweepstakeListProps {
  sweepstakes: Sweepstake[]
  showCreatorActions?: boolean
  onRefresh: () => void
}

export function SweepstakeList({ 
  sweepstakes, 
  showCreatorActions = false, 
  onRefresh 
}: SweepstakeListProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sweepstakeToDelete, setSweepstakeToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'completed':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="h-3 w-3" />
      case 'pending':
        return <Clock className="h-3 w-3" />
      case 'completed':
        return <Trophy className="h-3 w-3" />
      default:
        return null
    }
  }

  const handleStartSweepstake = async (id: string) => {
    try {
      const response = await fetch(`/api/sweepstakes/${id}/start`, {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        toast.success('Sweepstake started successfully!')
        onRefresh()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to start sweepstake')
      }
    } catch (error) {
      console.error('Failed to start sweepstake:', error)
      toast.error('Failed to start sweepstake')
    }
  }

  const handleDeleteSweepstake = async (id: string) => {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/sweepstakes/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        toast.success('Sweepstake deleted successfully')
        onRefresh()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to delete sweepstake')
      }
    } catch (error) {
      console.error('Failed to delete sweepstake:', error)
      toast.error('Failed to delete sweepstake')
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setSweepstakeToDelete(null)
    }
  }

  const handleShareSweepstake = async (id: string) => {
    try {
      const url = `${window.location.origin}/join/${id}`
      await navigator.clipboard.writeText(url)
      toast.success('Invite link copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy link:', error)
      toast.error('Failed to copy invite link')
    }
  }

  const canStart = (sweepstake: Sweepstake) => {
    return sweepstake.status === 'pending' && 
           sweepstake.participantCount >= 2 && 
           sweepstake.isCreator
  }

  if (sweepstakes.length === 0) {
    return (
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-12 text-center">
          <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {showCreatorActions ? 'No sweepstakes created yet' : 'No sweepstakes joined yet'}
          </h3>
          <p className="text-gray-400 mb-6">
            {showCreatorActions 
              ? 'Create your first sweepstake to get started!'
              : 'Join a sweepstake using an invite code to get started!'
            }
          </p>
          <Button 
            onClick={() => router.push(showCreatorActions ? '/create' : '/join')}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {showCreatorActions ? 'Create Sweepstake' : 'Join Sweepstake'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {sweepstakes.map((sweepstake) => (
          <Card 
            key={sweepstake.id} 
            className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 transition-all duration-200 cursor-pointer group"
            onClick={() => router.push(`/sweepstakes/${sweepstake.id}`)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-lg text-white group-hover:text-green-400 transition-colors">
                      {sweepstake.name}
                    </CardTitle>
                    <Badge 
                      variant="outline" 
                      className={`${getStatusColor(sweepstake.status)} flex items-center gap-1 text-xs`}
                    >
                      {getStatusIcon(sweepstake.status)}
                      {sweepstake.status.charAt(0).toUpperCase() + sweepstake.status.slice(1)}
                    </Badge>
                    {sweepstake.isCreator && (
                      <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                        Creator
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-gray-400">
                    Created {formatDistanceToNow(new Date(sweepstake.createdAt))} ago
                    {sweepstake.startDate && (
                      <>
                        {' • '}
                        Starts {formatDistanceToNow(new Date(sweepstake.startDate))} from now
                      </>
                    )}
                  </CardDescription>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-slate-800"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/sweepstakes/${sweepstake.id}`)
                      }}
                      className="text-white hover:bg-slate-800 focus:bg-slate-800"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleShareSweepstake(sweepstake.id)
                      }}
                      className="text-white hover:bg-slate-800 focus:bg-slate-800"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Invite
                    </DropdownMenuItem>

                    {sweepstake.isCreator && (
                      <>
                        <DropdownMenuSeparator className="bg-slate-800" />
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/sweepstakes/${sweepstake.id}/settings`)
                          }}
                          className="text-white hover:bg-slate-800 focus:bg-slate-800"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </DropdownMenuItem>
                        
                        {canStart(sweepstake) && (
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStartSweepstake(sweepstake.id)
                            }}
                            className="text-green-400 hover:bg-slate-800 focus:bg-slate-800"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Start Sweepstake
                          </DropdownMenuItem>
                        )}
                        
                        {sweepstake.status === 'pending' && (
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation()
                              setSweepstakeToDelete(sweepstake.id)
                              setDeleteDialogOpen(true)
                            }}
                            className="text-red-400 hover:bg-slate-800 focus:bg-slate-800"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center text-gray-400">
                    <Users className="h-4 w-4 mr-2" />
                    <span className="text-sm">
                      {sweepstake.participantCount}/{sweepstake.maxParticipants} participants
                    </span>
                  </div>
                  
                  {sweepstake.startDate && (
                    <div className="flex items-center text-gray-400">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        {new Date(sweepstake.startDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {sweepstake.userTeam && (
                  <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-2">
                    <Flag className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-white font-medium">
                      {sweepstake.userTeam.name}
                    </span>
                  </div>
                )}
              </div>

              {sweepstake.status === 'pending' && sweepstake.participantCount < 2 && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-yellow-400 text-sm">
                    Need at least 2 participants to start this sweepstake
                  </p>
                </div>
              )}

              {canStart(sweepstake) && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-green-400 text-sm">
                      Ready to start! All participants can be assigned teams.
                    </p>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStartSweepstake(sweepstake.id)
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Start
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Sweepstake</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete this sweepstake? This action cannot be undone and all participants will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setDeleteDialogOpen(false)}
              className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => sweepstakeToDelete && handleDeleteSweepstake(sweepstakeToDelete)}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
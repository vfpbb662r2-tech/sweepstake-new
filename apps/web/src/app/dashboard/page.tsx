'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { SweepstakeList } from '@/components/dashboard/SweepstakeList'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Trophy, Users, Calendar, Settings } from 'lucide-react'

interface DashboardStats {
  totalSweepstakes: number
  activeSweepstakes: number
  totalParticipants: number
  upcomingDeadlines: number
}

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

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [createdSweepstakes, setCreatedSweepstakes] = useState<Sweepstake[]>([])
  const [joinedSweepstakes, setJoinedSweepstakes] = useState<Sweepstake[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch user's sweepstakes
      const sweepstakesResponse = await fetch('/api/sweepstakes/user', {
        credentials: 'include'
      })
      
      if (sweepstakesResponse.ok) {
        const data = await sweepstakesResponse.json()
        
        const created = data.sweepstakes.filter((s: Sweepstake) => s.isCreator)
        const joined = data.sweepstakes.filter((s: Sweepstake) => !s.isCreator)
        
        setCreatedSweepstakes(created)
        setJoinedSweepstakes(joined)
        
        // Calculate stats
        const totalSweepstakes = data.sweepstakes.length
        const activeSweepstakes = data.sweepstakes.filter((s: Sweepstake) => s.status === 'active').length
        const totalParticipants = data.sweepstakes.reduce((sum: number, s: Sweepstake) => sum + s.participantCount, 0)
        const upcomingDeadlines = data.sweepstakes.filter((s: Sweepstake) => 
          s.status === 'pending' && s.startDate && new Date(s.startDate) > new Date()
        ).length
        
        setStats({
          totalSweepstakes,
          activeSweepstakes,
          totalParticipants,
          upcomingDeadlines
        })
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

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

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-400">
            Manage your sweepstakes and track your progress
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-6">
                  <Skeleton className="h-12 w-12 rounded-lg bg-slate-700 mb-4" />
                  <Skeleton className="h-8 w-20 bg-slate-700 mb-2" />
                  <Skeleton className="h-4 w-32 bg-slate-700" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-white">{stats?.totalSweepstakes || 0}</p>
                      <p className="text-gray-400 text-sm">Total Sweepstakes</p>
                    </div>
                    <Trophy className="h-12 w-12 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-white">{stats?.activeSweepstakes || 0}</p>
                      <p className="text-gray-400 text-sm">Active Games</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <div className="h-6 w-6 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-white">{stats?.totalParticipants || 0}</p>
                      <p className="text-gray-400 text-sm">Total Participants</p>
                    </div>
                    <Users className="h-12 w-12 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-white">{stats?.upcomingDeadlines || 0}</p>
                      <p className="text-gray-400 text-sm">Upcoming Deadlines</p>
                    </div>
                    <Calendar className="h-12 w-12 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <QuickActions onSweepstakeCreated={fetchDashboardData} />

        {/* Sweepstakes Lists */}
        <div className="mt-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-900/50 border border-slate-800">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-gray-400"
              >
                All Sweepstakes ({(createdSweepstakes.length + joinedSweepstakes.length)})
              </TabsTrigger>
              <TabsTrigger 
                value="created" 
                className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-gray-400"
              >
                Created ({createdSweepstakes.length})
              </TabsTrigger>
              <TabsTrigger 
                value="joined" 
                className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-gray-400"
              >
                Joined ({joinedSweepstakes.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="bg-slate-900/50 border-slate-800">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-6 w-48 bg-slate-700" />
                            <Skeleton className="h-4 w-32 bg-slate-700" />
                          </div>
                          <Skeleton className="h-6 w-20 bg-slate-700" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <SweepstakeList 
                  sweepstakes={[...createdSweepstakes, ...joinedSweepstakes]}
                  onRefresh={fetchDashboardData}
                />
              )}
            </TabsContent>

            <TabsContent value="created" className="mt-6">
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Card key={i} className="bg-slate-900/50 border-slate-800">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-6 w-48 bg-slate-700" />
                            <Skeleton className="h-4 w-32 bg-slate-700" />
                          </div>
                          <Skeleton className="h-6 w-20 bg-slate-700" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <SweepstakeList 
                  sweepstakes={createdSweepstakes}
                  showCreatorActions={true}
                  onRefresh={fetchDashboardData}
                />
              )}
            </TabsContent>

            <TabsContent value="joined" className="mt-6">
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Card key={i} className="bg-slate-900/50 border-slate-800">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-6 w-48 bg-slate-700" />
                            <Skeleton className="h-4 w-32 bg-slate-700" />
                          </div>
                          <Skeleton className="h-6 w-20 bg-slate-700" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <SweepstakeList 
                  sweepstakes={joinedSweepstakes}
                  showCreatorActions={false}
                  onRefresh={fetchDashboardData}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface DashboardSweepstake {
  id: string;
  name: string;
  description?: string;
  max_participants: number;
  status: 'created' | 'active' | 'completed';
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  participant_count: number;
  user_role: 'creator' | 'participant';
  user_team?: {
    id: string;
    name: string;
    flag_url?: string;
  };
  can_start: boolean;
  can_edit: boolean;
  can_leave: boolean;
}

export interface DashboardStats {
  total_sweepstakes: number;
  created_sweepstakes: number;
  joined_sweepstakes: number;
  active_sweepstakes: number;
  completed_sweepstakes: number;
}

export interface DashboardData {
  sweepstakes: DashboardSweepstake[];
  stats: DashboardStats;
  created_sweepstakes: DashboardSweepstake[];
  joined_sweepstakes: DashboardSweepstake[];
}

export interface UseDashboardResult {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  refreshSweepstake: (sweepstakeId: string) => Promise<void>;
}

export const useDashboard = (): UseDashboardResult => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!user) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch sweepstakes created by user
      const { data: createdSweepstakes, error: createdError } = await supabase
        .from('sweepstakes')
        .select(`
          *,
          participants!inner(count)
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (createdError) throw createdError;

      // Fetch sweepstakes user has joined
      const { data: joinedSweepstakes, error: joinedError } = await supabase
        .from('participants')
        .select(`
          sweepstake_id,
          team_id,
          sweepstakes!inner(
            id,
            name,
            description,
            max_participants,
            status,
            start_date,
            end_date,
            created_at,
            updated_at,
            created_by
          ),
          teams(
            id,
            name,
            flag_url
          )
        `)
        .eq('user_id', user.id)
        .neq('sweepstakes.created_by', user.id);

      if (joinedError) throw joinedError;

      // Get participant counts for joined sweepstakes
      const joinedSweepstakeIds = joinedSweepstakes?.map(p => p.sweepstake_id) || [];
      const { data: participantCounts, error: countsError } = joinedSweepstakeIds.length > 0
        ? await supabase
            .from('participants')
            .select('sweepstake_id')
            .in('sweepstake_id', joinedSweepstakeIds)
        : { data: [], error: null };

      if (countsError) throw countsError;

      // Count participants for each joined sweepstake
      const participantCountsMap = new Map<string, number>();
      participantCounts?.forEach(p => {
        participantCountsMap.set(p.sweepstake_id, (participantCountsMap.get(p.sweepstake_id) || 0) + 1);
      });

      // Transform created sweepstakes data
      const transformedCreated: DashboardSweepstake[] = (createdSweepstakes || []).map(sweepstake => {
        const participantCount = Array.isArray(sweepstake.participants) 
          ? sweepstake.participants.length 
          : sweepstake.participants?.count || 0;

        return {
          id: sweepstake.id,
          name: sweepstake.name,
          description: sweepstake.description,
          max_participants: sweepstake.max_participants,
          status: sweepstake.status,
          start_date: sweepstake.start_date,
          end_date: sweepstake.end_date,
          created_at: sweepstake.created_at,
          updated_at: sweepstake.updated_at,
          created_by: sweepstake.created_by,
          participant_count: participantCount,
          user_role: 'creator' as const,
          can_start: sweepstake.status === 'created' && participantCount >= 2,
          can_edit: sweepstake.status === 'created',
          can_leave: false,
        };
      });

      // Transform joined sweepstakes data
      const transformedJoined: DashboardSweepstake[] = (joinedSweepstakes || []).map(participant => {
        const sweepstake = participant.sweepstakes;
        const participantCount = participantCountsMap.get(participant.sweepstake_id) || 0;

        return {
          id: sweepstake.id,
          name: sweepstake.name,
          description: sweepstake.description,
          max_participants: sweepstake.max_participants,
          status: sweepstake.status,
          start_date: sweepstake.start_date,
          end_date: sweepstake.end_date,
          created_at: sweepstake.created_at,
          updated_at: sweepstake.updated_at,
          created_by: sweepstake.created_by,
          participant_count: participantCount,
          user_role: 'participant' as const,
          user_team: participant.teams ? {
            id: participant.teams.id,
            name: participant.teams.name,
            flag_url: participant.teams.flag_url,
          } : undefined,
          can_start: false,
          can_edit: false,
          can_leave: sweepstake.status === 'created',
        };
      });

      // Combine all sweepstakes
      const allSweepstakes = [...transformedCreated, ...transformedJoined];

      // Calculate stats
      const stats: DashboardStats = {
        total_sweepstakes: allSweepstakes.length,
        created_sweepstakes: transformedCreated.length,
        joined_sweepstakes: transformedJoined.length,
        active_sweepstakes: allSweepstakes.filter(s => s.status === 'active').length,
        completed_sweepstakes: allSweepstakes.filter(s => s.status === 'completed').length,
      };

      setData({
        sweepstakes: allSweepstakes,
        stats,
        created_sweepstakes: transformedCreated,
        joined_sweepstakes: transformedJoined,
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshSweepstake = useCallback(async (sweepstakeId: string) => {
    if (!user || !data) return;

    try {
      // Refresh the specific sweepstake data
      const { data: sweepstakeData, error: sweepstakeError } = await supabase
        .from('sweepstakes')
        .select('*')
        .eq('id', sweepstakeId)
        .single();

      if (sweepstakeError) throw sweepstakeError;

      // Get updated participant count
      const { data: participantData, error: participantError } = await supabase
        .from('participants')
        .select('user_id')
        .eq('sweepstake_id', sweepstakeId);

      if (participantError) throw participantError;

      const participantCount = participantData?.length || 0;

      // Update the specific sweepstake in the data
      setData(prevData => {
        if (!prevData) return prevData;

        const updateSweepstake = (sweepstake: DashboardSweepstake): DashboardSweepstake => {
          if (sweepstake.id !== sweepstakeId) return sweepstake;

          return {
            ...sweepstake,
            status: sweepstakeData.status,
            participant_count: participantCount,
            updated_at: sweepstakeData.updated_at,
            can_start: sweepstakeData.status === 'created' && participantCount >= 2 && sweepstake.user_role === 'creator',
            can_edit: sweepstakeData.status === 'created' && sweepstake.user_role === 'creator',
            can_leave: sweepstakeData.status === 'created' && sweepstake.user_role === 'participant',
          };
        };

        const updatedSweepstakes = prevData.sweepstakes.map(updateSweepstake);
        const updatedCreated = prevData.created_sweepstakes.map(updateSweepstake);
        const updatedJoined = prevData.joined_sweepstakes.map(updateSweepstake);

        // Recalculate stats
        const stats: DashboardStats = {
          total_sweepstakes: updatedSweepstakes.length,
          created_sweepstakes: updatedCreated.length,
          joined_sweepstakes: updatedJoined.length,
          active_sweepstakes: updatedSweepstakes.filter(s => s.status === 'active').length,
          completed_sweepstakes: updatedSweepstakes.filter(s => s.status === 'completed').length,
        };

        return {
          sweepstakes: updatedSweepstakes,
          stats,
          created_sweepstakes: updatedCreated,
          joined_sweepstakes: updatedJoined,
        };
      });
    } catch (err) {
      console.error('Error refreshing sweepstake:', err);
    }
  }, [user, data]);

  const refetch = useCallback(async () => {
    await fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Memoized result to prevent unnecessary re-renders
  const result = useMemo((): UseDashboardResult => ({
    data,
    loading,
    error,
    refetch,
    refreshSweepstake,
  }), [data, loading, error, refetch, refreshSweepstake]);

  return result;
};

export default useDashboard;
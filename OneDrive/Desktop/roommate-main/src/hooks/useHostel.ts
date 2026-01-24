import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { generateHostelCode, setStoredHostelId, setStoredMemberId } from '@/lib/hostel-store';

// Types matching our database schema
export interface Hostel {
  id: string;
  name: string;
  room_no: string | null;
  code: string;
  owner_id: string | null;
  monthly_budget: number;
  created_at: string;
}

export interface Member {
  id: string;
  hostel_id: string;
  name: string;
  room_no: string | null;
  created_at: string;
  profile_id?: string;
}

export interface Expense {
  id: string;
  hostel_id: string;
  paid_by_member_id: string;
  amount: number;
  category: 'food' | 'groceries' | 'utilities' | 'entertainment' | 'transport' | 'other';
  description: string | null;
  split_equally: boolean;
  participants: string[] | null;
  created_at: string;
}

export interface Income {
  id: string;
  hostel_id: string;
  amount: number;
  description: string | null;
  created_at: string;
}

export interface UtilityBill {
  id: string;
  hostel_id: string;
  bill_type: string;
  amount: number;
  month: string;
  paid: boolean;
  created_at: string;
}

export interface Settlement {
  id: string;
  hostel_id: string;
  from_member_id: string;
  to_member_id: string;
  amount: number;
  created_at: string;
}

export interface Notification {
  id: string;
  hostel_id: string;
  recipient_id: string;
  sender_id: string;
  actor_name: string;
  type: 'bill' | 'payment' | 'reminder' | 'broadcast';
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface RecurringBill {
  id: string;
  hostel_id: string;
  bill_type: string;
  amount: number;
  target_room: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

// Fetch hostel by ID
export const useHostel = (hostelId: string | null) => {
  return useQuery({
    queryKey: ['hostel', hostelId],
    queryFn: async () => {
      if (!hostelId) return null;
      const { data, error } = await supabase
        .from('hostels')
        .select('*')
        .eq('id', hostelId)
        .maybeSingle();
      if (error) throw error;
      return data as Hostel | null;
    },
    enabled: !!hostelId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

// Fetch hostel by code (for joining)
export const useHostelByCode = (code: string) => {
  return useQuery({
    queryKey: ['hostel-code', code],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hostels')
        .select('*')
        .eq('code', code.toUpperCase())
        .maybeSingle();
      if (error) throw error;
      return data as Hostel | null;
    },
    enabled: code.length === 6,
  });
};

// Fetch members of a hostel
export const useMembers = (hostelId: string | null) => {
  return useQuery({
    queryKey: ['members', hostelId],
    queryFn: async () => {
      if (!hostelId) return [];
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('hostel_id', hostelId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as Member[];
    },
    enabled: !!hostelId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

// Fetch expenses
export const useExpenses = (hostelId: string | null) => {
  return useQuery({
    queryKey: ['expenses', hostelId],
    queryFn: async () => {
      if (!hostelId) return [];
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('hostel_id', hostelId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Expense[];
    },
    enabled: !!hostelId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

// Fetch utility bills
export const useUtilityBills = (hostelId: string | null) => {
  return useQuery({
    queryKey: ['utility_bills', hostelId],
    queryFn: async () => {
      if (!hostelId) return [];
      const { data, error } = await supabase
        .from('utility_bills')
        .select('*')
        .eq('hostel_id', hostelId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as UtilityBill[];
    },
    enabled: !!hostelId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

// Fetch incomes
export const useIncomes = (hostelId: string | null) => {
  return useQuery({
    queryKey: ['incomes', hostelId],
    queryFn: async () => {
      if (!hostelId) return [];
      const { data, error } = await supabase
        .from('incomes')
        .select('*')
        .eq('hostel_id', hostelId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Income[];
    },
    enabled: !!hostelId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

// Fetch settlements
export const useSettlements = (hostelId: string | null) => {
  return useQuery({
    queryKey: ['settlements', hostelId],
    queryFn: async () => {
      if (!hostelId) return [];
      const { data, error } = await supabase
        .from('settlements')
        .select('*')
        .eq('hostel_id', hostelId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Settlement[];
    },
    enabled: !!hostelId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

// Fetch notifications for a recipient
export const useNotifications = (recipientId: string | null) => {
  return useQuery({
    queryKey: ['notifications', recipientId],
    queryFn: async () => {
      if (!recipientId) return [];
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', recipientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!recipientId,
  });
};

// Create hostel mutation
export const useCreateHostel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      room_no,
      creatorName,
      budget,
      includeCreatorAsMember = true
    }: {
      name: string;
      room_no: string;
      creatorName: string;
      budget: number;
      includeCreatorAsMember?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication required");

      const code = generateHostelCode();

      // Create hostel
      const { data: hostel, error: hostelError } = await supabase
        .from('hostels')
        .insert({
          name,
          room_no,
          code,
          monthly_budget: budget,
          owner_id: user.id
        })
        .select()
        .single();

      if (hostelError) throw hostelError;

      let member = null;
      if (includeCreatorAsMember) {
        // Create first member (creator)
        const { data: m, error: memberError } = await supabase
          .from('members')
          .insert({
            hostel_id: hostel.id,
            name: creatorName,
            profile_id: user.id,
            room_no: room_no
          })
          .select()
          .single();

        if (memberError) throw memberError;
        member = m as Member;
      }

      return { hostel: hostel as Hostel, member };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostel'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
};

// Join hostel mutation
export const useJoinHostel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ hostelId, name, room_no }: { hostelId: string; name: string; room_no: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication required");

      // Check if user is already an active member of THIS specific hostel
      const { data: existingMembership } = await supabase
        .from('members')
        .select('id')
        .eq('profile_id', user.id)
        .eq('hostel_id', hostelId)
        .not('profile_id', 'is', null)
        .maybeSingle();

      if (existingMembership) {
        throw new Error("You are already in this room. One email can only join a hostel once.");
      }

      // Check if a member with this name already exists in this hostel but is unlinked
      const { data: existingMembers } = await supabase
        .from('members')
        .select('*')
        .eq('hostel_id', hostelId)
        .eq('name', name);

      const existingMember = existingMembers?.find(m => !m.profile_id);

      if (existingMember) {
        // Reactivate existing member
        const { data: updatedMember, error: updateError } = await supabase
          .from('members')
          .update({
            profile_id: user.id,
            room_no: room_no // Update room in case they changed it
          })
          .eq('id', existingMember.id)
          .select()
          .single();

        if (updateError) throw updateError;

        setStoredHostelId(hostelId);
        setStoredMemberId(updatedMember.id);
        return updatedMember as Member;
      }

      // Create new member if no existing inactive record found
      const { data: member, error } = await supabase
        .from('members')
        .insert({
          hostel_id: hostelId,
          name,
          profile_id: user.id,
          room_no: room_no
        })
        .select()
        .single();

      if (error) throw error;

      setStoredHostelId(hostelId);
      setStoredMemberId(member.id);

      return member as Member;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
};

// Add member mutation
export const useAddMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ hostelId, name, room_no }: { hostelId: string; name: string; room_no?: string }) => {
      // Check if they already exist as an unlinked (inactive) member
      const { data: existing } = await supabase
        .from('members')
        .select('*')
        .eq('hostel_id', hostelId)
        .eq('name', name)
        .is('profile_id', null)
        .maybeSingle();

      if (existing) {
        // Just update the room if provided
        const { data, error } = await supabase
          .from('members')
          .update({ room_no: room_no || existing.room_no })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data as Member;
      }

      const { data, error } = await supabase
        .from('members')
        .insert({ hostel_id: hostelId, name, room_no })
        .select()
        .single();

      if (error) throw error;
      return data as Member;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['members', variables.hostelId] });
    },
  });
};

// Add expense mutation
export const useAddExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expense: Omit<Expense, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('expenses')
        .insert(expense)
        .select()
        .single();

      if (error) throw error;
      return data as Expense;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses', variables.hostel_id] });
    },
  });
};

// Add utility bill mutation
export const useAddUtilityBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bill: Omit<UtilityBill, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('utility_bills')
        .insert(bill)
        .select()
        .single();

      if (error) throw error;
      return data as UtilityBill;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['utility_bills', variables.hostel_id] });
    },
  });
};

// Add income mutation
export const useAddIncome = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (income: Omit<Income, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('incomes')
        .insert(income)
        .select()
        .single();

      if (error) throw error;
      return data as Income;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['incomes', variables.hostel_id] });
      queryClient.invalidateQueries({ queryKey: ['hostel'] });
    },
  });
};

// Add settlement mutation
export const useAddSettlement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settlement: Omit<Settlement, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('settlements')
        .insert(settlement)
        .select()
        .single();

      if (error) throw error;
      return data as Settlement;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['settlements', variables.hostel_id] });
      queryClient.invalidateQueries({ queryKey: ['expenses', variables.hostel_id] });
    },
  });
};

// Update budget mutation
export const useUpdateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ hostelId, budget }: { hostelId: string; budget: number }) => {
      const { data, error } = await supabase
        .from('hostels')
        .update({ monthly_budget: budget })
        .eq('id', hostelId)
        .select()
        .single();

      if (error) throw error;
      return data as Hostel;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['hostel', variables.hostelId] });
    },
  });
};

// Toggle utility bill paid status
export const useToggleBillPaid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ billId, paid, hostelId }: { billId: string; paid: boolean; hostelId: string }) => {
      const { data, error } = await supabase
        .from('utility_bills')
        .update({ paid })
        .eq('id', billId)
        .select()
        .single();

      if (error) throw error;
      return { bill: data as UtilityBill, hostelId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['utility_bills', result.hostelId] });
    },
  });
};

// Delete expense mutation
export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ expenseId, hostelId }: { expenseId: string; hostelId: string }) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;
      return hostelId;
    },
    onSuccess: (hostelId) => {
      queryClient.invalidateQueries({ queryKey: ['expenses', hostelId] });
    },
  });
};

// Delete income mutation
export const useDeleteIncome = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ incomeId, hostelId }: { incomeId: string; hostelId: string }) => {
      const { error } = await supabase
        .from('incomes')
        .delete()
        .eq('id', incomeId);

      if (error) throw error;
      return hostelId;
    },
    onSuccess: (hostelId) => {
      queryClient.invalidateQueries({ queryKey: ['incomes', hostelId] });
      queryClient.invalidateQueries({ queryKey: ['hostel'] });
    },
  });
};

// Remove member mutation
export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, hostelId }: { memberId: string; hostelId: string }) => {
      // Soft delete: just unlink the profile_id so historical dues remain linked to this name
      const { error } = await supabase
        .from('members')
        .update({ profile_id: null })
        .eq('id', memberId);

      if (error) throw error;
      return hostelId;
    },
    onSuccess: (hostelId) => {
      queryClient.invalidateQueries({ queryKey: ['members', hostelId] });
    },
  });
};

// Remove room mutation (unlinks all members in a specific room)
export const useRemoveRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ room_no, hostelId }: { room_no: string; hostelId: string }) => {
      // Soft delete: just unlink the profile_id of everyone in that room
      const { error } = await supabase
        .from('members')
        .update({ profile_id: null })
        .eq('hostel_id', hostelId)
        .eq('room_no', room_no);

      if (error) throw error;
      return hostelId;
    },
    onSuccess: (hostelId) => {
      queryClient.invalidateQueries({ queryKey: ['members', hostelId] });
    },
  });
};

// Update hostel mutation
export const useUpdateHostel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ hostelId, name, room_no }: { hostelId: string; name?: string; room_no?: string }) => {
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (room_no !== undefined) updateData.room_no = room_no;

      const { data, error } = await supabase
        .from('hostels')
        .update(updateData)
        .eq('id', hostelId)
        .select()
        .single();

      if (error) throw error;
      return data as Hostel;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['hostel', variables.hostelId] });
      queryClient.invalidateQueries({ queryKey: ['hostel'] });
    },
  });
};

// Update member mutation
export const useUpdateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, hostelId, name, room_no, profile_id }: { memberId: string; hostelId: string; name?: string; room_no?: string; profile_id?: string }) => {
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (room_no !== undefined) updateData.room_no = room_no;
      if (profile_id !== undefined) updateData.profile_id = profile_id;

      const { data, error } = await supabase
        .from('members')
        .update(updateData)
        .eq('id', memberId)
        .select()
        .single();

      if (error) throw error;
      return { member: data as Member, hostelId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['members', result.hostelId] });
    },
  });
};

// Delete hostel mutation
export const useDeleteHostel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hostelId: string) => {
      const { error } = await supabase
        .from('hostels')
        .delete()
        .eq('id', hostelId);

      if (error) throw error;
      return hostelId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostel'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
};
// Reset balances/clear financial data mutation
export const useResetBalances = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hostelId: string) => {
      // Delete everything financial but keep members and hostel info
      await supabase.from('settlements').delete().eq('hostel_id', hostelId);
      await supabase.from('expenses').delete().eq('hostel_id', hostelId);
      await supabase.from('incomes').delete().eq('hostel_id', hostelId);
      await supabase.from('utility_bills').delete().eq('hostel_id', hostelId);
      await supabase.from('notifications').delete().eq('hostel_id', hostelId);
      return hostelId;
    },
    onSuccess: (hostelId) => {
      queryClient.invalidateQueries({ queryKey: ['expenses', hostelId] });
      queryClient.invalidateQueries({ queryKey: ['settlements', hostelId] });
      queryClient.invalidateQueries({ queryKey: ['incomes', hostelId] });
      queryClient.invalidateQueries({ queryKey: ['utility_bills', hostelId] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['hostel', hostelId] });
    },
  });
};

// Add notification
export const useAddNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>) => {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single();

      if (error) throw error;
      return data as Notification;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notifications', variables.recipient_id] });
    },
  });
};

// Mark notification as read
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) throw error;
      return data as Notification;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notifications', data.recipient_id] });
    },
  });
};

// Fetch recurring bills for a hostel
export const useRecurringBills = (hostelId: string) => {
  return useQuery({
    queryKey: ['recurring_bills', hostelId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recurring_bills')
        .select('*')
        .eq('hostel_id', hostelId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RecurringBill[];
    },
    enabled: !!hostelId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

// Add recurring bill mutation
export const useAddRecurringBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bill: Omit<RecurringBill, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('recurring_bills')
        .insert(bill)
        .select()
        .single();

      if (error) throw error;
      return data as RecurringBill;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recurring_bills', variables.hostel_id] });
    },
  });
};

// Delete recurring bill mutation
export const useDeleteRecurringBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ billId, hostelId }: { billId: string; hostelId: string }) => {
      const { error } = await supabase
        .from('recurring_bills')
        .delete()
        .eq('id', billId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recurring_bills', variables.hostelId] });
    },
  });
};

// Toggle recurring bill active status
export const useToggleRecurringBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ billId, hostelId, isActive }: { billId: string; hostelId: string; isActive: boolean }) => {
      const { data, error } = await supabase
        .from('recurring_bills')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', billId)
        .select()
        .single();

      if (error) throw error;
      return data as RecurringBill;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recurring_bills', variables.hostelId] });
    },
  });
};

// Generate monthly bills from recurring templates
export const useGenerateMonthlyBills = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hostelId: string) => {
      const { data, error } = await supabase.rpc('generate_monthly_bills');

      if (error) throw error;
      return data;
    },
    onSuccess: (_, hostelId) => {
      queryClient.invalidateQueries({ queryKey: ['utility_bills', hostelId] });
    },
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { generateHostelCode, setStoredHostelId, setStoredMemberId } from '@/lib/hostel-store';

// Types matching our database schema
export interface Hostel {
  id: string;
  name: string;
  code: string;
  monthly_budget: number;
  created_at: string;
}

export interface Member {
  id: string;
  hostel_id: string;
  name: string;
  created_at: string;
}

export interface Expense {
  id: string;
  hostel_id: string;
  paid_by_member_id: string;
  amount: number;
  category: 'food' | 'groceries' | 'utilities' | 'entertainment' | 'transport' | 'other';
  description: string | null;
  split_equally: boolean;
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
  });
};

// Create hostel mutation
export const useCreateHostel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ name, creatorName, budget }: { name: string; creatorName: string; budget: number }) => {
      const code = generateHostelCode();
      
      // Create hostel
      const { data: hostel, error: hostelError } = await supabase
        .from('hostels')
        .insert({ name, code, monthly_budget: budget })
        .select()
        .single();
      
      if (hostelError) throw hostelError;
      
      // Create first member (creator)
      const { data: member, error: memberError } = await supabase
        .from('members')
        .insert({ hostel_id: hostel.id, name: creatorName })
        .select()
        .single();
      
      if (memberError) throw memberError;
      
      // Store in local storage
      setStoredHostelId(hostel.id);
      setStoredMemberId(member.id);
      
      return { hostel: hostel as Hostel, member: member as Member };
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
    mutationFn: async ({ hostelId, name }: { hostelId: string; name: string }) => {
      const { data: member, error } = await supabase
        .from('members')
        .insert({ hostel_id: hostelId, name })
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
    mutationFn: async ({ hostelId, name }: { hostelId: string; name: string }) => {
      const { data, error } = await supabase
        .from('members')
        .insert({ hostel_id: hostelId, name })
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

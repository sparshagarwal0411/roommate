-- Create hostels table
CREATE TABLE public.hostels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  monthly_budget DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create members table
CREATE TABLE public.members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expense categories enum
CREATE TYPE public.expense_category AS ENUM ('food', 'groceries', 'utilities', 'entertainment', 'transport', 'other');

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  paid_by_member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  category expense_category NOT NULL DEFAULT 'other',
  description TEXT,
  split_equally BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create utility bills table
CREATE TABLE public.utility_bills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  bill_type TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  month TEXT NOT NULL,
  paid BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (public access since no auth)
ALTER TABLE public.hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utility_bills ENABLE ROW LEVEL SECURITY;

-- Create public access policies (no authentication required)
CREATE POLICY "Public read access for hostels" ON public.hostels FOR SELECT USING (true);
CREATE POLICY "Public insert access for hostels" ON public.hostels FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for hostels" ON public.hostels FOR UPDATE USING (true);
CREATE POLICY "Public delete access for hostels" ON public.hostels FOR DELETE USING (true);

CREATE POLICY "Public read access for members" ON public.members FOR SELECT USING (true);
CREATE POLICY "Public insert access for members" ON public.members FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for members" ON public.members FOR UPDATE USING (true);
CREATE POLICY "Public delete access for members" ON public.members FOR DELETE USING (true);

CREATE POLICY "Public read access for expenses" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Public insert access for expenses" ON public.expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for expenses" ON public.expenses FOR UPDATE USING (true);
CREATE POLICY "Public delete access for expenses" ON public.expenses FOR DELETE USING (true);

CREATE POLICY "Public read access for utility_bills" ON public.utility_bills FOR SELECT USING (true);
CREATE POLICY "Public insert access for utility_bills" ON public.utility_bills FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for utility_bills" ON public.utility_bills FOR UPDATE USING (true);
CREATE POLICY "Public delete access for utility_bills" ON public.utility_bills FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX idx_members_hostel ON public.members(hostel_id);
CREATE INDEX idx_expenses_hostel ON public.expenses(hostel_id);
CREATE INDEX idx_utility_bills_hostel ON public.utility_bills(hostel_id);
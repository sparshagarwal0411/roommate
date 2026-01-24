// Local storage helpers for hostel session management
const HOSTEL_KEY = 'roommate_hostel_id';
const MEMBER_KEY = 'roommate_member_id';

export const getStoredHostelId = (): string | null => {
  return localStorage.getItem(HOSTEL_KEY);
};

export const setStoredHostelId = (hostelId: string): void => {
  localStorage.setItem(HOSTEL_KEY, hostelId);
};

export const getStoredMemberId = (): string | null => {
  return localStorage.getItem(MEMBER_KEY);
};

export const setStoredMemberId = (memberId: string): void => {
  localStorage.setItem(MEMBER_KEY, memberId);
};

export const clearHostelSession = (): void => {
  localStorage.removeItem(HOSTEL_KEY);
  localStorage.removeItem(MEMBER_KEY);
};

// Generate a random 6-character hostel code
export const generateHostelCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoiding confusing chars like O, 0, I, 1
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

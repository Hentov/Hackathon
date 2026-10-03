// One place for the server address. To use another PC's server, create a file
// Use-my-GPU/.env.local with:  VITE_API_URL=http://192.168.1.20:3000
export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function api<T>(
  path: string,
  options?: { method?: string; body?: unknown },
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: options?.method ?? 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Is it running?');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data as T;
}

// What the renter chose on the details page
export interface BookingDraft {
  date: string; // 2026-10-04
  start: string; // 18:00
  hours: number;
  total: number;
}

// Answer of POST /api/bookings
export interface BookingResult {
  id: number;
  gpu_id: number;
  model: string;
  start_time: string;
  end_time: string;
  hours: number;
  total_price: number;
  energy_kwh: number;
  status: string;
}

// One row of GET /api/bookings
export interface MyBooking {
  id: number;
  gpu_id: number;
  model: string;
  owner_username: string;
  start_time: string;
  end_time: string;
  hours: number;
  total_price: number;
  energy_kwh: number;
  status: string;
  phase: 'upcoming' | 'active' | 'ended';
  stars: number | null;
  comment: string | null;
}

// Answer of GET /api/bookings/:id/connection
export interface Connection {
  phase: 'upcoming' | 'active';
  start_time: string;
  end_time: string;
  ssh_command: string;
  password: string;
  jupyter_url: string;
  jupyter_token: string;
  demo: boolean;
}

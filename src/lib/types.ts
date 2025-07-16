// Payment related types
export interface DebitWalletPayload {
  customer: string;
  msisdn: string;
  amount: string;
  network: string;
  narration: string;
}

export interface DebitWalletResponse {
  errorCode: string;
  error: string | null;
  data: {
    transactionId: string;
    [key: string]: any;
  };
}

export interface CheckStatusPayload {
  refNo: string;
}

export interface CheckStatusResponse {
  status: string;
  [key: string]: any;
}

// Campaign related types
export interface Campaign {
  id: number;
  user_id: number;
  category_id: number;
  title: string;
  slug: string;
  description: string;
  goal_amount: string;
  current_amount: string;
  start_date: string;
  end_date: string;
  status: string;
  visibility: string;
  thumbnail: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

// Boost related types
export interface BoostPlan {
  id: number;
  name: string;
  price: string;
  duration_days: number;
}

export interface PaymentMethod {
  id: number;
  name: string;
  number: string;
  type: string;
  is_active: number;
  created_at: string | null;
  updated_at: string | null;
}

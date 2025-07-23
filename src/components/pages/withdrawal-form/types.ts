export interface BalanceResponse {
  success: boolean;
  data: {
    balance: string;
    currency: string;
    last_updated: string;
  }
}

export interface CreditWalletRequest {
  customer: string;
  msisdn: string;
  amount: string;
  network: "MTN" | "VODAFONE" | "AIRTELTIGO";
  narration: string;
}

export interface UpdateWalletRequest {
  transaction_id: string;
  amount: string;
  status: "success" | "failed" | "pending";
}

export interface FormState {
  amount: string;
  phoneNumber: string;
  network: "MTN" | "VODAFONE" | "AIRTELTIGO";
  name: string;
  description: string;
}

export type NetworkType = "MTN" | "VODAFONE" | "AIRTELTIGO";

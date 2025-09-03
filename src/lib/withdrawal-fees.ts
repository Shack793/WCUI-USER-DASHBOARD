/**
 * Dynamic withdrawal fee calculation utility
 * 
 * Fee structure:
 * - Less than 2000: 2.5% + 5% service = 7.5%
 * - Between 2000-5000: 2% + 5% service = 7%
 * - Above 5000: 1.8% + 5% service = 6.8%
 */

export interface FeeCalculation {
  feePercentage: number;
  fee: number;
  netAmount: number;
  breakdown: {
    baseFee: number;
    serviceFee: number;
  };
}

export const calculateWithdrawalFee = (amount: number): FeeCalculation => {
  let baseFeePercentage: number;
  
  if (amount < 2000) {
    baseFeePercentage = 2.5; // 2.5% + 5% = 7.5%
  } else if (amount >= 2000 && amount <= 5000) {
    baseFeePercentage = 2.0; // 2% + 5% = 7%
  } else {
    baseFeePercentage = 1.8; // 1.8% + 5% = 6.8%
  }
  
  const serviceFee = 5; // Fixed 5% service fee
  const totalFeePercentage = baseFeePercentage + serviceFee;
  const fee = (amount * totalFeePercentage) / 100;
  const netAmount = amount - fee;
  
  return {
    feePercentage: totalFeePercentage,
    fee,
    netAmount,
    breakdown: {
      baseFee: baseFeePercentage,
      serviceFee: serviceFee
    }
  };
};

export const getFeeDescription = (amount: number): string => {
  if (amount < 2000) {
    return "Less than GHS 2,000: 7.5% total fee (2.5% + 5% service)";
  } else if (amount >= 2000 && amount <= 5000) {
    return "GHS 2,000 - 5,000: 7% total fee (2% + 5% service)";
  } else {
    return "Above GHS 5,000: 6.8% total fee (1.8% + 5% service)";
  }
};

export const getAllFeeRanges = () => [
  { range: "< 2,000", rate: "7.5%", description: "2.5% + 5% service fee" },
  { range: "2,000 - 5,000", rate: "7%", description: "2% + 5% service fee" },
  { range: "> 5,000", rate: "6.8%", description: "1.8% + 5% service fee" }
];

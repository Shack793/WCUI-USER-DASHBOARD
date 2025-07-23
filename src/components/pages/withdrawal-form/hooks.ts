import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import { BalanceResponse } from './types';

export const useWalletBalance = () => {
  const [balance, setBalance] = useState<string>('0');
  const [currency, setCurrency] = useState<string>('GHS');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const response = await api.get<BalanceResponse>('/api/v1/wallet/balance');
      if (response.data.success) {
        setBalance(response.data.data.balance);
        setCurrency(response.data.data.currency);
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return {
    balance,
    currency,
    loading,
    error,
    refetchBalance: fetchBalance
  };
};

export const useNetworkDetection = (phoneNumber: string) => {
  const detectNetwork = (number: string): "MTN" | "VODAFONE" | "AIRTELTIGO" | null => {
    const prefix = number.slice(0, 3);
    
    if (['024', '054', '055', '059'].includes(prefix)) {
      return 'MTN';
    }
    if (['020', '050'].includes(prefix)) {
      return 'VODAFONE';
    }
    if (['027', '057', '026'].includes(prefix)) {
      return 'AIRTELTIGO';
    }
    return null;
  };

  return useMemo(() => detectNetwork(phoneNumber), [phoneNumber]);
};

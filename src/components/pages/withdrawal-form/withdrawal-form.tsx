import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import api, { dashboardAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input-new';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useWalletBalance, useNetworkDetection } from './hooks';
import { useDialog } from '@/components/ui/dialog-context';
import { DialogClose } from '@/components/ui/dialog';

const formSchema = z.object({
  customer: z
    .string()
    .min(2, 'Customer name must be at least 2 characters'),
  msisdn: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(10, 'Phone number must not exceed 10 digits')
    .regex(/^0[2-5][0-9]{8}$/, 'Invalid phone number format'),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine(
      (val: string) => !isNaN(Number(val)) && Number(val) > 0,
      'Amount must be a positive number'
    ),
  narration: z
    .string()
    .default('Credit MTN Customer')
    .optional(),
});

type FormData = z.infer<typeof formSchema>;

export function WithdrawalForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setIsOpen } = useDialog();
  const { balance, currency, loading: balanceLoading, refetchBalance } = useWalletBalance();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer: '',
      msisdn: '',
      amount: '',
      narration: 'Credit MTN Customer',
    },
  });

  const msisdn = watch('msisdn');
  const network = useNetworkDetection(msisdn);

  const onSubmit = async (data: FormData) => {
    try {
      console.log('💫 Starting withdrawal process...');
      console.log('📱 Network detected:', network);
      
      if (!network) {
        toast({
          variant: 'destructive',
          title: 'Invalid Network',
          description: 'Please enter a valid MTN, Vodafone, or AirtelTigo number',
        });
        return;
      }

      setIsSubmitting(true);

      // Check balance first
      console.log('💰 Checking balance...');
      const balanceResponse = await api.get('/api/v1/wallet/balance');
      console.log('💰 Balance response:', balanceResponse.data);
      
      if (!balanceResponse.data.success || Number(data.amount) > Number(balanceResponse.data.data.balance)) {
        console.log('❌ Insufficient balance:', {
          requestedAmount: Number(data.amount),
          availableBalance: Number(balanceResponse.data.data.balance)
        });
        toast({
          variant: 'destructive',
          title: 'Insufficient Balance',
          description: 'Withdrawal amount exceeds available balance',
        });
        return;
      }
      
      // Process withdrawal request
      console.log('🚀 Processing withdrawal...');
      try {
        const response = await dashboardAPI.requestWithdrawal({
          customer: data.customer,
          msisdn: data.msisdn,
          amount: data.amount.toString(),
          network: network,
          narration: data.narration || 'Credit MTN Customer'
        });

        console.log('✅ Withdrawal successful:', response.data);
        
        toast({
          title: 'Withdrawal Successful',
          description: `Your withdrawal of ${data.amount} has been processed successfully. New balance: ${response.data.data.new_balance}`,
        });
        reset();
        refetchBalance();
        setIsOpen(false);
        
        // Navigate to withdrawals dashboard
        navigate('/withdrawals');
      } catch (error: any) {
        console.error('❌ Withdrawal failed:', error);
        toast({
          variant: 'destructive',
          title: 'Withdrawal Failed',
          description: error.message || error.response?.data?.message || 'Failed to process withdrawal',
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Withdrawal Failed',
        description: error.response?.data?.message || 'Something went wrong',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="balance">Available Balance</Label>
          <div className="text-2xl font-bold">
            {balanceLoading ? (
              'Loading...'
            ) : (
              `${currency} ${parseFloat(balance).toFixed(2)}`
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="customer">Customer Name</Label>
          <Input
            id="customer"
            type="text"
            placeholder="Enter your full name"
            {...register('customer')}
          />
          {errors.customer && (
            <p className="text-sm text-red-500">{errors.customer.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="msisdn">Phone Number</Label>
          <Input
            id="msisdn"
            type="tel"
            placeholder="Enter mobile money number"
            {...register('msisdn')}
          />
          {errors.msisdn && (
            <p className="text-sm text-red-500">{errors.msisdn.message}</p>
          )}
          {network && (
            <p className="text-sm text-green-600">Network detected: {network}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount ({currency})</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount to withdraw"
            {...register('amount')}
          />
          {errors.amount && (
            <p className="text-sm text-red-500">{errors.amount.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || balanceLoading}
        >
          {isSubmitting ? 'Processing...' : 'Withdraw Funds'}
        </Button>
      </form>
    </div>
  );
}

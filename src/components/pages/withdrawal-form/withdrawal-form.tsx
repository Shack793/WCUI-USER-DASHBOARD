import { useState, useEffect } from 'react';
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

export function WithdrawalForm({ onClose }: { onClose?: () => void }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { balance, currency, loading: balanceLoading, refetchBalance } = useWalletBalance();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);
  const [isNameEnquiry, setIsNameEnquiry] = useState(false);
  const [successDetails, setSuccessDetails] = useState<{
    amount: string;
    newBalance: string;
    transactionId?: string;
  } | null>(null);

  const [withdrawalDetails, setWithdrawalDetails] = useState<{
    amount: number;
    fee: number;
    netAmount: number;
  }>({
    amount: 0,
    fee: 0,
    netAmount: 0
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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
  const amount = watch('amount');
  const network = useNetworkDetection(msisdn);

  // Calculate fee when amount changes
  useEffect(() => {
    const amountNum = Number(amount);
    if (amountNum > 0) {
      const fee = amountNum * 0.025; // 2.5% fee
      const netAmount = amountNum - fee;
      setWithdrawalDetails({
        amount: amountNum,
        fee,
        netAmount
      });
    } else {
      setWithdrawalDetails({
        amount: 0,
        fee: 0,
        netAmount: 0
      });
    }
  }, [amount]);

  // Name enquiry effect
  useEffect(() => {
    const performNameEnquiry = async () => {
      if (msisdn && msisdn.length === 10 && network) {
        console.log('🔍 Performing name enquiry for:', { msisdn, network });
        setIsNameEnquiry(true);
        
        try {
          const payload = {
            msisdn: msisdn,
            network: network
          };
          
          console.log('📦 Name enquiry payload:', payload);
          const response = await dashboardAPI.nameEnquiry(payload);
          console.log('📦 Name enquiry response:', response.data);
          
          if (response.data.success && response.data.data.name) {
            setValue('customer', response.data.data.name);
            console.log('✅ Name populated:', response.data.data.name);
          } else {
            console.log('⚠️ No name found in response');
          }
        } catch (error: any) {
          console.error('❌ Name enquiry failed:', error);
          console.error('Error details:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
          });
        } finally {
          setIsNameEnquiry(false);
        }
      }
    };

    performNameEnquiry();
  }, [msisdn, network, setValue]);

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
      
      // Prepare credit-wallet payload with detailed logging
      const creditWalletPayload = {
        customer: data.customer,
        msisdn: data.msisdn,
        amount: withdrawalDetails.netAmount.toString(), // Use net amount after fee
        network: network,
        narration: data.narration || 'Credit MTN Customer'
      };
      
      console.log('💳 Credit-wallet payload being sent:');
      console.log('💳 Full payload:', JSON.stringify(creditWalletPayload, null, 2));
      console.log('💳 Payload breakdown:', {
        customer: creditWalletPayload.customer,
        customer_length: creditWalletPayload.customer?.length,
        msisdn: creditWalletPayload.msisdn,
        msisdn_length: creditWalletPayload.msisdn?.length,
        amount: creditWalletPayload.amount,
        amount_type: typeof creditWalletPayload.amount,
        network: creditWalletPayload.network,
        narration: creditWalletPayload.narration
      });
      console.log('💳 Withdrawal details context:', {
        originalAmount: data.amount,
        originalAmountType: typeof data.amount,
        calculatedFee: withdrawalDetails.fee,
        calculatedNetAmount: withdrawalDetails.netAmount,
        netAmountString: withdrawalDetails.netAmount.toString()
      });
      
      try {
        // Process the withdrawal using credit-wallet endpoint
        const response = await api.post('/api/v1/payments/credit-wallet', creditWalletPayload);

        console.log('✅ Withdrawal successful:', response.data);
        
        // **NEW: Update wallet balance in database after successful credit-wallet**
        try {
          const updatePayload = {
            transaction_id: response.data.data.transaction_id || `WD-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            amount: data.amount, // Original withdrawal amount
            status: 'completed'
          };
          
          console.log('💾 Calling /api/v1/wallet/update-after-withdrawal endpoint...');
          console.log('💾 Update payload being sent:', JSON.stringify(updatePayload, null, 2));
          console.log('💾 Payload breakdown:', {
            transaction_id: updatePayload.transaction_id,
            amount: updatePayload.amount,
            amount_type: typeof updatePayload.amount,
            status: updatePayload.status
          });
          
          const updateResponse = await api.post('/api/v1/wallet/update-after-withdrawal', updatePayload);
          
          console.log('✅ Database balance update successful!');
          console.log('✅ Update response status:', updateResponse.status);
          console.log('✅ Update response data:', JSON.stringify(updateResponse.data, null, 2));
          
        } catch (updateError: any) {
          console.error('❌ CRITICAL: Failed to update database balance after successful withdrawal');
          console.error('❌ Update error details:', {
            status: updateError.response?.status,
            statusText: updateError.response?.statusText,
            data: updateError.response?.data,
            message: updateError.message,
            config: {
              url: updateError.config?.url,
              method: updateError.config?.method,
              data: updateError.config?.data
            }
          });
          console.error('❌ Full update error object:', updateError);
          
          // Show warning to user about potential balance sync issue
          toast({
            variant: 'destructive',
            title: '⚠️ Balance Sync Warning',
            description: 'Withdrawal was successful but balance may not be updated immediately. Please refresh the page or contact support if balance doesn\'t update.',
            duration: 8000,
          });
        }
        
        // Record the fee after successful withdrawal
        try {
          await dashboardAPI.recordWithdrawalFee({
            amount: withdrawalDetails.netAmount,
            fee: withdrawalDetails.fee,
            msisdn: data.msisdn,
            network: network,
            customer: data.customer,
            transaction_id: response.data.data.transaction_id // Include transaction ID if available
          });
          console.log('✅ Fee recorded successfully');
        } catch (feeError: any) {
          console.error('⚠️ Failed to record fee:', feeError);
          console.error('Fee recording error details:', {
            status: feeError.response?.status,
            data: feeError.response?.data,
            message: feeError.message
          });
          // Don't block the process if fee recording fails
        }
        
        // Set success state with details
        setWithdrawalSuccess(true);
        setSuccessDetails({
          amount: data.amount,
          newBalance: response.data.data.new_balance || balance,
          transactionId: response.data.data.transaction_id
        });
        
        // Show success toast
        toast({
          title: '✅ Withdrawal Successful!',
          description: `GHS ${data.amount} has been successfully withdrawn to ${data.msisdn}. Your new balance is GHS ${response.data.data.new_balance || balance}.`,
          duration: 6000,
        });
        
        // Reset form and update balance
        reset();
        refetchBalance();
        
        // Close dialog after a short delay to show success message
        setTimeout(() => {
          onClose?.();
          // Navigate to withdrawals dashboard to see updated data
          navigate('/withdrawals');
        }, 2000);
        
      } catch (error: any) {
        console.error('❌ Withdrawal failed:', error);
        
        // DETAILED ERROR ANALYSIS FOR CREDIT-WALLET ENDPOINT
        console.error('🔍 COMPLETE ERROR BREAKDOWN:');
        console.error('🔍 Error status:', error.response?.status);
        console.error('🔍 Error status text:', error.response?.statusText);
        console.error('🔍 Complete server response:', JSON.stringify(error.response?.data, null, 2));
        console.error('🔍 Request headers:', error.config?.headers);
        console.error('🔍 Request URL:', error.config?.url);
        console.error('🔍 Request method:', error.config?.method);
        console.error('🔍 Request payload sent:', JSON.stringify(error.config?.data, null, 2));
        console.error('🔍 Axios error message:', error.message);
        console.error('🔍 Axios error code:', error.code);
        
        // Enhanced error handling to show specific server errors
        let errorMessage = 'Failed to process withdrawal';
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
          console.error('📝 Server message:', error.response.data.message);
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
          console.error('📝 Server error:', error.response.data.error);
        } else if (error.response?.data?.errors) {
          // Handle validation errors
          const errors = error.response.data.errors;
          console.error('📝 Validation errors:', errors);
          errorMessage = Object.keys(errors).map(key => `${key}: ${errors[key].join(', ')}`).join('\n');
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        console.log('🔍 Final error message to show user:', errorMessage);
        
        toast({
          variant: 'destructive',
          title: 'Withdrawal Failed',
          description: errorMessage,
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
      {withdrawalSuccess && successDetails ? (
        // Success State
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Withdrawal Successful!</h3>
            <p className="text-gray-600 mt-2">
              Your withdrawal has been processed successfully
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Amount Withdrawn:</span>
              <span className="text-green-700 font-semibold">{currency} {successDetails.amount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">New Balance:</span>
              <span className="text-green-700 font-semibold">{currency} {successDetails.newBalance}</span>
            </div>
            {successDetails.transactionId && (
              <div className="flex justify-between text-sm">
                <span className="font-medium">Transaction ID:</span>
                <span className="text-gray-600 font-mono text-xs">{successDetails.transactionId}</span>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500">
            Redirecting to withdrawals page...
          </p>
        </div>
      ) : (
        // Form State
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
          {isNameEnquiry && (
            <p className="text-sm text-blue-600">Looking up account name...</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="customer">Name</Label>
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

        {withdrawalDetails.amount > 0 && (
          <div className="rounded-lg border p-4 space-y-2 bg-gray-50">
            <h4 className="font-medium text-sm text-gray-700">Transaction Summary</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Withdrawal Amount:</span>
                <span>{currency} {withdrawalDetails.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>
                  Current service fee (Min: 1.8%) - <span className="font-bold">2.5%</span>
                </span>
                <span>{currency} {withdrawalDetails.fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium pt-1 border-t">
                <span>You will receive:</span>
                <span>{currency} {withdrawalDetails.netAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || balanceLoading}
        >
          {isSubmitting ? 'Processing...' : 'Withdraw Funds'}
        </Button>
        </form>
      )}
    </div>
  );
}

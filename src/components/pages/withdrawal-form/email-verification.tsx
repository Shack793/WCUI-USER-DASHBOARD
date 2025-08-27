import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input-new';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { dashboardAPI } from '@/lib/api';

interface EmailVerificationProps {
  userEmail: string;
  onVerificationSuccess: () => void;
  onCancel: () => void;
}

export function EmailVerification({ userEmail, onVerificationSuccess, onCancel }: EmailVerificationProps) {
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(60); // Start with 60 seconds for resend
  const [canResend, setCanResend] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const hasSentCode = useRef(false); // Prevent multiple sends

  // Mask email for display (e.g., sh****@gmail.com)
  const maskEmail = (email: string) => {
    const [username, domain] = email.split('@');
    if (username.length <= 2) {
      return `${username[0]}****@${domain}`;
    }
    return `${username.slice(0, 2)}****@${domain}`;
  };

  // Countdown timer effect
  useEffect(() => {
    let interval: number;
    
    if (codeSent && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [codeSent, countdown]);

  // Send verification code on component mount
  useEffect(() => {
    if (userEmail && !hasSentCode.current) {
      hasSentCode.current = true;
      sendVerificationCode();
    }
  }, []); // Empty dependency array to only run once on mount

  const sendVerificationCode = async () => {
    try {
      setIsSendingCode(true);
      console.log('📧 Sending verification code to:', userEmail);
      
      const response = await dashboardAPI.sendWithdrawalVerificationCode({
        email: userEmail
      });

      console.log('📧 Send code response:', response.data);

      if (response.data.success) {
        setCodeSent(true);
        setCountdown(60); // 60 seconds before allowing resend
        setCanResend(false);
        
        // Use the masked email from API response if available
        const displayEmail = response.data.data?.email || maskEmail(userEmail);
        
        toast({
          title: '📧 Verification Code Sent',
          description: `A 6-digit code has been sent to ${displayEmail}. Code expires in ${response.data.data?.expires_in_minutes || 15} minutes.`,
        });
      } else {
        throw new Error(response.data.message || 'Failed to send verification code');
      }
    } catch (error: any) {
      console.error('❌ Failed to send verification code:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to Send Code',
        description: error.response?.data?.message || 'Unable to send verification code. Please try again.',
      });
    } finally {
      setIsSendingCode(false);
    }
  };

  const verifyCode = async () => {
    if (verificationCode.length !== 6) {
      toast({
        variant: 'destructive',
        title: 'Invalid Code',
        description: 'Please enter a 6-digit verification code',
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔑 Verifying code:', verificationCode);
      
      const response = await dashboardAPI.verifyWithdrawalCode({
        email: userEmail,
        code: verificationCode
      });

      if (response.data.success) {
        toast({
          title: '✅ Email Verified',
          description: 'You can now proceed with your withdrawal',
        });
        onVerificationSuccess();
      } else {
        throw new Error('Invalid verification code');
      }
    } catch (error: any) {
      console.error('❌ Code verification failed:', error);
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: error.response?.data?.message || 'Invalid or expired code. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    setVerificationCode('');
    setCountdown(60); // Reset to 60 seconds
    setCanResend(false);
    hasSentCode.current = false; // Reset the ref
    sendVerificationCode();
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setVerificationCode(value);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
          <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26c.3.16.67.16.97 0L20 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Verification Required</h3>
        <p className="text-sm text-gray-600">
          For security purposes, please verify your email address before proceeding with the withdrawal.
        </p>
      </div>

      {isSendingCode ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Sending verification code...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              📧 Code sent to: <span className="font-semibold">{maskEmail(userEmail)}</span>
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Check your email inbox and spam folder for the verification code.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="verificationCode">6-Digit Verification Code</Label>
            <Input
              id="verificationCode"
              type="text"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={handleCodeChange}
              className="text-center text-lg tracking-widest"
              maxLength={6}
            />
          </div>

          <div className="space-y-2">
            <Button
              onClick={verifyCode}
              className="w-full"
              disabled={isLoading || verificationCode.length !== 6}
            >
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </Button>

            <div className="text-center">
              {!canResend ? (
                <p className="text-sm text-gray-500">
                  Resend code in {countdown}s
                </p>
              ) : (
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    onClick={handleResendCode}
                    className="text-sm text-blue-600 hover:text-blue-800"
                    disabled={isSendingCode}
                  >
                    {isSendingCode ? 'Sending...' : 'Resend Code'}
                  </Button>
                  <p className="text-xs text-gray-500">
                    Didn't receive the code? Check spam folder or try resending.
                  </p>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              onClick={onCancel}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
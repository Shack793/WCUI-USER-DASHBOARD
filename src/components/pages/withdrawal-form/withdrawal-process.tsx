import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { EmailVerification } from './email-verification';
import { WithdrawalForm } from './withdrawal-form';

export function WithdrawalProcess() {
  const { user } = useAuth();
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showForm, setShowForm] = useState(false);

  console.log('👤 User data in WithdrawalProcess:', user);

  const handleEmailVerificationSuccess = () => {
    setIsEmailVerified(true);
    setShowForm(true);
  };

  const handleCancel = () => {
    // This will be handled by the parent component (dialog)
    // You can add any cleanup logic here if needed
  };

  if (!user?.email) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">No email address found. Please update your profile.</p>
        <p className="text-sm text-gray-500 mt-2">User data: {JSON.stringify(user)}</p>
      </div>
    );
  }

  if (!isEmailVerified || !showForm) {
    return (
      <EmailVerification
        userEmail={user.email}
        onVerificationSuccess={handleEmailVerificationSuccess}
        onCancel={handleCancel}
      />
    );
  }

  return <WithdrawalForm />;
}
import { useAuth } from '@/lib/auth';
import { useNeedsOnboarding } from '@/lib/onboarding';
import { UserOnboardingWizard } from '@/components/onboarding/UserOnboardingWizard';
import { useState } from 'react';

export default function LandingPage() {
  const { user } = useAuth();
  const { needsOnboarding, loading } = useNeedsOnboarding(user?.id);
  const [onboardingOpen, setOnboardingOpen] = useState(true);

  return (
    <>
      {/* Show onboarding wizard if needed */}
      {user && needsOnboarding && !loading && (
        <UserOnboardingWizard
          open={onboardingOpen}
          onComplete={() => setOnboardingOpen(false)}
          userId={user.id}
          email={user.email}
        />
      )}
      {/* ...rest of your landing page content... */}
      <div className="container mx-auto mt-8">
        <h1 className="text-3xl font-bold">Welcome to Stockfolio!</h1>
        {/* ... */}
      </div>
    </>
  );
}

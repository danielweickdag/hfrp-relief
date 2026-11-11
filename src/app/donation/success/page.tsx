import { Suspense } from 'react';
import Success from './Success';

const DonationSuccessPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Success />
    </Suspense>
  );
};

export default DonationSuccessPage;

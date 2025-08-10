import React from 'react';
import { useLocation } from 'react-router-dom';
import SetPasswordForm from '../components/SetPasswordForm';

const SetPasswordPage = () => {
  const query = new URLSearchParams(useLocation().search);
  const email = query.get('email'); // récupère l'email depuis l'URL

  if (!email) {
    return <p>Email manquant dans l'URL.</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <SetPasswordForm userEmail={email} />
    </div>
  );
};

export default SetPasswordPage;

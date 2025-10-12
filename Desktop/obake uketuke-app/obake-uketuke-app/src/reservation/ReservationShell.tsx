import React from 'react';

interface ReservationShellProps {
  children: React.ReactNode;
}

export const ReservationShell: React.FC<ReservationShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-pink-50 to-rose-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

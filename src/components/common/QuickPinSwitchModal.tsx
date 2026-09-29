import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, X, Check, Delete } from 'lucide-react';

export const QuickPinSwitchModal: React.FC = () => {
  const { isSwitchUserModalOpen, setIsSwitchUserModalOpen, switchUser, users, currentUser } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isSwitchUserModalOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);
      
      // Auto verify on 4 digits if matches
      if (nextPin.length === 4) {
        const success = switchUser(nextPin);
        if (success) {
          setPin('');
          setIsSwitchUserModalOpen(false);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const handleManualSubmit = () => {
    const success = switchUser(pin);
    if (success) {
      setPin('');
      setIsSwitchUserModalOpen(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative border border-neutral-200">
        <button 
          onClick={() => { setIsSwitchUserModalOpen(false); setPin(''); setError(false); }}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-2xs">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Ganti Akun Kasir</h2>
          <p className="text-xs text-slate-500 mt-1">Masukkan 4 digit PIN staff/kasir Anda</p>
        </div>

        {/* PIN Dots Indicator */}
        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map((index) => (
            <div 
              key={index}
              className={`w-4 h-4 rounded-full transition-all duration-150 ${
                pin.length > index 
                  ? 'bg-emerald-600 scale-110 shadow-2xs' 
                  : 'border-2 border-slate-300 bg-slate-100'
              } ${error ? 'bg-red-500 border-red-500' : ''}`}
            />
          ))}
        </div>

        {error && (
          <p className="text-center text-xs font-medium text-red-600 mb-4">
            PIN salah. Coba lagi atau hubungi Manager/Owner.
          </p>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              className="h-13 rounded-xl bg-neutral-50 hover:bg-neutral-100 active:bg-neutral-200 text-lg font-semibold text-neutral-800 transition-colors border border-neutral-200"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleDelete}
            className="h-13 rounded-xl bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 flex items-center justify-center text-neutral-700 transition-colors border border-neutral-200"
          >
            <Delete className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="h-13 rounded-xl bg-neutral-50 hover:bg-neutral-100 active:bg-neutral-200 text-lg font-semibold text-neutral-800 transition-colors border border-neutral-200"
          >
            0
          </button>
          <button
            onClick={handleManualSubmit}
            className="h-13 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white flex items-center justify-center font-bold transition-colors shadow-2xs"
          >
            <Check className="w-5 h-5" />
          </button>
        </div>

        {/* Quick User List Hint for Demo */}
        <div className="pt-3 border-t border-slate-100">
          <p className="text-[11px] font-medium text-slate-400 mb-2 text-center">PIN Pengguna Terdaftar:</p>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            {users.map(u => (
              <button
                key={u.id}
                onClick={() => {
                  switchUser(u.pin);
                  setIsSwitchUserModalOpen(false);
                  setPin('');
                }}
                className={`p-1.5 text-left rounded-xl border transition-colors flex items-center justify-between ${
                  u.id === currentUser.id 
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold' 
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span className="truncate">{u.name}</span>
                <span className="font-mono text-[10px] opacity-75 tabular-nums">PIN: {u.pin}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = 'success', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const bgColor = type === 'success' ? 'bg-teal-50 border-teal-200' 
                : type === 'error' ? 'bg-red-50 border-red-200' 
                : 'bg-blue-50 border-blue-200';
  
  const textColor = type === 'success' ? 'text-teal-800' 
                  : type === 'error' ? 'text-red-800' 
                  : 'text-blue-800';

  const Icon = type === 'success' ? CheckCircle2 
             : type === 'error' ? XCircle 
             : CheckCircle2;

  return (
    <div className={`fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 ${bgColor} ${textColor}`}>
      <Icon size={20} className={type === 'success' ? 'text-teal-500' : type === 'error' ? 'text-red-500' : 'text-blue-500'} />
      <p className="font-medium text-sm pr-4">{message}</p>
      <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-full transition-colors">
        <X size={16} />
      </button>
    </div>
  );
}

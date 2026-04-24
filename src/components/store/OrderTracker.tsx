'use client'

import { Check, Package, Truck, Home, Clock } from 'lucide-react'

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface Step {
  id: number;
  name: string;
  status: OrderStatus[];
  icon: any;
}

const steps: Step[] = [
  { id: 1, name: 'Placed', status: ['pending', 'confirmed'], icon: Clock },
  { id: 2, name: 'Processing', status: ['processing'], icon: Package },
  { id: 3, name: 'Shipped', status: ['shipped'], icon: Truck },
  { id: 4, name: 'Delivered', status: ['delivered'], icon: Home },
];

export default function OrderTracker({ currentStatus }: { currentStatus: OrderStatus }) {
  if (currentStatus === 'cancelled') {
    return (
      <div className="bg-red-50 border border-red-100 p-6 rounded-2xl text-center mb-8">
        <h3 className="text-red-700 font-bold mb-1">Order Cancelled</h3>
        <p className="text-red-600/70 text-sm">This order was cancelled and is no longer being tracked.</p>
      </div>
    );
  }

  // Find the index of the current status in our step flow
  const currentStepIndex = steps.findIndex(s => s.status.includes(currentStatus));
  // Statuses like 'confirmed' might be map to the first step, so we ensure visibility
  const activeStep = currentStepIndex !== -1 ? currentStepIndex + 1 : 1;

  return (
    <div className="w-full py-8 px-4 sm:px-0">
      <div className="relative flex justify-between">
        {/* Background Line */}
        <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100 -z-10" />
        
        {/* Active Line Progress */}
        <div 
          className="absolute top-5 left-0 h-0.5 bg-[var(--primary)] transition-all duration-500 ease-out -z-10" 
          style={{ width: `${((activeStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step) => {
          const isCompleted = activeStep > step.id;
          const isActive = activeStep === step.id;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center group relative w-1/4">
              {/* Dot / Icon */}
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 z-10 ${
                  isCompleted 
                    ? 'bg-[var(--primary)] border-[var(--primary)] text-white' 
                    : isActive 
                      ? 'bg-white border-[var(--primary)] text-[var(--primary)] shadow-[0_0_15px_rgba(231,70,148,0.3)]' 
                      : 'bg-white border-gray-200 text-gray-400'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>

              {/* Label */}
              <div className="mt-3 text-center">
                <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors ${
                  isCompleted || isActive ? 'text-[var(--charcoal)]' : 'text-gray-400'
                }`}>
                  {step.name}
                </p>
                {isActive && (
                  <span className="text-[10px] text-[var(--primary)] font-medium animate-pulse">Current Stage</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

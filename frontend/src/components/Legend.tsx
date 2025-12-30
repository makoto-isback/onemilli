import React from 'react';

const Legend: React.FC = () => {
  return (
    <div className="absolute bottom-4 left-4 right-4 bg-[#F5E7C6] bold-outline rounded-2xl p-3">
      <div className="flex justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-white border border-[#222222]/30 rounded-sm"></div>
          <span className="font-bold">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#FF6D1F] border border-[#222222]/30 rounded-sm"></div>
          <span className="font-bold">Active Bets</span>
        </div>
      </div>
    </div>
  );
};

export default Legend;

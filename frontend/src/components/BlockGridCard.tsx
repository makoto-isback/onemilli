import React, { useMemo } from 'react';

interface BlockGridCardProps {
  totalPool: number;
  totalBlocks?: number;
}

const BlockGridCard: React.FC<BlockGridCardProps> = ({
  totalPool,
  totalBlocks = 1000
}) => {
  // Each ticket costs 1000 KYAT, so calculate sold tickets from total pool
  const soldTickets = Math.floor(totalPool / 1000);

  // Create a grid showing ticket sales (filled blocks = sold tickets)
  const gridCells = useMemo(() => {
    const filledBlocks = Math.min(soldTickets, totalBlocks);
    return Array.from({ length: totalBlocks }, (_, i) => ({
      id: i,
      isSold: i < filledBlocks,
    }));
  }, [soldTickets, totalBlocks]);

  return (
    <div className="w-full bg-[#FAF3E1] bold-outline rounded-3xl p-3 mb-4 aspect-square flex items-center justify-center">
      <div
        className="grid gap-[1px] w-full h-full"
        style={{
          gridTemplateColumns: 'repeat(32, minmax(0, 1fr))',
          gridAutoRows: 'minmax(0, 1fr)'
        }}
      >
        {gridCells.map((cell) => (
          <div
            key={cell.id}
            className={`
              w-full h-full rounded-[0.5px] border-[0.2px] border-[#222222]/30
              ${cell.isSold ? 'bg-[#FF6D1F]' : 'bg-white'}
            `}
          />
        ))}
      </div>
    </div>
  );
};

export default BlockGridCard;

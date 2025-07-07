import Image from 'next/image';
import { useTheme } from 'next-themes';

export default function MailLoader() {
  // No background color for transparency
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50">
      <div className="relative flex items-center justify-center mb-4">
        {/* Spinning green loader */}
        <span className="absolute w-20 h-20 rounded-full border-4 border-green-500 border-t-transparent animate-spin"></span>
        {/* Favicon at the center */}
        <Image src="/favicon.ico" alt="Fiona Favicon" width={48} height={48} className="z-10" />
      </div>
      <div className="text-lg font-semibold text-green-700">Fiona is Loading</div>
    </div>
  );
} 
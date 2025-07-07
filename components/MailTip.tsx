import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import React from 'react';

interface MailTipProps {
  heading: string;
  content: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MailTip: React.FC<MailTipProps> = ({ heading, content, open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <div className="flex flex-col items-center">
          <div className="mb-2 flex justify-center">
            <Image src="/favicon.ico" alt="Fiona Favicon" width={48} height={48} />
          </div>
          <DialogHeader className="w-full items-center">
            <DialogTitle className="text-center w-full">{heading}</DialogTitle>
          </DialogHeader>
          <DialogDescription asChild>
            <div className="mt-2 text-center w-full">{content}</div>
          </DialogDescription>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MailTip; 

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QRCodeDialog = ({ open, onOpenChange }: QRCodeDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan QR to Pay</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-4">
          <div className="bg-black text-white p-4 rounded-md flex flex-col items-center">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-2">
                <span className="text-purple-800 font-bold">UPI</span>
              </div>
              <span className="text-xl">UPI Payment</span>
            </div>
            <div className="text-purple-500 mb-2 text-xl font-bold">SCAN & PAY</div>
            <div className="text-white mb-4">Use any UPI app to pay</div>
            <img 
              src="/lovable-uploads/fcdd1f8e-025d-449d-9e2c-920eba13919d.png" 
              alt="UPI QR Code"
              className="w-64 h-64"
            />
            <div className="mt-2">UPI ID: foodies@ybl</div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            After payment, please enter the transaction ID to complete your order.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeDialog;

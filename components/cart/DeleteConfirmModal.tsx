'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogMedia,
} from '@/components/ui/alert-dialog';

export const DeleteConfirmModal: React.FC = () => {
  const { deleteConfirmItem, cancelDeleteItem, confirmDeleteItem } = useCart();

  const open = Boolean(deleteConfirmItem);

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && cancelDeleteItem()}>
      <AlertDialogContent from="top">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-red-50 text-red-600">
            <Trash2 className="w-5 h-5" />
          </AlertDialogMedia>
          <AlertDialogTitle>Hapus Dari Keranjang?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus{' '}
            <span className="font-semibold text-[#010101]">
              &ldquo;{deleteConfirmItem?.product.name}
              {deleteConfirmItem?.selectedOption ? ` (${deleteConfirmItem.selectedOption})` : ''}&rdquo;
            </span>{' '}
            dari daftar pesanan?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={cancelDeleteItem}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmDeleteItem}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Ya, Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

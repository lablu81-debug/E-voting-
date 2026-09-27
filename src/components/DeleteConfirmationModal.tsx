import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { Language } from '../types';

export interface DeleteModalData {
  type: 'candidate' | 'voter' | 'reset-data' | 'committee-member' | 'role' | 'reset-roles';
  id?: string;
  category?: 'vp' | 'ec';
  title: string;
  description: string;
  itemName: string;
  itemDetail?: string;
  itemPhoto?: string;
  itemBadge?: string;
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  data: DeleteModalData | null;
  currentLang: Language;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  data,
  currentLang,
  onClose,
  onConfirm
}) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 id="delete-dialog-title" className="text-base font-bold text-slate-900">
                {data.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentLang === 'en' ? 'Administrative Action' : 'প্রশাসনিক পদক্ষেপ'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Target Item Preview Card */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200/90 rounded-xl">
            {data.itemPhoto ? (
              <img
                src={data.itemPhoto}
                alt={data.itemName}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0 bg-slate-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 font-bold text-sm">
                <AlertTriangle className="w-6 h-6" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm truncate">{data.itemName}</span>
                {data.itemBadge && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 shrink-0">
                    {data.itemBadge}
                  </span>
                )}
              </div>
              {data.itemDetail && (
                <p className="text-xs text-slate-500 mt-0.5 truncate">{data.itemDetail}</p>
              )}
            </div>
          </div>

          {/* Warning Message */}
          <div className="flex items-start gap-2.5 p-3 bg-rose-50 border border-rose-200/80 rounded-xl text-rose-800 text-xs leading-relaxed">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{data.description}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
          >
            {currentLang === 'en' ? 'Cancel' : 'বাতিল'}
          </button>
          <button
            type="button"
            id="btn-confirm-delete-action"
            onClick={onConfirm}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-xs shadow-rose-600/30 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>
              {data.type === 'reset-data'
                ? currentLang === 'en'
                  ? 'Confirm Reset'
                  : 'রিসেট নিশ্চিত করুন'
                : currentLang === 'en'
                ? 'Yes, Delete'
                : 'হ্যাঁ, মুছুন'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

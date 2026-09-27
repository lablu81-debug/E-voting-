import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Check } from 'lucide-react';
import { Candidate, Language, PositionCategory } from '../types';
import { i18n } from '../data/initialData';

interface EditCandidateModalProps {
  isOpen: boolean;
  candidate: Candidate | null;
  currentLang: Language;
  onClose: () => void;
  onSave: (updated: Candidate, originalCategory: PositionCategory, originalId: string) => void;
}

export const EditCandidateModal: React.FC<EditCandidateModalProps> = ({
  isOpen,
  candidate,
  currentLang,
  onClose,
  onSave
}) => {
  const t = i18n[currentLang];

  const [category, setCategory] = useState<PositionCategory>('vp');
  const [id, setId] = useState<string>('');
  const [nameEn, setNameEn] = useState<string>('');
  const [nameBn, setNameBn] = useState<string>('');
  const [dept, setDept] = useState<string>('');
  const [imgUrl, setImgUrl] = useState<string>('');
  const [previewImg, setPreviewImg] = useState<string>('');

  useEffect(() => {
    if (candidate) {
      setCategory(candidate.category);
      setId(candidate.id);
      setNameEn(candidate.nameEn);
      setNameBn(candidate.nameBn);
      setDept(currentLang === 'en' ? candidate.deptEn : candidate.deptBn);
      setImgUrl(candidate.img.startsWith('data:') ? '' : candidate.img);
      setPreviewImg(candidate.img);
    }
  }, [candidate, currentLang]);

  if (!isOpen || !candidate) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPreviewImg(base64);
      setImgUrl('');
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (val: string) => {
    setImgUrl(val);
    if (val.trim()) {
      setPreviewImg(val.trim());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedCandidate: Candidate = {
      ...candidate,
      id: id.trim(),
      nameEn: nameEn.trim(),
      nameBn: nameBn.trim(),
      deptEn: dept.trim(),
      deptBn: dept.trim(),
      category,
      img: previewImg || candidate.img
    };

    onSave(updatedCandidate, candidate.category, candidate.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs no-print">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <h3 className="font-bold text-slate-900 text-lg">
            {currentLang === 'en' ? 'Edit Candidate Details' : 'প্রার্থীর তথ্য সম্পাদনা'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t.lblCandType}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as PositionCategory)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:border-blue-500 bg-white"
              required
            >
              <option value="vp">Vice President (সহ-সভাপতি)</option>
              <option value="ec">Executive Committee Member (কার্যনির্বাহী সদস্য)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t.lblCandId}
            </label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.lblCandNameEn}
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.lblCandNameBn}
              </label>
              <input
                type="text"
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t.lblCandDept}
            </label>
            <input
              type="text"
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-blue-600" />
              <span>{t.lblCandPhoto}</span>
            </label>
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
              <img
                src={previewImg || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                alt="Preview"
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0 bg-slate-200"
              />
              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <input
                  type="url"
                  value={imgUrl}
                  placeholder="Or enter image URL..."
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-md outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>{currentLang === 'en' ? 'Save Changes' : 'পরিবর্তন সংরক্ষণ করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { X, UserCheck, UploadCloud, Image as ImageIcon, Check } from 'lucide-react';
import { CommitteeMember, Language } from '../types';

interface CommitteeMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: CommitteeMember) => void;
  memberToEdit?: CommitteeMember | null;
  currentLang: Language;
}

const PRESET_BADGES = [
  {
    badgeEn: 'CHAIRMAN',
    badgeBn: 'চেয়ারম্যান',
    roleEn: 'Chairman, Election Committee',
    roleBn: 'চেয়ারম্যান, নির্বাচন পরিচালনা কমিটি'
  },
  {
    badgeEn: 'SECRETARY',
    badgeBn: 'সচিব',
    roleEn: 'Secretary, Election Committee',
    roleBn: 'সচিব, নির্বাচন পরিচালনা কমিটি'
  },
  {
    badgeEn: 'MEMBER',
    badgeBn: 'সদস্য',
    roleEn: 'Committee Member',
    roleBn: 'কমিটি সদস্য'
  },
  {
    badgeEn: 'OBSERVER',
    badgeBn: 'পর্যবেক্ষক',
    roleEn: 'Independent Observer',
    roleBn: 'নিরপেক্ষ পর্যবেক্ষক'
  },
  {
    badgeEn: 'VICE CHAIRMAN',
    badgeBn: 'সহ-চেয়ারম্যান',
    roleEn: 'Vice Chairman, Election Committee',
    roleBn: 'সহ-চেয়ারম্যান, নির্বাচন পরিচালনা কমিটি'
  }
];

export const CommitteeMemberModal: React.FC<CommitteeMemberModalProps> = ({
  isOpen,
  onClose,
  onSave,
  memberToEdit,
  currentLang
}) => {
  const [badgeEn, setBadgeEn] = useState('MEMBER');
  const [badgeBn, setBadgeBn] = useState('সদস্য');
  const [nameEn, setNameEn] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [deptEn, setDeptEn] = useState('');
  const [deptBn, setDeptBn] = useState('');
  const [roleEn, setRoleEn] = useState('Committee Member');
  const [roleBn, setRoleBn] = useState('কমিটি সদস্য');
  const [imgUrl, setImgUrl] = useState('');
  const [imgPreview, setImgPreview] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');

  useEffect(() => {
    if (memberToEdit) {
      setBadgeEn(memberToEdit.badge.en);
      setBadgeBn(memberToEdit.badge.bn);
      setNameEn(memberToEdit.name.en);
      setNameBn(memberToEdit.name.bn);
      setDeptEn(memberToEdit.dept.en);
      setDeptBn(memberToEdit.dept.bn);
      setRoleEn(memberToEdit.roleDescription?.en || 'Committee Member');
      setRoleBn(memberToEdit.roleDescription?.bn || 'কমিটি সদস্য');
      setImgPreview(memberToEdit.img || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
      setImgUrl('');
    } else {
      // Default reset for Add new
      setBadgeEn('MEMBER');
      setBadgeBn('সদস্য');
      setNameEn('');
      setNameBn('');
      setDeptEn('');
      setDeptBn('');
      setRoleEn('Committee Member');
      setRoleBn('কমিটি সদস্য');
      setImgPreview('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
      setImgUrl('');
    }
  }, [memberToEdit, isOpen]);

  if (!isOpen) return null;

  const handlePresetSelect = (preset: typeof PRESET_BADGES[0]) => {
    setBadgeEn(preset.badgeEn);
    setBadgeBn(preset.badgeBn);
    setRoleEn(preset.roleEn);
    setRoleBn(preset.roleBn);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImgPreview(base64);
      setImgUrl('');
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (url: string) => {
    setImgUrl(url);
    if (url.trim()) {
      setImgPreview(url.trim());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nameEn.trim()) return;

    const member: CommitteeMember = {
      id: memberToEdit ? memberToEdit.id : `c-${Date.now()}`,
      badge: {
        en: badgeEn.trim() || 'MEMBER',
        bn: badgeBn.trim() || 'সদস্য'
      },
      name: {
        en: nameEn.trim(),
        bn: nameBn.trim() || nameEn.trim()
      },
      dept: {
        en: deptEn.trim() || 'Election Committee',
        bn: deptBn.trim() || 'নির্বাচন পরিচালনা কমিটি'
      },
      img: imgPreview.trim(),
      roleDescription: {
        en: roleEn.trim() || 'Committee Member',
        bn: roleBn.trim() || 'কমিটি সদস্য'
      }
    };

    onSave(member);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden my-6 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {memberToEdit
                  ? (currentLang === 'en' ? 'Edit Committee Member' : 'কমিটি সদস্য সম্পাদনা')
                  : (currentLang === 'en' ? 'Add Election Committee Member' : 'নতুন কমিটি সদস্য যুক্ত করুন')}
              </h3>
              <p className="text-xs text-slate-500">
                {currentLang === 'en'
                  ? 'Election Organizing Committee official representation'
                  : 'নির্বাচন পরিচালনা কমিটির অফিশিয়াল সদস্য তথ্য'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs sm:text-sm max-h-[80vh] overflow-y-auto">
          {/* Quick Role / Designation Presets */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              {currentLang === 'en' ? 'Official Role Preset' : 'কমিটি পদের প্রিসেট'}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_BADGES.map((preset) => {
                const isSelected = badgeEn === preset.badgeEn;
                return (
                  <button
                    key={preset.badgeEn}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {currentLang === 'en' ? preset.badgeEn : preset.badgeBn}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Badge Label (English & Bangla) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                {currentLang === 'en' ? 'Badge Tag (EN)' : 'ব্যাজ ট্যাগ (ইংরেজি)'}
              </label>
              <input
                type="text"
                value={badgeEn}
                onChange={(e) => setBadgeEn(e.target.value.toUpperCase())}
                placeholder="e.g. CHAIRMAN"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-hidden focus:border-blue-500 font-mono text-xs font-bold"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                {currentLang === 'en' ? 'Badge Tag (BN)' : 'ব্যাজ ট্যাগ (বাংলা)'}
              </label>
              <input
                type="text"
                value={badgeBn}
                onChange={(e) => setBadgeBn(e.target.value)}
                placeholder="যেমন: চেয়ারম্যান"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-hidden focus:border-blue-500 font-bold"
                required
              />
            </div>
          </div>

          {/* Member Name (English & Bangla) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                {currentLang === 'en' ? 'Full Name (English)' : 'পূর্ণ নাম (ইংরেজি)'}
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Dr. Sarah Chen"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-hidden focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                {currentLang === 'en' ? 'Full Name (Bangla)' : 'পূর্ণ নাম (বাংলা)'}
              </label>
              <input
                type="text"
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                placeholder="যেমন: ড. সারাহ চেন"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          {/* Department / Affiliation (English & Bangla) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                {currentLang === 'en' ? 'Department / Office (EN)' : 'বিভাগ বা দফতর (ইংরেজি)'}
              </label>
              <input
                type="text"
                value={deptEn}
                onChange={(e) => setDeptEn(e.target.value)}
                placeholder="e.g. Compliance & Legal"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-hidden focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                {currentLang === 'en' ? 'Department / Office (BN)' : 'বিভাগ বা দফতর (বাংলা)'}
              </label>
              <input
                type="text"
                value={deptBn}
                onChange={(e) => setDeptBn(e.target.value)}
                placeholder="যেমন: কমপ্লায়েন্স ও লিগ্যাল"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          {/* Role Description on Official Certificate (English & Bangla) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                {currentLang === 'en' ? 'Certificate Signature Title (EN)' : 'সার্টিফিকেট পদবি (ইংরেজি)'}
              </label>
              <input
                type="text"
                value={roleEn}
                onChange={(e) => setRoleEn(e.target.value)}
                placeholder="e.g. Chairman, Election Committee"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-hidden focus:border-blue-500 text-xs"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                {currentLang === 'en' ? 'Certificate Signature Title (BN)' : 'সার্টিফিকেট পদবি (বাংলা)'}
              </label>
              <input
                type="text"
                value={roleBn}
                onChange={(e) => setRoleBn(e.target.value)}
                placeholder="যেমন: চেয়ারম্যান, নির্বাচন পরিচালনা কমিটি"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-hidden focus:border-blue-500 text-xs"
              />
            </div>
          </div>

          {/* Photo Preview & Upload */}
          <div className="border-t border-slate-200/80 pt-3">
            <label className="block font-medium text-slate-700 mb-2">
              {currentLang === 'en' ? 'Member Photo' : 'সদস্যের ছবি'}
            </label>
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <img
                  src={imgPreview}
                  alt="Preview"
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 shadow-sm bg-slate-100"
                />
                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-blue-600 text-white px-1.5 py-0.2 rounded-full whitespace-nowrap shadow-xs">
                  {badgeEn || 'MEMBER'}
                </span>
              </div>

              <div className="space-y-2 flex-1">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer text-xs font-semibold transition-colors">
                  <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
                  <span>{currentLang === 'en' ? 'Upload Photo File' : 'ফাইল আপলোড করুন'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="url"
                    value={imgUrl}
                    placeholder={currentLang === 'en' ? 'Or paste image URL...' : 'বা ছবির লিংক পেস্ট করুন...'}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
            >
              {currentLang === 'en' ? 'Cancel' : 'বাতিল'}
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-sm cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{currentLang === 'en' ? 'Save Committee Member' : 'কমিটি সদস্য সংরক্ষণ করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

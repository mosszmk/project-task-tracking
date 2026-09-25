import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  RefreshCw, 
  FileSpreadsheet, 
  HardDrive, 
  Sparkles,
  Database
} from 'lucide-react';
import { 
  GOOGLE_DRIVE_FOLDER_URL, 
  GOOGLE_SHEET_URL, 
  getAppsScriptUrl, 
  setAppsScriptUrl 
} from '../../services/googleSheetService';

interface GoogleSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerSync: () => Promise<void>;
  isSyncing: boolean;
  lastSyncTime: string | null;
  syncSuccess: boolean;
}

export const GoogleSyncModal: React.FC<GoogleSyncModalProps> = ({
  isOpen,
  onClose,
  onTriggerSync,
  isSyncing,
  lastSyncTime,
  syncSuccess,
}) => {
  const [scriptUrl, setScriptUrlInput] = useState(getAppsScriptUrl());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setAppsScriptUrl(scriptUrl);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
    onTriggerSync();
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(key);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-900/40">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-snug">
                Google Sheets &amp; Drive Cloud Sync
              </h3>
              <p className="text-xs text-slate-400">
                ระบบเชื่อมต่อฐานข้อมูลชีตและคลังไฟล์กลาง UCC Thailand
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Linked Resources Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Google Drive Card */}
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-800 font-bold mb-1">
                  <HardDrive className="w-4 h-4 text-emerald-600" />
                  <span>Google Drive Folder</span>
                </div>
                <p className="text-[11px] text-emerald-700 line-clamp-2">
                  คลังเก็บไฟล์งานทั้งหมด (PR, ใบเสนอราคา, สเปก, Artwork)
                </p>
              </div>
              <div className="pt-3 mt-2 border-t border-emerald-200/80 flex items-center gap-2">
                <a
                  href={GOOGLE_DRIVE_FOLDER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-2xs"
                >
                  <span>เปิด Google Drive</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={() => copyToClipboard(GOOGLE_DRIVE_FOLDER_URL, 'drive')}
                  className="p-1 text-emerald-700 hover:bg-emerald-100 rounded-md"
                  title="Copy link"
                >
                  {copiedLink === 'drive' ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* 2. Google Sheet Card */}
            <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-teal-900 font-bold mb-1">
                  <FileSpreadsheet className="w-4 h-4 text-teal-600" />
                  <span>Google Spreadsheet</span>
                </div>
                <p className="text-[11px] text-teal-700 line-clamp-2">
                  ฐานข้อมูล Projects, Tasks และ PR/PO จัดซื้อ
                </p>
              </div>
              <div className="pt-3 mt-2 border-t border-teal-200/80 flex items-center gap-2">
                <a
                  href={GOOGLE_SHEET_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white rounded-lg transition-colors shadow-2xs"
                >
                  <span>เปิด Google Sheet</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={() => copyToClipboard(GOOGLE_SHEET_URL, 'sheet')}
                  className="p-1 text-teal-800 hover:bg-teal-100 rounded-md"
                  title="Copy link"
                >
                  {copiedLink === 'sheet' ? <Check className="w-3.5 h-3.5 text-teal-700" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Web App URL Configuration Form */}
          <form onSubmit={handleSaveUrl} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 text-xs">
                Google Apps Script Web App URL (ตัวเชื่อม Database)
              </label>
              {scriptUrl && (
                <span className="text-[10.5px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  ติดตั้งแล้ว
                </span>
              )}
            </div>
            <input
              type="url"
              value={scriptUrl}
              onChange={(e) => setScriptUrlInput(e.target.value)}
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono text-slate-800"
            />
            <div className="flex items-center justify-between pt-1">
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                บันทึก URL &amp; ซิงค์ทันที
              </button>

              {savedSuccess && (
                <span className="text-emerald-600 font-semibold text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> บันทึกเรียบร้อย
                </span>
              )}
            </div>
          </form>

          {/* Manual Sync Trigger & Status */}
          <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-2xl shadow-2xs">
            <div>
              <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${scriptUrl ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                <span>สถานะการซิงค์ข้อมูล: {scriptUrl ? 'พร้อมซิงค์ Cloud' : 'เก็บสำรองในเครื่อง (Local Cache)'}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                ซิงค์ล่าสุดเมื่อ: {lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString('th-TH') : 'ยังไม่มีการซิงค์'}
              </p>
            </div>

            <button
              type="button"
              onClick={onTriggerSync}
              disabled={isSyncing}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                isSyncing
                  ? 'bg-slate-100 text-slate-400 border-slate-200'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'กำลังซิงค์...' : 'ซิงค์ข้อมูลเดี๋ยวนี้'}</span>
            </button>
          </div>

          {/* Easy 3-Step Setup Guide */}
          <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>วิธีตั้งค่าเชื่อมต่อ Google Sheet ใน 1 นาที (ทำครั้งเดียว):</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11.5px] text-amber-900/90 leading-relaxed">
              <li>เปิด Google Spreadsheet ของคุณ ➔ ไปที่เมนู <strong>ส่วนขยาย (Extensions)</strong> ➔ <strong>Apps Script</strong></li>
              <li>คัดลอกโค้ดจากไฟล์ <code>google-apps-script/Code.gs</code> ในโปรเจกต์นี้ไปวางแทนที่ทั้งหมด</li>
              <li>กด <strong>Deploy (การทำให้ใช้งานได้)</strong> ➔ <strong>New deployment (รายการใหม่)</strong> ➔ เลือก <strong>Web app</strong></li>
              <li>ตั้งค่า <strong>Who has access: Anyone (ทุกคน)</strong> ➔ กด Deploy แล้วนำ Web app URL มาแปะในช่องด้านบน</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 bg-white border border-slate-300 rounded-xl transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง (Close)
          </button>
        </div>
      </div>
    </div>
  );
};

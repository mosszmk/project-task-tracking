import React from 'react';
import { Search, Bell, Sparkles, FolderKanban, Plus, X, Coffee, HardDrive, FileSpreadsheet } from 'lucide-react';
import { QuickFilterType } from '../../types';
import { currentUser } from '../../mock/mockData';
import { UserAvatar } from '../common/UserAvatar';

interface HeaderProps {
  title: string;
  subtitle?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter?: QuickFilterType;
  onFilterChange?: (filter: QuickFilterType) => void;
  taskStats?: { total: number; myTasks: number; graphicTasks: number };
  onOpenNewProjectModal?: () => void;
  onOpenNewTaskModal?: () => void;
  onOpenQuickGuide?: () => void;
  onOpenGoogleSync?: () => void;
  isSyncing?: boolean;
  isSheetConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  searchQuery,
  onSearchChange,
  onOpenNewProjectModal,
  onOpenNewTaskModal,
  onOpenQuickGuide,
  onOpenGoogleSync,
  isSyncing,
  isSheetConnected,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-20 px-6 py-3.5 shadow-md shadow-slate-950/20">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Brand logo & Title */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-md shadow-amber-950/50 text-white font-semibold flex-shrink-0">
            <Coffee className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-medium text-amber-400 mb-0.5">
              <span>UCC Thailand &bull; B2C Project &amp; Task Tracking</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight truncate">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs sm:text-sm font-light text-slate-400 mt-0.5 truncate max-w-xl">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right: Search, Actions, Profile */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* Search Input */}
          <div className="relative w-64 md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search tasks, projects, assignees..."
              className="w-full pl-9 pr-8 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-sm font-normal text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Google Drive Central Storage Folder */}
          <a
            href="https://drive.google.com/drive/folders/1fWXvxxKx8rckEhDgDNLwuYC7310PKyGE?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900/70 border border-emerald-700/60 rounded-xl transition-all shadow-2xs"
            title="เปิดโฟลเดอร์ Google Drive กลางสำหรับจัดเก็บไฟล์งาน"
          >
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
            <span>Google Drive</span>
          </a>

          {/* Google Sheet Database Sync Button */}
          {onOpenGoogleSync && (
            <button
              onClick={onOpenGoogleSync}
              className={`hidden md:flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-xl border transition-all shadow-2xs cursor-pointer ${
                isSheetConnected
                  ? 'text-teal-300 bg-teal-950/70 hover:bg-teal-900/70 border-teal-700/60'
                  : 'text-slate-300 bg-slate-800 hover:bg-slate-700/80 border-slate-700'
              }`}
              title="ตั้งค่าและตรวจสอบการซิงค์ฐานข้อมูล Google Sheets"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" />
              <span>Sheet Sync</span>
              <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-400 animate-ping' : isSheetConnected ? 'bg-emerald-400' : 'bg-slate-500'}`} />
            </button>
          )}

          {/* Friendly Quick Guide CTA */}
          {onOpenQuickGuide && (
            <button
              onClick={onOpenQuickGuide}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-amber-300 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800/60 rounded-xl transition-all cursor-pointer shadow-2xs"
              title="Quick 3-step guide: easy onboarding in 30 seconds"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Guide</span>
            </button>
          )}

          {/* Quick Create Buttons in Header */}
          {onOpenNewProjectModal && (
            <button
              onClick={onOpenNewProjectModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-amber-200 bg-slate-800 hover:bg-slate-700/80 border border-amber-600/40 rounded-xl transition-colors shadow-2xs"
              title="Create New Project"
            >
              <FolderKanban className="w-3.5 h-3.5 text-amber-400" />
              <span>+ Create Project</span>
            </button>
          )}

          {onOpenNewTaskModal && (
            <button
              onClick={onOpenNewTaskModal}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-950/30 transition-colors"
              title="Add Task to Project"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>+ Add Task</span>
            </button>
          )}

          {/* Notification Bell */}
          <button className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-slate-900" />
          </button>

          <div className="h-6 w-px bg-slate-800 mx-0.5" />

          {/* User Avatar */}
          <div className="flex items-center gap-2 pl-1">
            <UserAvatar user={currentUser} size="sm" />
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-medium text-slate-200 leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[11px] font-normal text-rose-400 leading-none">
                NPD Lead
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

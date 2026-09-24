import React, { useState, useRef, useEffect } from 'react';
import { User } from '../../types';
import { mockUsers } from '../../mock/mockData';
import { UserAvatar } from '../common/UserAvatar';
import { Check, ChevronDown } from 'lucide-react';

interface AssigneeCellProps {
  assignee: User;
  onChange: (newUser: User) => void;
  disabled?: boolean;
}

export const AssigneeCell: React.FC<AssigneeCellProps> = ({
  assignee,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors text-left group"
        title="Click to reassign"
      >
        <UserAvatar user={assignee} size="sm" />
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-800 group-hover:text-indigo-600 transition-colors truncate max-w-[110px]">
            {assignee.name}
          </span>
        </div>
        <ChevronDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      {/* Reassign Dropdown */}
      {isOpen && (
        <div className="absolute left-0 mt-1 w-52 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
            Reassign Task
          </div>
          {mockUsers.map((user) => {
            const isSelected = user.id === assignee.id;
            return (
              <button
                key={user.id}
                type="button"
                onClick={() => {
                  onChange(user);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition-colors hover:bg-slate-50 ${
                  isSelected ? 'bg-indigo-50/50 font-semibold' : ''
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <UserAvatar user={user} size="sm" />
                  <div>
                    <p className="text-xs font-medium text-slate-800">
                      {user.name} {user.nameTh ? <span className="text-[10px] text-slate-500 font-normal">({user.nameTh})</span> : ''}
                    </p>
                    <p className="text-[10px] text-indigo-600 font-medium">{user.role}</p>
                  </div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

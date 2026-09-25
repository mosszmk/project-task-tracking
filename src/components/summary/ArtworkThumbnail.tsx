import React, { useState } from 'react';
import { ArtworkInfo } from '../../types';
import { Image, ArrowRight, Maximize2, X, Plus, Edit2 } from 'lucide-react';

interface ArtworkThumbnailProps {
  artwork?: ArtworkInfo;
  projectName: string;
  onEditArtwork?: () => void;
}

export const ArtworkThumbnail: React.FC<ArtworkThumbnailProps> = ({
  artwork,
  projectName,
  onEditArtwork,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<'both' | 'before' | 'after'>('both');

  if (!artwork) {
    if (onEditArtwork) {
      return (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEditArtwork();
          }}
          className="w-28 h-14 rounded-lg border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/40 hover:bg-indigo-50 flex flex-col items-center justify-center text-indigo-600 transition-all cursor-pointer group/btn shadow-2xs hover:shadow-xs"
          title="คลิกเพื่อเพิ่มรูป Artwork / Key Visual"
        >
          <div className="flex items-center gap-1 text-[11px] font-semibold text-indigo-700">
            <Plus className="w-3.5 h-3.5 text-indigo-600" />
            <span>+ เพิ่มรูป AW</span>
          </div>
          <span className="text-[9px] text-indigo-400 group-hover/btn:text-indigo-600 font-medium">
            อัปโหลด / URL
          </span>
        </button>
      );
    }

    return (
      <div className="w-28 h-14 rounded-lg bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400">
        <Image className="w-4 h-4 mb-0.5 opacity-50" />
        <span className="text-[10px]">No Artwork</span>
      </div>
    );
  }

  const isBeforeAfter = artwork.type === 'before_after' && artwork.secondaryUrl;

  return (
    <>
      <div 
        className="group relative cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        {isBeforeAfter ? (
          /* Dual / Before & After Thumbnail */
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-lg border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition-all w-fit shadow-2xs">
            {/* Old / Current Thumbnail */}
            <div 
              className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-md overflow-hidden bg-white p-0.5 border border-slate-200 flex-shrink-0 group/img flex items-center justify-center"
              title={artwork.labelSecondary || 'Old Packaging (Previous)'}
            >
              <img
                src={artwork.secondaryUrl}
                alt={artwork.labelSecondary || 'Old Packaging'}
                className="w-full h-full object-contain filter grayscale-[15%] group-hover/img:scale-105 transition-transform"
              />
            </div>

            {/* Arrow Indicator */}
            <div className="flex items-center justify-center text-slate-400">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>

            {/* New / Next Gen Thumbnail */}
            <div 
              className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-md overflow-hidden bg-white p-0.5 border border-emerald-300 ring-1 ring-emerald-500/40 flex-shrink-0 group/img flex items-center justify-center shadow-2xs"
              title={artwork.labelPrimary || 'New Packaging (Approved)'}
            >
              <img
                src={artwork.primaryUrl}
                alt={artwork.labelPrimary || 'New Packaging'}
                className="w-full h-full object-contain group-hover/img:scale-105 transition-transform"
              />
            </div>

            <div className="absolute inset-0 bg-slate-900/15 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity pointer-events-none">
              <Maximize2 className="w-4 h-4 text-white drop-shadow" />
            </div>
            {onEditArtwork && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditArtwork();
                }}
                className="absolute top-1 right-1 p-1 bg-slate-900/80 hover:bg-indigo-600 text-white rounded-md shadow-xs opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10"
                title="แก้ไข / เปลี่ยนรูป AW"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ) : (
          /* Single Thumbnail: Full image visible, no text overlay */
          <div 
            className="relative w-36 h-20 sm:w-40 sm:h-22 rounded-lg overflow-hidden border border-slate-200 bg-white p-1 group-hover:border-indigo-400 hover:shadow-xs transition-all flex items-center justify-center shadow-2xs"
            title={`${artwork.labelPrimary || projectName} (คลิกเพื่อดูรูปขยาย)`}
          >
            <img
              src={artwork.primaryUrl}
              alt={artwork.labelPrimary || projectName}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-slate-900/15 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
              <Maximize2 className="w-4 h-4 text-white drop-shadow" />
            </div>
            {onEditArtwork && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditArtwork();
                }}
                className="absolute top-1 right-1 p-1 bg-slate-900/80 hover:bg-indigo-600 text-white rounded-md shadow-xs opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10"
                title="แก้ไข / เปลี่ยนรูป AW"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Enlarged Artwork Zoom Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-indigo-600">
                  Artwork & Key Visual Inspector
                </span>
                <h3 className="text-base font-semibold text-slate-900">{projectName}</h3>
              </div>
              <div className="flex items-center gap-2">
                {onEditArtwork && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      onEditArtwork();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>แก้ไข / เปลี่ยนรูป AW</span>
                  </button>
                )}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* View switcher if Before/After */}
            {isBeforeAfter && (
              <div className="flex justify-center mb-4">
                <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setActiveView('both')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      activeView === 'both' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Side-by-Side Comparison
                  </button>
                  <button
                    onClick={() => setActiveView('before')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      activeView === 'before' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Old Packaging
                  </button>
                  <button
                    onClick={() => setActiveView('after')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      activeView === 'after' ? 'bg-white text-emerald-700 font-medium shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    New Packaging ✨
                  </button>
                </div>
              </div>
            )}

            {/* Images Grid */}
            <div className="flex items-center justify-center gap-6">
              {isBeforeAfter ? (
                <>
                  {(activeView === 'both' || activeView === 'before') && (
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-full h-80 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative group">
                        <img
                          src={artwork.secondaryUrl}
                          alt="Old packaging"
                          className="w-full h-full object-contain p-2"
                        />
                        <span className="absolute top-3 left-3 bg-slate-900/80 text-white text-xs font-medium px-2.5 py-1 rounded-md">
                          Previous Version
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-500 mt-2">
                        {artwork.labelSecondary || 'Current in Market'}
                      </p>
                    </div>
                  )}

                  {(activeView === 'both' || activeView === 'after') && (
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-full h-80 rounded-xl overflow-hidden border-2 border-emerald-500 bg-emerald-50/20 relative group shadow-lg">
                        <img
                          src={artwork.primaryUrl}
                          alt="New packaging"
                          className="w-full h-full object-contain p-2"
                        />
                        <span className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-medium px-2.5 py-1 rounded-md shadow-xs">
                          Approved New AW (2026)
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-emerald-700 mt-2">
                        {artwork.labelPrimary || 'New Design'}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-96 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                  <img
                    src={artwork.primaryUrl}
                    alt={projectName}
                    className="w-full h-full object-contain p-4"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

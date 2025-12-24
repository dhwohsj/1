'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { phoneCountries, generateMultiplePhones, type CountryPhone } from '@/lib/phoneData';

const ICON_PATHS: Record<string, React.ReactElement> = {
  search: <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>,
  close: <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>,
  download: <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"/>,
  chevronRight: <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>,
  sparkles: <path d="M7 11v2l-4 1 4 1v2l1-4-1-4zm5-7v4l-3 1 3 1v4l2-5-2-5zm5.66 2.94L15 6.26l.66-2.94L18.34 6l2.66.68-2.66.68-.68 2.58-.66-2.94zM15 18l-2-3 2-3 2 3-2 3z"/>,
  copy: <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>,
  check: <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
};

const Icon = memo(({ name, className = "w-6 h-6" }: { name: string; className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">{ICON_PATHS[name]}</svg>
));
Icon.displayName = 'Icon';

const haptic = (duration: number = 15) => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(duration);
  }
};

const ITEMS_PER_PAGE = 50;
const COUNTRY_PAGE_SIZE = 30;

interface CountrySelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (country: CountryPhone) => void;
  selectedCountry: CountryPhone | null;
}

const CountrySelectModal = memo(({ isOpen, onClose, onSelect, selectedCountry }: CountrySelectModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setSearchQuery('');
      setCurrentPage(0);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const filteredCountries = useMemo(() => {
    if (!searchQuery) return phoneCountries;
    const query = searchQuery.toLowerCase();
    return phoneCountries.filter(country =>
      country.name.toLowerCase().includes(query) ||
      country.code.includes(query)
    );
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredCountries.length / COUNTRY_PAGE_SIZE);
  const paginatedCountries = useMemo(() => {
    const start = currentPage * COUNTRY_PAGE_SIZE;
    return filteredCountries.slice(start, start + COUNTRY_PAGE_SIZE);
  }, [filteredCountries, currentPage]);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] overflow-hidden flex flex-col">
      <div className="flex-shrink-0 p-4 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="max-w-[600px] mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[20px] font-bold text-white tracking-tight drop-shadow-md">
              选择国家
            </h2>
            <button
              onClick={() => { haptic(20); onClose(); }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all touch-manipulation"
            >
              <Icon name="close" className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name="search" className="w-5 h-5 text-white/40" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索国家或区号..."
              className="w-full pl-10 pr-10 py-3 bg-black/30 border border-white/20 rounded-[16px] text-[16px] text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:bg-black/40 transition-colors caret-[#007AFF] outline-none shadow-xl"
            />
            {searchQuery && (
              <button
                onClick={() => { haptic(20); setSearchQuery(''); }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center touch-manipulation active:scale-90 transition-transform"
              >
                <div className="bg-white/20 rounded-full p-1">
                  <Icon name="close" className="w-3.5 h-3.5 text-white" />
                </div>
              </button>
            )}
          </div>

          {filteredCountries.length > 0 && (
            <div className="mt-3 text-[13px] text-white/60 drop-shadow-sm">
              共 {filteredCountries.length} 个国家
              {totalPages > 1 && ` • 第 ${currentPage + 1}/${totalPages} 页`}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="max-w-[600px] mx-auto p-4 space-y-2">
          {paginatedCountries.length > 0 ? (
            paginatedCountries.map((country) => {
              const isSelected = selectedCountry?.id === country.id;
              return (
                <button
                  key={country.id}
                  onClick={() => { haptic(30); onSelect(country); onClose(); }}
                  className={`w-full flex items-center justify-between p-4 rounded-[16px] transition-all duration-200 active:scale-[0.98] touch-manipulation border ${
                    isSelected
                      ? 'bg-white/10 border-white/20 shadow-lg'
                      : 'bg-black/30 border-white/10 active:bg-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-[32px] leading-none drop-shadow-md">{country.flag}</span>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-[16px] font-semibold text-white truncate drop-shadow-md">
                        {country.name}
                      </div>
                      <div className="text-[14px] text-white/60 drop-shadow-sm">
                        {country.code}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <Icon name="check" className="w-5 h-5 text-[#34C759] shrink-0 ml-2 drop-shadow-md" />
                  )}
                </button>
              );
            })
          ) : (
            <div className="text-center py-16">
              <p className="text-white/50 text-[15px]">未找到匹配的国家</p>
            </div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex-shrink-0 p-4 border-t border-white/10 bg-black/40 backdrop-blur-xl">
          <div className="max-w-[600px] mx-auto flex items-center justify-between gap-3">
            <button
              onClick={() => { haptic(20); setCurrentPage(p => Math.max(0, p - 1)); }}
              disabled={currentPage === 0}
              className="flex-1 py-3 px-4 rounded-[14px] bg-white/10 text-white font-semibold text-[15px] disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all touch-manipulation"
            >
              上一页
            </button>
            <div className="px-4 text-[15px] font-semibold text-white/80 whitespace-nowrap">
              {currentPage + 1} / {totalPages}
            </div>
            <button
              onClick={() => { haptic(20); setCurrentPage(p => Math.min(totalPages - 1, p + 1)); }}
              disabled={currentPage === totalPages - 1}
              className="flex-1 py-3 px-4 rounded-[14px] bg-white/10 text-white font-semibold text-[15px] disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all touch-manipulation"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
CountrySelectModal.displayName = 'CountrySelectModal';

export default function PhoneGeneratorPage() {
  const [selectedCountry, setSelectedCountry] = useState<CountryPhone | null>(phoneCountries[0]);
  const [count, setCount] = useState<string>('10');
  const [generatedPhones, setGeneratedPhones] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showCopiedAll, setShowCopiedAll] = useState(false);

  const totalPages = Math.ceil(generatedPhones.length / ITEMS_PER_PAGE);
  const paginatedPhones = useMemo(() => {
    const start = currentPage * ITEMS_PER_PAGE;
    return generatedPhones.slice(start, start + ITEMS_PER_PAGE);
  }, [generatedPhones, currentPage]);

  const handleGenerate = useCallback(async () => {
    if (!selectedCountry) return;

    const countNum = parseInt(count);
    if (isNaN(countNum) || countNum < 1 || countNum > 10000) {
      alert('请输入1-10000之间的数字');
      return;
    }

    haptic(50);
    setIsGenerating(true);
    setCurrentPage(0);

    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const phones = generateMultiplePhones(selectedCountry, countNum);
      setGeneratedPhones(phones);
    } catch (error) {
      console.error('生成失败:', error);
      alert('生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedCountry, count]);

  const handleDownload = useCallback(() => {
    if (generatedPhones.length === 0) return;

    haptic(30);
    const content = generatedPhones.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedCountry?.name || '手机号'}_${generatedPhones.length}个_${new Date().getTime()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [generatedPhones, selectedCountry]);

  const handleCopy = useCallback(async (phone: string, index: number) => {
    haptic(30);
    try {
      await navigator.clipboard.writeText(phone);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch (error) {
      console.error('复制失败:', error);
    }
  }, []);

  const handleCopyAll = useCallback(async () => {
    if (generatedPhones.length === 0) return;

    haptic(30);
    try {
      await navigator.clipboard.writeText(generatedPhones.join('\n'));
      setShowCopiedAll(true);
      setTimeout(() => setShowCopiedAll(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  }, [generatedPhones]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] text-white pb-10 selection:bg-blue-400/30 overflow-x-hidden">
      <div className="relative z-10">
        <header className="fixed top-0 left-0 right-0 h-[52px] z-40 flex items-center justify-center px-4 pt-2 bg-black/20 backdrop-blur-xl border-b border-white/10">
          <h1 className="text-[17px] font-semibold text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            随机手机号生成器
          </h1>
        </header>

        <main className="max-w-[600px] mx-auto px-5 pt-20 pb-10 space-y-6">
          <section className="bg-black/30 rounded-[20px] border border-white/20 shadow-xl overflow-hidden">
            <button
              onClick={() => { haptic(20); setShowCountryModal(true); }}
              className="w-full flex items-center justify-between p-4 active:bg-white/10 transition-all duration-200 touch-manipulation active:scale-[0.99]"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {selectedCountry && (
                  <>
                    <span className="text-[32px] leading-none drop-shadow-md">{selectedCountry.flag}</span>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-[16px] font-semibold text-white truncate drop-shadow-md">
                        {selectedCountry.name}
                      </div>
                      <div className="text-[14px] text-white/60 drop-shadow-sm">
                        {selectedCountry.code}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <Icon name="chevronRight" className="w-5 h-5 text-white/60 shrink-0 ml-2" />
            </button>

            <div className="px-4 pb-4 space-y-4">
              <div className="h-[0.5px] bg-white/20" />

              <div>
                <label className="block text-[14px] font-medium text-white/80 mb-2 drop-shadow-sm">
                  生成数量 (1-10000)
                </label>
                <input
                  type="number"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  min="1"
                  max="10000"
                  className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-[14px] text-[16px] text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:bg-black/40 transition-colors caret-[#007AFF] outline-none"
                  placeholder="输入生成数量"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !selectedCountry}
                className="w-full py-4 rounded-[16px] bg-gradient-to-r from-[#007AFF]/90 to-[#0055b3]/90 shadow-[0_0_20px_rgba(0,122,255,0.4)] border border-white/20 flex items-center justify-center gap-2.5 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] transition-all duration-200"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-[17px] font-semibold text-white drop-shadow-md">生成中...</span>
                  </>
                ) : (
                  <>
                    <Icon name="sparkles" className="w-5 h-5 text-white/90 drop-shadow-sm" />
                    <span className="text-[17px] font-semibold text-white drop-shadow-md">生成手机号</span>
                  </>
                )}
              </button>
            </div>
          </section>

          {generatedPhones.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-[14px] text-white/80 drop-shadow-sm">
                  共生成 <span className="font-bold text-[#34C759]">{generatedPhones.length}</span> 个手机号
                  {totalPages > 1 && ` • 第 ${currentPage + 1}/${totalPages} 页`}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyAll}
                  className="flex-1 py-3 px-4 rounded-[14px] bg-black/30 border border-white/20 text-white font-semibold text-[15px] flex items-center justify-center gap-2 active:scale-95 transition-all touch-manipulation relative overflow-hidden"
                >
                  <div className={`flex items-center gap-2 transition-all duration-300 ${showCopiedAll ? 'opacity-0 -translate-y-6' : 'opacity-100 translate-y-0'}`}>
                    <Icon name="copy" className="w-4 h-4" />
                    <span>复制全部</span>
                  </div>
                  <div className={`absolute inset-0 flex items-center justify-center gap-2 transition-all duration-300 ${showCopiedAll ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                    <Icon name="check" className="w-4 h-4 text-[#34C759]" />
                    <span className="text-[#34C759]">已复制</span>
                  </div>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-1 py-3 px-4 rounded-[14px] bg-black/30 border border-white/20 text-white font-semibold text-[15px] flex items-center justify-center gap-2 active:scale-95 transition-all touch-manipulation"
                >
                  <Icon name="download" className="w-4 h-4" />
                  <span>下载文件</span>
                </button>
              </div>

              <div className="bg-black/30 rounded-[20px] border border-white/20 shadow-xl overflow-hidden">
                {paginatedPhones.map((phone, index) => {
                  const globalIndex = currentPage * ITEMS_PER_PAGE + index;
                  const isCopied = copiedIndex === globalIndex;
                  return (
                    <div key={globalIndex}>
                      <button
                        onClick={() => handleCopy(phone, globalIndex)}
                        className="w-full flex items-center justify-between p-4 active:bg-white/10 transition-all duration-200 touch-manipulation group"
                      >
                        <span className="text-[16px] font-mono text-white drop-shadow-sm">
                          {phone}
                        </span>
                        <div className="relative w-8 h-8 flex items-center justify-center">
                          <div className={`absolute transition-all duration-300 ${isCopied ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}>
                            <Icon name="copy" className="w-5 h-5 text-white/40 group-active:text-white/60" />
                          </div>
                          <div className={`absolute transition-all duration-300 ${isCopied ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                            <Icon name="check" className="w-5 h-5 text-[#34C759]" />
                          </div>
                        </div>
                      </button>
                      {index < paginatedPhones.length - 1 && (
                        <div className="mx-4 h-[0.5px] bg-white/10" />
                      )}
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => { haptic(20); setCurrentPage(p => Math.max(0, p - 1)); }}
                    disabled={currentPage === 0}
                    className="flex-1 py-3 px-4 rounded-[14px] bg-black/30 border border-white/20 text-white font-semibold text-[15px] disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all touch-manipulation"
                  >
                    上一页
                  </button>
                  <div className="px-4 text-[15px] font-semibold text-white/80 whitespace-nowrap">
                    {currentPage + 1} / {totalPages}
                  </div>
                  <button
                    onClick={() => { haptic(20); setCurrentPage(p => Math.min(totalPages - 1, p + 1)); }}
                    disabled={currentPage === totalPages - 1}
                    className="flex-1 py-3 px-4 rounded-[14px] bg-black/30 border border-white/20 text-white font-semibold text-[15px] disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all touch-manipulation"
                  >
                    下一页
                  </button>
                </div>
              )}
            </section>
          )}
        </main>
      </div>

      <CountrySelectModal
        isOpen={showCountryModal}
        onClose={() => setShowCountryModal(false)}
        onSelect={setSelectedCountry}
        selectedCountry={selectedCountry}
      />
    </div>
  );
}

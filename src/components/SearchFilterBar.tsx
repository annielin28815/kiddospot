"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { createPortal } from "react-dom";
import { ui } from "@/src/lib/ui";

type FilterOption = {
  id: string;
  name: string;
};

type SearchFilterValue = {
  keyword: string;
  tagIds: string[];
  facilityIds: string[];
  source: SourceFilterValue;
};

type SearchFilterBarProps = {
  tags: FilterOption[];
  facilities: FilterOption[];
  value?: SearchFilterValue;
  onApply?: (value: SearchFilterValue) => void;
  onClear?: () => void;
  onOpenChange?: (open: boolean) => void;
  compact?: boolean;
};

type SourceFilterValue = "all" | "user" | "familyToilet";

const defaultValue: SearchFilterValue = {
  keyword: "",
  tagIds: [],
  facilityIds: [],
  source: "all",
};

const pillBase =
  "rounded-full border px-4 py-2 text-sm font-medium transition";

const pillNeutral =
  "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-page)] dark:bg-white/10 dark:hover:bg-white/15";

const pillPeach =
  "border-[#F4A261] bg-[#F4A261]/12 text-[#8A4B00] dark:border-[#F4A261]/40 dark:bg-[#F4A261]/16 dark:text-[#F4A261]";

const pillMint =
  "border-[#8CBF9F] bg-[#8CBF9F]/12 text-[#456A54] dark:border-[#8CBF9F]/40 dark:bg-[#8CBF9F]/16 dark:text-[#8CBF9F]";

export default function SearchFilterBar({
  tags,
  facilities,
  value = defaultValue,
  onApply,
  onClear,
  onOpenChange,
  compact = false,
}: SearchFilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [draftKeyword, setDraftKeyword] = useState(value.keyword ?? "");
  const [draftTagIds, setDraftTagIds] = useState<string[]>(value.tagIds ?? []);
  const [draftFacilityIds, setDraftFacilityIds] = useState<string[]>(
    value.facilityIds ?? []
  );
  const [mounted, setMounted] = useState(false);
  const [draftSource, setDraftSource] = useState<SourceFilterValue>(
    value.source ?? "all"
  );

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setDraftKeyword(value.keyword ?? "");
    setDraftTagIds(value.tagIds ?? []);
    setDraftFacilityIds(value.facilityIds ?? []);
  }, [value]);

  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setDraftSource(value.source ?? "all");
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  const activeCount = useMemo(() => {
    let count = 0;
    if (value.keyword?.trim()) count += 1;
    if (value.tagIds?.length) count += value.tagIds.length;
    if (value.facilityIds?.length) count += value.facilityIds.length;
    return count;
  }, [value]);

  function openSheet() {
    setIsOpen(true);
    onOpenChange?.(true);
  }

  function closeSheet() {
    setIsOpen(false);
    onOpenChange?.(false);
  }

  function toggleSelect(
    id: string,
    list: string[],
    setter: (v: string[]) => void
  ) {
    if (list.includes(id)) {
      setter(list.filter((item) => item !== id));
      return;
    }
    setter([...list, id]);
  }

  function handleApply() {
    onApply?.({
      keyword: draftKeyword,
      tagIds: draftTagIds,
      facilityIds: draftFacilityIds,
      source: draftSource,
    });
    closeSheet();
  }

  function handleClearDraft() {
    setDraftKeyword("");
    setDraftTagIds([]);
    setDraftFacilityIds([]);
    setDraftSource("all");
  }

  function handleClearAll() {
    handleClearDraft();
    onClear?.();
    closeSheet();
  }

  return (
    <>
      {/* 🔍 top search */}
      <div className="sticky top-0 z-[900] backdrop-blur bg-[var(--color-bg-page)]/80">
        <div className="mx-auto w-full max-w-3xl px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={openSheet}
              className={`${ui.searchBar} h-12 flex-1`}
            >
              <Search className="h-4 w-4 text-[var(--color-text-muted)]" />

              <div className="min-w-0 flex-1 text-left">
                <p className={`${ui.body} truncate`}>
                  {value.keyword?.trim()
                    ? value.keyword
                    : "搜尋地點、地址、描述"}
                </p>

                <p className={`${ui.caption} ${ui.secondary} truncate`}>
                  {activeCount > 0
                    ? `${value.tagIds.length} 個分類・${value.facilityIds.length} 個設施`
                    : "可篩選分類與設施"}
                </p>
              </div>
            </button>

            <button
              onClick={openSheet}
              className={`${ui.iconButton} ${ui.iconButtonNeutral} h-12 w-12 relative`}
            >
              <SlidersHorizontal className="h-5 w-5" />

              {activeCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#F4A261] px-1 text-[10px] font-semibold text-white">
                  {activeCount}
                </span>
              )}
            </button>
          </div>

          {/* active filters */}
          {activeCount > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 items-center">
              {value.keyword && (
                <span className={`${ui.chipBase} ${ui.chipNeutral}`}>
                  關鍵字：{value.keyword}
                </span>
              )}

              {value.tagIds.length > 0 && (
                <span className={`${ui.chipBase} ${pillPeach}`}>
                  分類 {value.tagIds.length}
                </span>
              )}

              {value.facilityIds.length > 0 && (
                <span className={`${ui.chipBase} ${pillMint}`}>
                  設施 {value.facilityIds.length}
                </span>
              )}

              <button
                onClick={handleClearAll}
                className={`${ui.caption} ${ui.muted} underline ml-1`}
              >
                清除全部
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 🧾 bottom sheet */}
      {mounted &&
        isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[1200]">
            <div className={ui.overlay} onClick={closeSheet} />

            <div className="absolute inset-x-0 bottom-0 md:flex md:items-center md:justify-center md:p-6">
              <div className={`${ui.sheetBase} w-full md:max-w-2xl md:rounded-3xl`}>
                
                {/* handle */}
                <div className={ui.sheetHandleWrap}>
                  <div className={ui.sheetHandle} />
                </div>

                {/* header */}
                <div className="flex items-center justify-between px-5 pb-3">
                  <div>
                    <h2 className={ui.sectionTitle}>搜尋篩選</h2>
                    <p className={ui.sectionDesc}>
                      用關鍵字、分類與設施快速找到合適地點
                    </p>
                  </div>

                  <button
                    onClick={closeSheet}
                    className={`${ui.iconButton} ${ui.iconButtonNeutral}`}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* content */}
                <div className={ui.sheetContent}>
                  {/* keyword */}
                  <section className={ui.section}>
                    <label className={ui.fieldLabel}>關鍵字</label>

                    <div className={ui.searchBar}>
                      <Search className="h-4 w-4 text-[var(--color-text-muted)]" />
                      <input
                        value={draftKeyword}
                        onChange={(e) => setDraftKeyword(e.target.value)}
                        placeholder="例如：親子餐廳、台中、尿布台"
                        className="w-full bg-transparent text-sm outline-none"
                      />
                    </div>
                  </section>

                  {/* source */}
                  <section className={ui.section}>
                    <div className="flex justify-between items-center">
                      <h3 className={ui.fieldLabel}>資料來源</h3>
                      <span className={ui.caption}>單選</span>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        onClick={() => setDraftSource("all")}
                        className={`${pillBase} ${
                          draftSource === "all" ? pillPeach : pillNeutral
                        }`}
                      >
                        全部
                      </button>

                      <button
                        type="button"
                        onClick={() => setDraftSource("user")}
                        className={`${pillBase} ${
                          draftSource === "user" ? pillPeach : pillNeutral
                        }`}
                      >
                        使用者新增
                      </button>

                      <button
                        type="button"
                        onClick={() => setDraftSource("familyToilet")}
                        className={`${pillBase} ${
                          draftSource === "familyToilet" ? pillPeach : pillNeutral
                        }`}
                      >
                        政府資料｜親子廁所
                      </button>
                    </div>
                  </section>

                  {/* tags */}
                  <section className={ui.section}>
                    <div className="flex justify-between items-center">
                      <h3 className={ui.fieldLabel}>分類</h3>
                      <span className={ui.caption}>可複選</span>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      {tags.map((tag) => {
                        const selected = draftTagIds.includes(tag.id);
                        return (
                          <button
                            key={tag.id}
                            onClick={() =>
                              toggleSelect(tag.id, draftTagIds, setDraftTagIds)
                            }
                            className={`${pillBase} ${
                              selected ? pillPeach : pillNeutral
                            }`}
                          >
                            {tag.name}
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  {/* facilities */}
                  <section className={ui.section}>
                    <div className="flex justify-between items-center">
                      <h3 className={ui.fieldLabel}>設施</h3>
                      <span className={ui.caption}>可複選</span>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      {facilities.map((f) => {
                        const selected = draftFacilityIds.includes(f.id);
                        return (
                          <button
                            key={f.id}
                            onClick={() =>
                              toggleSelect(
                                f.id,
                                draftFacilityIds,
                                setDraftFacilityIds
                              )
                            }
                            className={`${pillBase} ${
                              selected ? pillMint : pillNeutral
                            }`}
                          >
                            {f.name}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                </div>

                {/* footer */}
                <div className={`${ui.divider} px-5 py-4`}>
                  <div className="flex gap-3">
                    <button
                      onClick={handleClearDraft}
                      className={`${ui.buttonBase} ${ui.buttonMd} ${ui.buttonSecondary} flex-1`}
                    >
                      清除
                    </button>

                    <button
                      onClick={handleApply}
                      className={`${ui.buttonBase} ${ui.buttonMd} ${ui.buttonPrimary} flex-[1.4]`}
                    >
                      套用篩選
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
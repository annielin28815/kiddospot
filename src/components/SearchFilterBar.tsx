"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { createPortal } from "react-dom";

type FilterOption = {
  id: string;
  name: string;
};

type SearchFilterValue = {
  keyword: string;
  tagIds: string[];
  facilityIds: string[];
};

type SearchFilterBarProps = {
  tags: FilterOption[];
  facilities: FilterOption[];
  value?: SearchFilterValue;
  onApply?: (value: SearchFilterValue) => void;
  onClear?: () => void;
  onOpenChange?: (open: boolean) => void;
};

const defaultValue: SearchFilterValue = {
  keyword: "",
  tagIds: [],
  facilityIds: [],
};

export default function SearchFilterBar({
  tags,
  facilities,
  value = defaultValue,
  onApply,
  onClear,
  onOpenChange,
}: SearchFilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [draftKeyword, setDraftKeyword] = useState(value.keyword ?? "");
  const [draftTagIds, setDraftTagIds] = useState<string[]>(value.tagIds ?? []);
  const [draftFacilityIds, setDraftFacilityIds] = useState<string[]>(
    value.facilityIds ?? []
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setDraftKeyword(value.keyword ?? "");
    setDraftTagIds(value.tagIds ?? []);
    setDraftFacilityIds(value.facilityIds ?? []);
  }, [value]);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
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

  function toggleSelect(id: string, list: string[], setter: (v: string[]) => void) {
    if (list.includes(id)) {
      setter(list.filter((item) => item !== id));
      return;
    }
    setter([...list, id]);
  }

  function handleApply() {
    const nextValue = {
      keyword: draftKeyword.trim(),
      tagIds: draftTagIds,
      facilityIds: draftFacilityIds,
    };

    onApply?.(nextValue);
    closeSheet();
  }

  function handleClearDraft() {
    setDraftKeyword("");
    setDraftTagIds([]);
    setDraftFacilityIds([]);
  }

  function handleClearAll() {
    handleClearDraft();
    onClear?.();
    closeSheet();
  }

  return (
    <>
      {/* top search row */}
      <div className="sticky top-0 z-[900] bg-[var(--background,#fff)]/90 backdrop-blur supports-[backdrop-filter]:bg-[var(--background,#fff)]/75">
        <div className="mx-auto w-full max-w-3xl px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openSheet}
              className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-full border border-[var(--color-line,#EADBC8)] bg-white px-4 text-left shadow-sm transition hover:shadow-md"
            >
              <Search className="h-4 w-4 shrink-0 text-[var(--color-softInk,#6B5B52)]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--color-ink,#3A2E2A)]">
                  {value.keyword?.trim() ? value.keyword : "搜尋地點、地址、描述"}
                </p>
                <p className="truncate text-xs text-[var(--color-softInk,#6B5B52)]">
                  {activeCount > 0
                    ? `${value.tagIds.length} 個分類・${value.facilityIds.length} 個設施`
                    : "可篩選分類與設施"}
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={openSheet}
              className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-line,#EADBC8)] bg-[var(--color-sand,#F6EBDD)] text-[var(--color-ink,#3A2E2A)] shadow-sm transition hover:shadow-md cursor-pointer"
              aria-label="Open search filters"
            >
              <SlidersHorizontal className="h-5 w-5" />
              {activeCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-peach,#F4A261)] px-1 text-[10px] font-semibold text-white">
                  {activeCount}
                </span>
              )}
            </button>
          </div>

          {(value.keyword || value.tagIds.length > 0 || value.facilityIds.length > 0) && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {value.keyword?.trim() && (
                <span className="inline-flex items-center rounded-full bg-[var(--color-cream,#FDF3ED)] px-3 py-1 text-xs font-medium text-[var(--color-ink,#3A2E2A)]">
                  關鍵字：{value.keyword}
                </span>
              )}

              {value.tagIds.length > 0 && (
                <span className="inline-flex items-center rounded-full bg-[var(--color-lavender,#B8A1E3)]/15 px-3 py-1 text-xs font-medium text-[var(--color-ink,#3A2E2A)]">
                  分類 {value.tagIds.length}
                </span>
              )}

              {value.facilityIds.length > 0 && (
                <span className="inline-flex items-center rounded-full bg-[var(--color-mint,#8CBF9F)]/15 px-3 py-1 text-xs font-medium text-[var(--color-ink,#3A2E2A)]">
                  設施 {value.facilityIds.length}
                </span>
              )}

              <button
                type="button"
                onClick={handleClearAll}
                className="ml-1 text-xs font-medium text-[var(--color-softInk,#6B5B52)] underline underline-offset-4 cursor-pointer"
              >
                清除全部
              </button>
            </div>
          )}
        </div>
      </div>

      {/* modal / bottom sheet */}
      {mounted &&
        isOpen &&
        createPortal(
        <div className="fixed inset-0 z-[1200]">
          <button
            type="button"
            aria-label="Close overlay"
            className="absolute inset-0 bg-black/30"
            onClick={closeSheet}
          />

          <div className="absolute inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center md:p-6">
            <div className="relative max-h-[88vh] w-full overflow-hidden rounded-t-[2rem] bg-white shadow-2xl md:max-h-[85vh] md:max-w-2xl md:rounded-[2rem]">
              {/* handle for mobile */}
              <div className="flex justify-center pt-3 md:hidden">
                <div className="h-1.5 w-14 rounded-full bg-neutral-200" />
              </div>

              {/* header */}
              <div className="flex items-center justify-between px-5 pt-4 pb-3 md:px-6 md:pt-5">
                <div>
                  <h2 className="text-xl font-bold text-[var(--color-ink,#3A2E2A)] md:text-2xl">
                    Search Filter
                  </h2>
                  <p className="mt-1 text-sm text-[var(--color-softInk,#6B5B52)]">
                    用關鍵字、分類與設施快速找到合適地點
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeSheet}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-line,#EADBC8)] bg-white text-[var(--color-softInk,#6B5B52)] transition hover:bg-[var(--color-sand,#F6EBDD)]"
                  aria-label="Close search filter"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* content */}
              <div className="max-h-[calc(88vh-140px)] overflow-y-auto px-5 pb-5 md:max-h-[calc(85vh-150px)] md:px-6 md:pb-6">
                {/* keyword */}
                <section className="mb-6">
                  <label
                    htmlFor="search-keyword"
                    className="mb-2 block text-sm font-semibold text-[var(--color-ink,#3A2E2A)]"
                  >
                    關鍵字
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-line,#EADBC8)] bg-[var(--color-cream,#FDF3ED)] px-4 py-3">
                    <Search className="h-4 w-4 shrink-0 text-[var(--color-softInk,#6B5B52)]" />
                    <input
                      id="search-keyword"
                      type="text"
                      value={draftKeyword}
                      onChange={(e) => setDraftKeyword(e.target.value)}
                      placeholder="例如：親子餐廳、台中、尿布台"
                      className="w-full bg-transparent text-sm text-[var(--color-ink,#3A2E2A)] outline-none placeholder:text-[var(--color-softInk,#6B5B52)]"
                    />
                  </div>
                </section>

                {/* tags */}
                <section className="mb-6">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[var(--color-ink,#3A2E2A)]">
                      分類
                    </h3>
                    <span className="text-xs text-[var(--color-softInk,#6B5B52)]">
                      可複選
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {tags.map((tag) => {
                      const selected = draftTagIds.includes(tag.id);

                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() =>
                            toggleSelect(tag.id, draftTagIds, setDraftTagIds)
                          }
                          className={[
                            "rounded-full border px-4 py-2 text-sm font-medium transition",
                            selected
                              ? "border-[var(--color-peach,#F4A261)] bg-[var(--color-peach,#F4A261)]/12 text-[var(--color-ink,#3A2E2A)]"
                              : "border-[var(--color-line,#EADBC8)] bg-white text-[var(--color-softInk,#6B5B52)] hover:bg-[var(--color-cream,#FDF3ED)]",
                          ].join(" ")}
                        >
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* facilities */}
                <section className="mb-2">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[var(--color-ink,#3A2E2A)]">
                      設施
                    </h3>
                    <span className="text-xs text-[var(--color-softInk,#6B5B52)]">
                      可複選
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {facilities.map((facility) => {
                      const selected = draftFacilityIds.includes(facility.id);

                      return (
                        <button
                          key={facility.id}
                          type="button"
                          onClick={() =>
                            toggleSelect(
                              facility.id,
                              draftFacilityIds,
                              setDraftFacilityIds
                            )
                          }
                          className={[
                            "rounded-full border px-4 py-2 text-sm font-medium transition",
                            selected
                              ? "border-[var(--color-mint,#8CBF9F)] bg-[var(--color-mint,#8CBF9F)]/15 text-[var(--color-ink,#3A2E2A)]"
                              : "border-[var(--color-line,#EADBC8)] bg-white text-[var(--color-softInk,#6B5B52)] hover:bg-[var(--color-cream,#FDF3ED)]",
                          ].join(" ")}
                        >
                          {facility.name}
                        </button>
                      );
                    })}
                  </div>
                </section>
              </div>

              {/* footer */}
              <div className="border-t border-[var(--color-line,#EADBC8)] bg-white px-5 py-4 md:px-6">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleClearDraft}
                    className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-[var(--color-line,#EADBC8)] bg-white px-4 text-sm font-semibold text-[var(--color-softInk,#6B5B52)] transition hover:bg-[var(--color-sand,#F6EBDD)]"
                  >
                    清除
                  </button>

                  <button
                    type="button"
                    onClick={handleApply}
                    className="inline-flex h-12 flex-[1.4] items-center justify-center rounded-full bg-[var(--color-peach,#F4A261)] px-4 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
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
type ListResultBarProps = {
  isLoading?: boolean;
  totalCount: number;
  visibleCount: number;
  step?: number;
  onLoadMore?: () => void;
  className?: string;
  captionClassName?: string;
  secondaryClassName?: string;
};

export default function ListResultBar({
  isLoading = false,
  totalCount,
  visibleCount,
  step = 20,
  onLoadMore,
  className = "",
  captionClassName = "",
  secondaryClassName = "",
}: ListResultBarProps) {
  const shownCount = Math.min(visibleCount, totalCount);
  const hasMore = shownCount < totalCount;

  const leftText = isLoading
    ? "搜尋中..."
    : totalCount === 0
    ? "共 0 筆結果"
    : `已顯示 1 – ${shownCount} 筆 / 共 ${totalCount} 筆`;

  return (
    <div className={`mt-3 flex items-center justify-between gap-3 ${className}`}>
      <p className={`${captionClassName} ${secondaryClassName}`.trim()}>
        {leftText}
      </p>

      {!isLoading && totalCount > 0 && (
        hasMore ? (
          <button
            type="button"
            onClick={onLoadMore}
            className="shrink-0 text-sm font-medium text-brand-ink transition hover:opacity-70 active:scale-[0.98] dark:text-white"
            aria-label={`顯示更多，目前剩餘 ${totalCount - shownCount} 筆`}
          >
            顯示更多
          </button>
        ) : (
          <span className="shrink-0 text-sm text-brand-softInk/70 dark:text-white/50">
            已全部顯示
          </span>
        )
      )}
    </div>
  );
}
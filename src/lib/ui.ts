export const ui = {
  /* =========================
   * Layout / Section
   * ========================= */
  page: "min-h-screen bg-[var(--color-bg-page)] text-[var(--color-text-primary)]",
  pageContainer: "mx-auto w-full max-w-6xl px-4",
  section: "space-y-2 mt-3",
  sectionTitle: "text-lg font-semibold text-[var(--color-text-primary)]",
  sectionDesc: "text-sm text-[var(--color-text-secondary)]",

  /* =========================
   * Surface / Card / Sheet
   * ========================= */
  surface:
    "bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-[var(--shadow-soft)]",

  cardBase:
    "relative overflow-hidden rounded-2xl border p-4 transition-all duration-250 ease-out",

  cardInteractive:
    "cursor-pointer",

  cardSelected:
    "ring-2 ring-white/60 shadow-[0_8px_24px_rgba(58,46,42,0.10)] dark:ring-white/10",

  cardHover:
    "-translate-y-[2px] shadow-[0_10px_24px_rgba(58,46,42,0.08)]",

  sheetBase:
    "fixed inset-x-0 bottom-0 rounded-t-3xl border-t border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-soft)]",

  sheetContent:
    "max-h-[85vh] overflow-y-auto overscroll-contain px-4 pb-6 pt-3",

  sheetHandleWrap: "flex justify-center pb-3",
  sheetHandle:
    "h-1.5 w-12 rounded-full bg-[var(--color-border)]/90 dark:bg-white/15",

  overlay:
    "fixed inset-0 bg-black/30 backdrop-blur-[1px] dark:bg-black/45",

  modalPanel:
    "rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-soft)]",

  menuPanel:
  "overflow-hidden rounded-[24px] border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-soft)]",

  menuItem:
  "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-[var(--color-text-primary)] transition hover:bg-[var(--color-bg-page)] dark:hover:bg-white/10",

  /* =========================
   * Buttons
   * ========================= */
  buttonBase:
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition disabled:pointer-events-none disabled:opacity-50",

  buttonSm: "h-9 px-3 text-sm",
  buttonMd: "h-10 px-4 text-sm",
  buttonLg: "h-11 px-5 text-[15px]",

  buttonPrimary:
    "bg-[var(--color-text-primary)] text-white hover:opacity-92 dark:bg-[var(--color-text-primary)] dark:text-[#1F1A17]",

  buttonSecondary:
    "border border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] hover:bg-white/70 dark:hover:bg-white/5",

  buttonGhost:
    "bg-white/60 text-[var(--color-text-secondary)] backdrop-blur hover:bg-white dark:bg-white/10 dark:text-[var(--color-text-secondary)] dark:hover:bg-white/15",

  buttonDanger:
    "bg-red-500 text-white hover:opacity-90 dark:bg-red-400 dark:text-[#1F1A17]",

  iconButton:
    "inline-flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-sm transition",

  iconButtonNeutral:
    "border-white/40 bg-white/60 text-[var(--color-text-muted)] hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-[var(--color-text-secondary)] dark:hover:bg-white/20",

  /* =========================
   * Input / Field
   * ========================= */
  inputBase:
    "w-full rounded-2xl border border-[var(--color-border)] bg-white/70 px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-text-secondary)] focus:ring-2 focus:ring-[var(--color-border)] dark:bg-white/10 dark:text-[var(--color-text-primary)] dark:placeholder:text-[var(--color-text-muted)] dark:focus:border-white/15 dark:focus:ring-white/10",

  inputSm:
    "w-full rounded-xl border border-[var(--color-border)] bg-white/70 px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-text-secondary)] focus:ring-2 focus:ring-[var(--color-border)] dark:bg-white/10 dark:text-[var(--color-text-primary)] dark:placeholder:text-[var(--color-text-muted)] dark:focus:border-white/15 dark:focus:ring-white/10",

  textarea:
    "w-full rounded-2xl border border-[var(--color-border)] bg-white/70 px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-text-secondary)] focus:ring-2 focus:ring-[var(--color-border)] dark:bg-white/10 dark:text-[var(--color-text-primary)] dark:placeholder:text-[var(--color-text-muted)] dark:focus:border-white/15 dark:focus:ring-white/10",

  fieldLabel: "mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]",
  fieldHint: "mt-1 text-xs text-[var(--color-text-muted)]",
  fieldError: "mt-1 text-xs text-red-500 dark:text-red-400",

  searchBar:
  "flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2.5 shadow-sm backdrop-blur transition",
  
  /* =========================
   * Typography
   * ========================= */
  title: "text-[15px] font-semibold leading-5",
  titleLg: "text-lg font-semibold leading-6",
  body: "text-sm leading-6",
  bodySm: "text-xs leading-5",
  caption: "text-xs leading-4",
  muted: "text-[var(--color-text-muted)]",
  secondary: "text-[var(--color-text-secondary)]",
  primary: "text-[var(--color-text-primary)]",

  addressIcon: "mt-[2px] h-3.5 w-3.5 shrink-0",

  /* =========================
   * Chip / Badge / Tag
   * ========================= */
  chipBase:
    "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium tracking-[0.01em]",

  chipNeutral:
    "border border-white/40 bg-white/70 text-[var(--color-text-secondary)] dark:border-white/10 dark:bg-white/10 dark:text-[var(--color-text-secondary)]",

  chipSoft:
    "border border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]",

  moreText:
    "inline-flex items-center px-1.5 py-1 text-[11px] text-[var(--color-text-muted)]",

  badgeDot: "h-2 w-2 rounded-full",

  /* =========================
   * Tabs / Pills / Toggle
   * ========================= */
  segmented:
    "inline-flex rounded-full border border-[var(--color-border)] bg-white/70 p-1 shadow-sm backdrop-blur dark:bg-white/10",

  segmentedItem:
    "inline-flex h-9 items-center justify-center rounded-full px-4 text-sm font-medium transition",

  segmentedItemActive:
    "bg-[var(--color-text-primary)] text-white dark:text-[#1F1A17]",

  segmentedItemInactive:
    "text-[var(--color-text-secondary)] hover:bg-white/80 dark:hover:bg-white/10",

  /* =========================
   * List / Divider / Empty
   * ========================= */
  divider: "border-t border-[var(--color-border)]",
  emptyWrap: "flex min-h-[240px] flex-col items-center justify-center px-6 text-center",
  emptyTitle: "mt-3 text-base font-semibold text-[var(--color-text-primary)]",
  emptyText: "mt-1 text-sm text-[var(--color-text-secondary)]",

  /* =========================
   * Utility
   * ========================= */
  srOnly: "sr-only",
};
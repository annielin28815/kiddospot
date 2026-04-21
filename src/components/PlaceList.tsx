import React from "react";
import { MapPin, Heart, ChevronRight } from "lucide-react";
import { Place } from "@/src/types/place";
import { ui } from "@/src/lib/ui";

type CardTheme = {
  bg: string;
  border: string;
  title: string;
  text: string;
  subText: string;
  icon: string;
  chip: string;
  subChip: string;
  moreText: string;
  accent: string;
  accent2: string;
  favorite: {
    active: string;
    inactive: string;
  };
  selected: string;
  hover: string;
};

type DisplayTag =
  | {
      id: string;
      name: string;
    }
  | {
      tagId: string;
      tag: {
        id: string;
        name: string;
      };
    };

type DisplayFacility =
  | {
      id: string;
      name: string;
    }
  | {
      facilityId: string;
      facility: {
        id: string;
        name: string;
      };
    };

type DisplayPlace = Place & {
  sourceType?: "GOV_FAMILY_TOILET" | "GOV_NURSING_ROOM" | "GOV_PARENTING_CENTER";
  sourceLabel?: string;
  tags?: DisplayTag[];
  facilities?: DisplayFacility[];
};

const sharedTheme = {
  title: "text-[#3A2E2A] dark:text-[#F7EEE8]",
  text: "text-[#6B5B52] dark:text-[#CBBDB2]",
  subText: "text-[#8F7B70] dark:text-[#A3958A]",
  icon: "text-[#8F7B70] dark:text-[#CBBDB2]",
  moreText: "text-[#8C7B71] dark:text-[#A3958A]",

  favorite: {
    active:
      "border-[#F4A261]/30 bg-[#F4A261]/15 text-[#F4A261] dark:bg-[#F4A261]/20 dark:border-[#F4A261]/40",
    inactive:
      "border-white/40 bg-white/60 text-[#8F7B70] hover:bg-white dark:bg-white/10 dark:border-white/10 dark:text-[#CBBDB2] dark:hover:bg-white/20",
  },

  selected: "border-[#3A2E2A]/15 dark:border-white/10",
  hover: "border-white/60 dark:border-white/10",
};

function createCardTheme(config: {
  bg: string;
  border: string;
  chip: string;
  subChip: string;
  accent: string;
  accent2: string;
}): CardTheme {
  return {
    ...sharedTheme,
    bg: config.bg,
    border: config.border,
    chip: config.chip,
    subChip: config.subChip,
    accent: config.accent,
    accent2: config.accent2,
  };
}

const cardThemes: CardTheme[] = [
  createCardTheme({
    bg: "bg-[#FFF1E7] dark:bg-[rgba(244,162,97,0.12)]",
    border: "border-[#F4D7BE] dark:border-[rgba(244,162,97,0.25)]",
    chip: "bg-white/75 text-[#8A4B00] border border-white/50 dark:bg-white/10 dark:text-[#F4A261] dark:border-white/10",
    subChip:
      "bg-[#F9E4D2] text-[#6B3A00] border border-white/30 dark:bg-[rgba(244,162,97,0.15)] dark:text-[#F4A261] dark:border-transparent",
    accent: "bg-[#F4A261]/18 dark:bg-[#F4A261]/12",
    accent2: "bg-[#F4A261]/10 dark:bg-[#F4A261]/6",
  }),

  createCardTheme({
    bg: "bg-[#F4EEFF] dark:bg-[rgba(184,161,227,0.12)]",
    border: "border-[#D9C9F3] dark:border-[rgba(184,161,227,0.25)]",
    chip: "bg-white/75 text-[#5F4B8B] border border-white/50 dark:bg-white/10 dark:text-[#B8A1E3] dark:border-white/10",
    subChip:
      "bg-[#E9DFFD] text-[#5B4A84] border border-white/30 dark:bg-[rgba(184,161,227,0.15)] dark:text-[#B8A1E3] dark:border-transparent",
    accent: "bg-[#B8A1E3]/18 dark:bg-[#B8A1E3]/12",
    accent2: "bg-[#B8A1E3]/10 dark:bg-[#B8A1E3]/6",
  }),

  createCardTheme({
    bg: "bg-[#EEF8F1] dark:bg-[rgba(140,191,159,0.12)]",
    border: "border-[#CFE6D7] dark:border-[rgba(140,191,159,0.25)]",
    chip: "bg-white/75 text-[#456A54] border border-white/50 dark:bg-white/10 dark:text-[#8CBF9F] dark:border-white/10",
    subChip:
      "bg-[#DDEFE4] text-[#3F624E] border border-white/30 dark:bg-[rgba(140,191,159,0.15)] dark:text-[#8CBF9F] dark:border-transparent",
    accent: "bg-[#8CBF9F]/18 dark:bg-[#8CBF9F]/12",
    accent2: "bg-[#8CBF9F]/10 dark:bg-[#8CBF9F]/6",
  }),

  createCardTheme({
    bg: "bg-[#EEF6FD] dark:bg-[rgba(127,167,201,0.12)]",
    border: "border-[#D3E4F3] dark:border-[rgba(127,167,201,0.25)]",
    chip: "bg-white/75 text-[#46627D] border border-white/50 dark:bg-white/10 dark:text-[#7FA7C9] dark:border-white/10",
    subChip:
      "bg-[#DDECF8] text-[#415C75] border border-white/30 dark:bg-[rgba(127,167,201,0.15)] dark:text-[#7FA7C9] dark:border-transparent",
    accent: "bg-[#7FA7C9]/18 dark:bg-[#7FA7C9]/12",
    accent2: "bg-[#7FA7C9]/10 dark:bg-[#7FA7C9]/6",
  }),
];

const getCardTheme = (index: number) => cardThemes[index % cardThemes.length];

function getTagKey(tag: DisplayTag) {
  return "tagId" in tag ? tag.tagId : tag.id;
}

function getTagName(tag: DisplayTag) {
  return "tag" in tag ? tag.tag.name : tag.name;
}

function getFacilityKey(facility: DisplayFacility) {
  return "facilityId" in facility ? facility.facilityId : facility.id;
}

function getFacilityName(facility: DisplayFacility) {
  return "facility" in facility ? facility.facility.name : facility.name;
}

function isExternalPlace(place: DisplayPlace) {
  return !!place.sourceType;
}

type PlaceListProps = {
  places: DisplayPlace[];
  selectedPlaceId: string | null;
  hoveredPlaceId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  itemRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  userId: string;
  onToggleFavorite: (placeId: string) => void;
};

export default function PlaceList({
  places,
  selectedPlaceId,
  hoveredPlaceId,
  onSelect,
  onHover,
  itemRefs,
  userId,
  onToggleFavorite,
}: PlaceListProps) {
  return (
    <div className="h-full overflow-y-auto p-4">
      <div className={ui.section}>
        {places.map((place, index) => {
          const theme = getCardTheme(index);
          const isSelected = selectedPlaceId === place.id;
          const isHovered = hoveredPlaceId === place.id;
          const isFavorited =
            !!userId &&
            (place.favorites?.some((f) => f.userId === userId) ?? false);

          return (
            <div
              key={place.id}
              ref={(el) => {
                itemRefs.current[place.id] = el;
              }}
              onClick={() => onSelect(place.id)}
              onMouseEnter={() => onHover(place.id)}
              onMouseLeave={() => onHover(null)}
              className={[
                ui.cardBase,
                ui.cardInteractive,
                theme.bg,
                theme.border,
                isSelected
                  ? `${theme.selected} ${ui.cardSelected} scale-[1.01]`
                  : "shadow-sm",
                isHovered && !isSelected
                  ? `${theme.hover} ${ui.cardHover}`
                  : "",
              ].join(" ")}
            >
              {/* 背景裝飾 */}
              <div
                className={`absolute -bottom-10 -right-10 h-28 w-28 rounded-full ${theme.accent}`}
              />
              <div
                className={`absolute -bottom-4 -right-4 h-16 w-16 rounded-full ${theme.accent2}`}
              />

              {/* 收藏 */}
              {!isExternalPlace(place) && (
                <div className="absolute right-3 top-3 z-20">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(place.id);
                    }}
                    className={[
                      ui.iconButton,
                      ui.iconButtonNeutral,
                      isFavorited
                        ? theme.favorite.active
                        : theme.favorite.inactive,
                    ].join(" ")}
                  >
                    <Heart
                      size={16}
                      className={isFavorited ? "fill-current" : ""}
                    />
                  </button>
                </div>
              )}

              {/* 主內容 */}
              <div className="relative z-10 pr-16">
                <div className={ui.section}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`${ui.title} ${theme.title}`}>
                          {place.name}
                        </h3>
                        <ChevronRight size={16} className={theme.icon} />
                      </div>

                      {place.sourceLabel && (
                        <div className="mt-1">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${theme.subChip}`}
                          >
                            {place.sourceLabel}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p
                    className={`flex items-start gap-1.5 ${ui.bodySm} ${theme.text}`}
                  >
                    <MapPin
                      className={`${ui.addressIcon} ${theme.subText}`}
                    />
                    <span className="line-clamp-2">
                      {place.address}
                    </span>
                  </p>

                  {place.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {place.tags.slice(0, 3).map((tag) => (
                        <span
                          key={getTagKey(tag)}
                          className={`${ui.chipBase} ${theme.chip}`}
                        >
                          {getTagName(tag)}
                        </span>
                      ))}
                      {place.tags.length > 3 && (
                        <span className={`${ui.moreText} ${theme.moreText}`}>
                          +{place.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {place.facilities?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {place.facilities.slice(0, 3).map((facility) => (
                        <span
                          key={getFacilityKey(facility)}
                          className={`${ui.chipBase} ${theme.subChip}`}
                        >
                          {getFacilityName(facility)}
                        </span>
                      ))}
                      {place.facilities.length > 3 && (
                        <span className={`${ui.moreText} ${theme.moreText}`}>
                          +{place.facilities.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
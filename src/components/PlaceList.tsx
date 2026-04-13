import { MapPin, Heart, ChevronRight  } from "lucide-react";
import { Place } from "@/src/types/place";

const cardThemes = [
  {
    bg: "bg-[#FFF1E7]",
    border: "border-[#F4D7BE]",
    chip: "bg-white/75 text-[#8A4B00] border border-white/50",
    subChip: "bg-[#F9E4D2] text-[#6B3A00] border border-white/30",
    accent: "bg-[#F4A261]/18",
    accent2: "bg-[#F4A261]/10",
  },
  {
    bg: "bg-[#F4EEFF]",
    border: "border-[#D9C9F3]",
    chip: "bg-white/75 text-[#5F4B8B] border border-white/50",
    subChip: "bg-[#E9DFFD] text-[#5B4A84] border border-white/30",
    accent: "bg-[#B8A1E3]/18",
    accent2: "bg-[#B8A1E3]/10",
  },
  {
    bg: "bg-[#EEF8F1]",
    border: "border-[#CFE6D7]",
    chip: "bg-white/75 text-[#456A54] border border-white/50",
    subChip: "bg-[#DDEFE4] text-[#3F624E] border border-white/30",
    accent: "bg-[#8CBF9F]/18",
    accent2: "bg-[#8CBF9F]/10",
  },
  {
    bg: "bg-[#EEF6FD]",
    border: "border-[#D3E4F3]",
    chip: "bg-white/75 text-[#46627D] border border-white/50",
    subChip: "bg-[#DDECF8] text-[#415C75] border border-white/30",
    accent: "bg-[#7FA7C9]/18",
    accent2: "bg-[#7FA7C9]/10",
  },
];

const getCardTheme = (index: number) => cardThemes[index % cardThemes.length];

type PlaceListProps = {
  places: Place[];
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
    <div className="h-full space-y-4 overflow-y-auto p-4">
      {places.map((place, index) => {
        const theme = getCardTheme(index);
        const isSelected = selectedPlaceId === place.id;
        const isHovered = hoveredPlaceId === place.id;
        const isFavorited =
          !!userId && (place.favorites?.some((f) => f.userId === userId) ?? false);

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
              "relative cursor-pointer overflow-hidden rounded-2xl border p-4 shadow-sm transition-all duration-250 ease-out cursor-pointer",
              theme.bg,
              theme.border,
              isSelected
                ? "border-[#3A2E2A]/15 ring-2 ring-white/60 shadow-[0_8px_24px_rgba(58,46,42,0.10)] scale-[1.01]"
                : "border-transparent shadow-sm",
              isHovered && !isSelected
                ? "-translate-y-[2px] border-white/60 shadow-[0_10px_24px_rgba(58,46,42,0.08)]"
                : "",
            ].join(" ")}
          >
            <div
              className={`absolute -bottom-10 -right-10 h-28 w-28 rounded-full ${theme.accent}`}
            />
            <div
              className={`absolute -bottom-4 -right-4 h-16 w-16 rounded-full ${theme.accent2}`}
            />

            {/* 右上角收藏 */}
            <div className="absolute right-3 top-3 z-20">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(place.id);
                }}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-sm transition cursor-pointer ${
                  isFavorited
                    ? "border-[#F4A261]/30 bg-[#F4A261]/15 text-[#F4A261]"
                    : "border-white/40 bg-white/60 text-[#8F7B70] hover:bg-white"
                }`}
                aria-label={isFavorited ? "Remove favorite" : "Add favorite"}
              >
                <Heart
                  size={16}
                  className={isFavorited ? "fill-current" : ""}
                />
              </button>
            </div>

            {/* 主內容 */}
            <div className="relative z-10 pr-16">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-[15px] font-semibold leading-5 text-[#3A2E2A]">
                    {place.name}
                  </h3>
                  <ChevronRight size={16} />
                </div>

                <p className="flex items-start gap-1.5 text-xs leading-5 text-[#6B5B52]">
                  <MapPin className="mt-[2px] h-3.5 w-3.5 shrink-0 text-[#8F7B70]" />
                  <span className="line-clamp-2">{place.address}</span>
                </p>

                {place.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {place.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag.tagId}
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium tracking-[0.01em] ${theme.chip}`}
                      >
                        {tag.tag.name}
                      </span>
                    ))}
                    {place.tags.length > 3 && (
                      <span className="inline-flex items-center px-1.5 py-1 text-[11px] text-[#8C7B71]">
                        +{place.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {place.facilities?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {place.facilities.slice(0, 3).map((facility) => (
                      <span
                        key={facility.facilityId}
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium tracking-[0.01em] ${theme.subChip}`}
                      >
                        {facility.facility.name}
                      </span>
                    ))}
                    {place.facilities.length > 3 && (
                      <span className="inline-flex items-center px-1.5 py-1 text-[11px] text-[#8C7B71]">
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
  );
}
import { percentage } from "../../utils/stats";
import { SagaHeader } from "./SagaHeader";
import { SectionCard } from "./SectionCard";
import { PosterCard } from "./PosterCard";

/**
 * A saga (or Expanded Universe category): header with progress, then phase cards or posters.
 * `section` comes from sagaSections / categorySections (utils/sections.js); its stats cover
 * the whole section even when the "Not Finished" filter hides some cards.
 */
export function SagaSection({
  section,
  expandedSections,
  onToggleSection,
  watched,
  onToggleItem,
  onSelectItem,
}) {
  const { key, title, subtitle, color, cards, isCategory, stats } = section;
  const expanded = !!expandedSections[key];

  return (
    <div className="mb-5">
      <SagaHeader
        title={title}
        subtitle={subtitle}
        color={color}
        percentage={percentage(stats.minutesDone, stats.minutes)}
        expanded={expanded}
        onToggle={() => onToggleSection(key)}
      />

      {/* Categories: posters directly, no per-phase card header */}
      {isCategory && expanded && cards.length > 0 && (
        <div
          className="bg-slate-800 border border-slate-700 border-t-0 rounded-b-xl overflow-visible"
          style={{ padding: "0.75rem 0.625rem" }}
        >
          <div className="mcu-scroll-row flex overflow-x-auto gap-2.5 -mx-1.5 px-1.5">
            {cards[0].items.map((item) => (
              <div key={item.id} style={{ padding: "0.5rem 0" }}>
                <PosterCard
                  item={item}
                  color={color}
                  watched={watched}
                  onToggleItem={() => onToggleItem(item)}
                  onSelectItem={onSelectItem}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phases: one card each, with its own header */}
      {!isCategory &&
        expanded &&
        cards.map((card) => (
          <SectionCard
            key={card.key}
            label={card.label}
            color={color}
            items={card.items}
            stats={card.stats}
            watched={watched}
            expanded={!!expandedSections[card.key]}
            onToggleExpand={() => onToggleSection(card.key)}
            onToggleItem={onToggleItem}
            onSelectItem={onSelectItem}
          />
        ))}
    </div>
  );
}

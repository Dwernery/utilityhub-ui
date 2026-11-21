import { combineStats, percentage } from "../../utils/stats";
import { SagaHeader } from "./SagaHeader";
import { SectionCard } from "./SectionCard";
import { PosterCard } from "./PosterCard";

export function SagaSection({
  sagaKey,
  title,
  subtitle,
  color,
  cards,
  expandedSections,
  onToggleSection,
  watched,
  onToggleItem,
  onSelectItem,
  isCategory = false,
}) {
  // Determine if this saga section should be expanded by checking sagaKey in expandedSections
  const expanded = !!expandedSections[sagaKey];
  const stats = combineStats(cards.map((card) => card.stats));
  const pct = percentage(stats.minutesDone, stats.minutes);

  return (
    <div className="mb-5">
      <SagaHeader
        title={title}
        subtitle={subtitle}
        color={color}
        percentage={pct}
        expanded={expanded}
        onToggle={() => onToggleSection(sagaKey)}
      />

      {/* For categories: render poster cards directly, no intermediate SectionCard header */}
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

      {/* For phases: render section cards with individual headers */}
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

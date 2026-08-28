import { combineStats, percentage } from "../../utils/stats";
import { SagaHeader } from "./SagaHeader";
import { SectionCard } from "./SectionCard";

export function SagaSection({
  sagaKey,
  title,
  subtitle,
  color,
  cards,
  expandedSections,
  onToggleSection,
  watched,
  onOpenEpisodes,
  onToggleItem,
}) {
  const expanded = !!expandedSections[sagaKey];
  const stats = combineStats(cards.map((card) => card.stats));
  const pct = percentage(stats.done, stats.total);

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

      {expanded &&
        cards.map((card) => (
          <SectionCard
            key={card.key}
            label={card.label}
            color={card.color}
            items={card.items}
            stats={card.stats}
            watched={watched}
            expanded={!!expandedSections[card.key]}
            onToggleExpand={() => onToggleSection(card.key)}
            onOpenEpisodes={(item) => onOpenEpisodes(item, card.color)}
            onToggleItem={onToggleItem}
          />
        ))}
    </div>
  );
}

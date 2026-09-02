import PropTypes from "prop-types";
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
  onToggleItem,
  onSelectItem,
}) {
  // Determine if this saga section should be expanded by checking sagaKey in expandedSections
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

      {/* Only render section cards when saga section is expanded */}
      {expanded &&
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

SagaSection.propTypes = {
  sagaKey: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  color: PropTypes.string,
  cards: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      items: PropTypes.array.isRequired,
      stats: PropTypes.object,
    }),
  ).isRequired,
  expandedSections: PropTypes.object.isRequired,
  onToggleSection: PropTypes.func,
  watched: PropTypes.object,
  onToggleItem: PropTypes.func,
  onSelectItem: PropTypes.func,
};

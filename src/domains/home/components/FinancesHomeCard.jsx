import { UtilityCard } from "./UtilityCard";
import { DollarSign } from "lucide-react";

export function FinancesHomeCard() {
  return (
    <UtilityCard icon={DollarSign} title="Finances" to="/finances/dashboard">
      <h2>Finances</h2>
    </UtilityCard>
  );
}

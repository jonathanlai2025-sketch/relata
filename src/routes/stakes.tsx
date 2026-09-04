import { createFileRoute } from "@tanstack/react-router";
import { Chrome } from "@/components/chrome";
import { StakesView } from "@/components/stakes-view";

export const Route = createFileRoute("/stakes")({ component: StakesPage });

function StakesPage() {
  return (
    <Chrome>
      <StakesView />
    </Chrome>
  );
}

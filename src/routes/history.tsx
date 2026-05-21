import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/layout/AppShell";

export const Route = createFileRoute("/history")({
  component: () => <PagePlaceholder title="Patient History" subtitle="Longitudinal Records" />,
});

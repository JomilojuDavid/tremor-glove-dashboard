import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/layout/AppShell";

export const Route = createFileRoute("/ai")({
  component: () => <PagePlaceholder title="AI Analysis Workbench" subtitle="Model Insights" />,
});

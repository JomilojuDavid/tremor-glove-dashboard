import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/layout/AppShell";

export const Route = createFileRoute("/reports")({
  component: () => <PagePlaceholder title="Clinical Reports" subtitle="Exports & Summaries" />,
});

import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/layout/AppShell";

export const Route = createFileRoute("/settings")({
  component: () => <PagePlaceholder title="Settings" subtitle="System Preferences" />,
});

import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/layout/AppShell";

export const Route = createFileRoute("/device")({
  component: () => <PagePlaceholder title="About Device" subtitle="NS-AX-2041 Hardware" />,
});

import { PageGateway } from "@/features/app-router/page-gateway";

type GatewayPageProps = {
  params: Promise<{
    segments?: string[];
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function GatewayPage({
  params,
  searchParams,
}: GatewayPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <PageGateway
      segments={resolvedParams.segments ?? []}
      searchParams={resolvedSearchParams}
    />
  );
}
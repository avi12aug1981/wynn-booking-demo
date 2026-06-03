import ReservationManagePanel from "@/features/reservations/components/ReservationManagePanel";
import ReservationPageHero from "@/features/reservations/components/ReservationPageHero";
import type { PageRouteContext } from "@/features/app-router/route-types";

type ReservationDetailsPageProps = PageRouteContext;

function getSingleQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function ReservationDetailsPage({
  routeParams,
  searchParams,
}: ReservationDetailsPageProps) {
  const { referenceNumber } = routeParams;
  const action = getSingleQueryValue(searchParams.action);

  return (
    <main className="min-h-screen bg-[#f7f4ef]">
      <ReservationPageHero />

      <ReservationManagePanel
        referenceNumber={referenceNumber}
        action={action}
      />
    </main>
  );
}

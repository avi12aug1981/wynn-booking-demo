import ReservationManagePanel from "@/features/reservations/components/ReservationManagePanel";
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

  const isModify = action === "modify";
  const isCancel = action === "cancel";

  return (
    <main className="min-h-screen bg-[#f7f4ef]">
      <section className="bg-[#3a2418] text-white">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <p className="uppercase tracking-[0.35em] text-[#c9b38c] text-xs">
            Reservation Management
          </p>

          <h1 className="font-serif text-4xl mt-4">
            {isModify
              ? "Modify Reservation"
              : isCancel
                ? "Cancel Reservation"
                : "Reservation Details"}
          </h1>

          <p className="text-stone-200 mt-3 max-w-2xl">
            Reference Number: {referenceNumber}
          </p>
        </div>
      </section>

      <ReservationManagePanel
        referenceNumber={referenceNumber}
        action={action}
      />
    </main>
  );
}

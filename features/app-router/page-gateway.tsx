import { notFound } from "next/navigation";
import type { PageRouteContext, RegisteredPageRoute } from "./route-types";
import { createPageRouteRegistry } from "./page-route-registry";
import RoomsSearchPage from "@/features/rooms/pages/RoomsSearchPage";
import RoomDetailsPage from "@/features/rooms/pages/RoomDetailsPage";
import BookingPage from "@/features/booking/pages/BookingPage";
import ConfirmationPage from "@/features/confirmation/pages/ConfirmationPage";

const pageRoutes: RegisteredPageRoute[] = [
  {
    pattern: "/",
    handler: (context) => <RoomsSearchPage {...context} />,
  },
  {
    pattern: "/rooms/:roomId",
    handler: (context) => <RoomDetailsPage {...context} />,
  },
  {
    pattern: "/booking/:token",
    handler: (context) => <BookingPage {...context} />,
  },
  {
    pattern: "/confirmation/:referenceNumber",
    handler: (context) => <ConfirmationPage {...context} />,
  },
];

/**
 * Single page gateway for application routes.
 *
 * The framework owns only the gateway entry point. Feature modules own
 * their actual pages and register route patterns with this gateway.
 */
export async function PageGateway({
  segments,
  searchParams,
}: {
  segments: string[];
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const registry = createPageRouteRegistry(pageRoutes);

  const match = registry.resolve({
    segments,
    routeParams: {},
    searchParams,
  });

  if (!match) {
    notFound();
  }

  const routeContext: PageRouteContext = {
    segments,
    routeParams: match.routeParams,
    searchParams,
  };

  return match.handler(routeContext);
}
import { notFound } from "next/navigation";
import type { PageRouteContext, RegisteredPageRoute } from "./route-types";
import { createPageRouteRegistry } from "./page-route-registry";
import RoomsSearchPage from "@/features/rooms/pages/RoomsSearchPage";
import RoomDetailsPage from "@/features/rooms/pages/RoomDetailsPage";
import RoomDetailsWithoutTokenPage from "@/features/rooms/pages/RoomDetailsWithoutTokenPage";
import BookingPage from "@/features/booking/pages/BookingPage";
import ConfirmationPage from "@/features/confirmation/pages/ConfirmationPage";
import LoginPage from "@/features/auth/pages/LoginPage";
import ReservationHistoryPage from "@/features/reservations/pages/ReservationHistoryPage";
import ReservationDetailsPage from "@/features/reservations/pages/ReservationDetailsPage";


/**
 * Page routes for the application.
 *
 * Each route is defined with a pattern and a handler function.
 * The handler function is responsible for rendering the page component.
 */
const pageRoutes: RegisteredPageRoute[] = [
  {
    pattern: "/",
    handler: (context) => <LoginPage searchParams={context.searchParams} />,
  },
  {
    pattern: "/login",
    handler: (context) => <LoginPage searchParams={context.searchParams} />,
  },
  {
    pattern: "/search",
    handler: (context) => <RoomsSearchPage {...context} />,
  },
  {
    pattern: "/rooms/:roomId/:token",
    handler: (context) => <RoomDetailsPage {...context} />,
  },
  {
    pattern: "/rooms/:roomId",
    handler: (context) => <RoomDetailsWithoutTokenPage {...context} />,
  },
  {
    pattern: "/booking/:token",
    handler: (context) => <BookingPage {...context} />,
  },
  {
    pattern: "/confirmation/:referenceNumber",
    handler: (context) => <ConfirmationPage {...context} />,
  },
  {
    pattern: "/reservations",
    handler: () => <ReservationHistoryPage />,
  },
  {
    pattern: "/reservations/:referenceNumber",
    handler: (context) => <ReservationDetailsPage {...context} />,
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
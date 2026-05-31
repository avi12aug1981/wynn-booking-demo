"use client";

export default function PrintReservationButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="w-full border border-[#3a2418] text-[#3a2418] px-5 py-3 rounded-sm uppercase tracking-widest text-sm font-semibold hover:bg-[#f7f4ef]"
    >
      Print Reservation
    </button>
  );
}
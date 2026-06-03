"use client";

const PRINT_TARGET_ID = "reservation-confirmation";

export default function PrintReservationButton() {
  return (
    <a
      href={`#${PRINT_TARGET_ID}`}
      onClick={(event) => {
        event.preventDefault();
        window.print();
      }}
      className="block w-full text-center border border-[#3a2418] text-[#3a2418] px-5 py-3 rounded-sm uppercase tracking-widest text-sm font-semibold hover:bg-[#f7f4ef] print:hidden"
    >
      Print Reservation
    </a>
  );
}

export { PRINT_TARGET_ID };

type ReservationPageHeroProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  printSafe?: boolean;
};

export default function ReservationPageHero({
  eyebrow = "Reservation Confirmed",
  title = "Thank You For Your Reservation",
  subtitle = "Your stay has been successfully reserved.",
  printSafe = false,
}: ReservationPageHeroProps) {
  return (
    <section
      className={
        printSafe
          ? "bg-[#3a2418] text-white print:bg-white print:text-[#3a2418]"
          : "bg-[#3a2418] text-white"
      }
    >
      <div className="max-w-6xl mx-auto px-6 py-8">
        <p className="uppercase tracking-[0.35em] text-[#c9b38c] text-xs">
          {eyebrow}
        </p>

        <h1 className="font-serif text-4xl mt-3">{title}</h1>

        <p className="text-stone-200 mt-2 max-w-2xl">{subtitle}</p>
      </div>
    </section>
  );
}

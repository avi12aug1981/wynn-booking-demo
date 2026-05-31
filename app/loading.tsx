export default function Loading() {
    return (
      <main className="min-h-screen bg-[#f7f4ef] flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 rounded-full border-4 border-[#c9b38c] border-t-[#3a2418] animate-spin" />
  
          <p className="mt-5 uppercase tracking-[0.35em] text-sm text-[#8c6b43]">
            Preparing your stay
          </p>
  
          <h2 className="font-serif text-3xl mt-2 text-[#3a2418]">
            Wynn Resort Booking
          </h2>
        </div>
      </main>
    );
  }
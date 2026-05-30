type BookingPageProps = {
    searchParams: Promise<{
      roomId?: string;
    }>;
  };
  
  export default async function BookingPage({
    searchParams,
  }: BookingPageProps) {
    const params = await searchParams;
  
    return (
      <main className="min-h-screen bg-[#f7f4ef]">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <h1 className="font-serif text-5xl mb-3">
            Complete Your Reservation
          </h1>
  
          <p className="text-gray-600">
            Selected Room ID: {params.roomId}
          </p>
        </div>
      </main>
    );
  }
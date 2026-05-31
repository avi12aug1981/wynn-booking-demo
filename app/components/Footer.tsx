export default function Footer() {
    return (
      <footer className="bg-[#3a2418] text-stone-200 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-serif text-2xl text-white">
              Wynn Booking Demo
            </h3>
            <p className="text-sm mt-3 text-stone-300">
              Luxury hotel reservation proof of concept with secure booking
              sessions, availability validation, and simulated checkout.
            </p>
          </div>
  
          <div>
            <h4 className="uppercase tracking-[0.25em] text-[#c9b38c] text-xs">
              Reservation
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>Search Rooms</li>
              <li>Room Details</li>
              <li>Secure Checkout</li>
              <li>Booking Confirmation</li>
            </ul>
          </div>
  
          <div>
            <h4 className="uppercase tracking-[0.25em] text-[#c9b38c] text-xs">
              Policies
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>Check-in: 3:00 PM</li>
              <li>Check-out: 11:00 AM</li>
              <li>Photo ID required at check-in</li>
              <li>Payment is simulated for demo only</li>
            </ul>
          </div>
        </div>
  
        <div className="border-t border-stone-700">
          <div className="max-w-6xl mx-auto px-6 py-4 text-xs text-stone-400 flex flex-col md:flex-row justify-between gap-2">
            <span>
              © 2026 Wynn Booking Demo. Built for technical demonstration.
            </span>
            <span>
              Privacy · Terms · Accessibility
            </span>
          </div>
        </div>
      </footer>
    );
  }
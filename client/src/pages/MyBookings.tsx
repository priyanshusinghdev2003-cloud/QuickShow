import BlurCircle from "@/components/BlurCircle";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import { dateFormat } from "@/lib/DateFormat";
import timeFormat from "@/lib/timeFormat";
import type { Booking } from "@/types/assets";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

function MyBookings() {
  const currency = import.meta.env.VITE_CURRENCY as string;
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { baseImgUrl, user, axios, getToken } = useAppContext();

  const fetchMyBookings = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/user/bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (data.success) {
        setBookings(data.bookings);
      }
      setLoading(false);
    } catch (error) {
      toast.error("Failed to fetch bookings");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchMyBookings();
  }, [user]);

  return !loading ? (
    bookings.length > 0 ? (
      <div className="relative px-6 md:px-16 lg:px-40 pt-30 md:pb-40 min-h-[80vh]">
        <BlurCircle top="100px" left="100px" />
        <div>
          <BlurCircle bottom="0px" left="600px" />
        </div>
        <h1 className="text-lg font-semibold mb-4">My Bookings</h1>
        {bookings.map((booking, idx) => (
          <div
            key={idx}
            className="flex flex-col md:flex-row justify-between bg-primary/8 border border-primary/20 rounded-lg mt-4 p-2 max-w-3xl"
          >
            <div className="flex flex-col md:flex-row">
              <img
                src={`${baseImgUrl}${booking.show.movie.poster_path}`}
                alt=""
                className="md:max-w-45 aspect-video h-auto object-cover object-bottom rounded"
              />
              <div className="flex flex-col p-4">
                <p className="text-lg font-semibold">
                  {booking.show.movie.title}
                </p>
                <p className="text-sm text-gray-400">
                  {timeFormat(booking.show.movie.runtime)}
                </p>
                <p className="text-gray-400 mt-auto text-sm">
                  {dateFormat(booking.show.showDateTime)}
                </p>
              </div>
            </div>
            <div className="flex flex-col md:items-end md:text-right justify-between p-4">
              <div className="flex items-center gap-4">
                <p className="text-2xl font-semibold mb-3">
                  {currency}
                  {booking.amount}
                </p>
                {!booking.isPaid && (
                  <Link
                    to={booking.paymentLink!}
                    className="bg-primary text-sm px-4 py-1.5 mb-3 font-medium cursor-pointer rounded-full"
                  >
                    Pay Now
                  </Link>
                )}
              </div>
              <div className="text-sm">
                <p>
                  <span className="text-gray-400">Total Tickets: </span>{" "}
                  {booking.bookedSeats.length}
                </p>
                <p>
                  <span className="text-gray-400">Seat Number: </span>{" "}
                  {booking.bookedSeats.join(", ")}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center h-screen">
        <BlurCircle top="150px" left="0px" />
        <BlurCircle bottom="50px" right="50px" />
        <h1 className="text-3xl font-bold text-center">
          No Bookings Available{" "}
        </h1>
      </div>
    )
  ) : (
    <Loading />
  );
}

export default MyBookings;

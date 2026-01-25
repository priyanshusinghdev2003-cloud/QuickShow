import Title from "@/components/admin/Title";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import { dateFormat } from "@/lib/DateFormat";
import type { Booking } from "@/types/assets";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const ListBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY as string;
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { axios, getToken, user } = useAppContext();

  const getAllBookings = async () => {
    try {
      const { data } = await axios.get("/api/admin/all-bookings", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
      if (data.success) {
        setBookings(data.bookings);
      } else {
        toast.error(data.message || "Failed to fetch bookings");
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getAllBookings();
    }
  }, [user]);
  return !loading ? (
    <>
      <Title text1="List" text2="Bookings" />
      <div className="max-w-4xl mt-6 overflow-x-auto">
        <table className="w-full  border-collapse rounded-md overflow-hidden text-nowrap">
          <thead>
            <tr className="bg-primary/20 text-left text-white">
              <th className="p-2 font-medium pl-5">User Name</th>
              <th className="p-2 font-medium">Movie Name</th>
              <th className="p-2 font-medium">Show Time</th>
              <th className="p-2 font-medium">Seats</th>
              <th className="p-2 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="text-sm font-light">
            {bookings.map((booking, idx) => (
              <tr
                key={idx}
                className="border-b border-primary/20 bg-primary/5 even:bg-primary/10"
              >
                <td className="p-2 pl-5 min-w-45">{booking.user.name}</td>
                <td className="p-2">{booking.show.movie.title}</td>
                <td className="p-2">{dateFormat(booking.show.showDateTime)}</td>
                <td className="p-2">
                  {Object.keys(booking.bookedSeats)
                    .map((seat: any) => booking.bookedSeats[seat])
                    .join(", ")}
                </td>
                <td className="p-2">
                  {currency}
                  {booking.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  ) : (
    <Loading />
  );
};

export default ListBookings;

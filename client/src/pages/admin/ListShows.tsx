import Title from "@/components/admin/Title";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import { dateFormat } from "@/lib/DateFormat";
import type { Show } from "@/types/assets";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface shows {
  movie: Show;
  showDateTime: string;
  showPrice: number;
  occupiedSeats: {
    [key: string]: string;
  };
}

const ListShows = () => {
  const currency = import.meta.env.VITE_CURRENCY as string;
  const [shows, setShows] = useState<shows[]>([]);
  const [loading, setLoading] = useState(true);
  const { axios, getToken, user } = useAppContext();

  const getAllShows = async () => {
    try {
      const { data } = await axios.get("/api/admin/all-shows", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
      if (data.success) {
        setShows(data.shows);
      } else {
        toast.error(data.message || "Failed to fetch shows");
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getAllShows();
    }
  }, [user]);

  return !loading ? (
    <>
      <Title text1="List" text2="Shows" />
      <div className="max-w-4xl mt-6 overflow-x-auto">
        <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">
          <thead>
            <tr className="bg-primary/20 text-left text-white">
              <th className="p-2 font-medium pl-5">Movie Name</th>
              <th className="p-2 font-medium ">Show Time</th>
              <th className="p-2 font-medium ">Total Bookings</th>
              <th className="p-2 font-medium ">Earnings</th>
            </tr>
          </thead>
          <tbody className="text-sm font-light">
            {shows.map((show, idx) => (
              <tr
                key={idx}
                className="border-b border-primary/10 bg-primary/5 even:bg-primary/10"
              >
                <td className="p-2 pl-5 min-w-45">{show.movie.title}</td>
                <td className="p-2">{dateFormat(show.showDateTime)}</td>
                <td className="p-2">
                  {Object.keys(show.occupiedSeats).length}
                </td>
                <td className="p-2">
                  {currency}
                  {Object.keys(show.occupiedSeats).length * show.showPrice}
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

export default ListShows;

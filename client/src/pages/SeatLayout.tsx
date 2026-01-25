import { assets, dummyDateTimeData, dummyShowsData } from "@/assets/assets";
import BlurCircle from "@/components/BlurCircle";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import isoTimeFormat from "@/lib/isoTimeFormat";
import type { DateTimeMap, Show } from "@/types/assets";
import { ArrowRightIcon, ClockIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const SeatLayout = () => {
  const groupRows = [
    ["A", "B"],
    ["C", "D"],
    ["E", "F"],
    ["G", "H"],
    ["I", "J"],
  ];

  const { id, date } = useParams();
  const [selectedseats, setSelectedseats] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<{
    showId: string;
    time: string;
  } | null>(null);
  const [show, setShow] = useState<{
    movie: Show | undefined;
    dateTime: DateTimeMap | undefined;
  } | null>(null);
  const navigate = useNavigate();
  const { axios, user, getToken } = useAppContext();
  const [occupiedSeats, setOccupiedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const getShow = async () => {
    try {
      const { data } = await axios.get(`/api/show/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (data.success) {
        setShow({
          movie: data.movie,
          dateTime: data.dateTime,
        });
      }
    } catch (error) {
      console.error("Error fetching show:", error);
    }
  };

  const getOccupiedSeats = async () => {
    try {
      const { data } = await axios.get(
        `/api/booking/occupied-seats/${selectedTime?.showId}`,
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        },
      );
      if (data.success) {
        setOccupiedSeats(data.occupiedSeats);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching occupied seats:", error);
    }
  };

  const handleSeatClick = (seatId: string) => {
    if (!selectedTime) {
      toast.error("Please select a time first");
      return;
    }
    if (!selectedseats.includes(seatId) && selectedseats.length > 4) {
      toast.error("You can only select 5 seats at a time");
    } else if (selectedseats.includes(seatId)) {
      setSelectedseats(selectedseats.filter((seat) => seat !== seatId));
    } else if (occupiedSeats.includes(seatId)) {
      toast.error("Seat is already booked");
    } else {
      setSelectedseats([...selectedseats, seatId]);
    }
  };

  const bookTicket = async () => {
    try {
      if (!selectedTime) {
        toast.error("Please select a time first");
        return;
      }
      if (selectedseats.length === 0) {
        toast.error("Please select seats");
        return;
      }
      if (!user) {
        toast.error("Please login to book tickets");
        return;
      }
      setLoading(true);
      const { data } = await axios.post(
        "/api/booking/create",
        {
          showId: selectedTime?.showId,
          selectedSeats: selectedseats,
        },
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        },
      );
      if (data.success) {
        window.location.href = data.url;
      } else {
        toast.error(data.message);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error booking ticket:", error);
      setLoading(false);
    }
  };
  const renderSeats = (row: string, count = 9) => (
    <div className="flex mt-2 gap-2" key={row}>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: count }).map((_, idx) => {
          const seatId = `${row}${idx + 1}`;
          return (
            <button
              key={seatId}
              onClick={() => handleSeatClick(seatId)}
              className={`h-8 w-8 rounded border border-primary/60 cursor-pointer
                ${selectedseats.includes(seatId) && "bg-primary text-white"} ${occupiedSeats.includes(seatId) && "opacity-50"}`}
            >
              {seatId}
            </button>
          );
        })}
      </div>
    </div>
  );

  useEffect(() => {
    getShow();
  }, [id]);

  useEffect(() => {
    if (selectedTime) {
      getOccupiedSeats();
    }
  }, [selectedTime]);

  return show ? (
    <div className="flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-50">
      <div className="w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max md:sticky md:top-30">
        <p className="text-lg font-semibold px-6">Available Timings</p>
        <div className="mt-5 space-y-1">
          {show?.dateTime![date as string].map((item) => (
            <div
              key={item.showId}
              className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition ${selectedTime?.time === item.time ? "bg-primary text-white" : "hover:bg-primary/20"}`}
              onClick={() => setSelectedTime(item)}
            >
              <ClockIcon className="w-4 h-4" />
              <p className="text-sm">{isoTimeFormat(item.time)}</p>
            </div>
          ))}
        </div>
      </div>
      {/* seat layout */}
      <div className="relative flex-1 flex flex-col items-center max-md:mt-16">
        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle bottom="0" right="0" />
        <h1 className="text-2xl font-semibold mb-4">Select your seats</h1>
        <img src={assets.screenImage} alt="screen" />
        <p className="text-gray-400 mt-6 text-sm">SCREEN SIDE</p>
        <div className="flex flex-col items-center mt-10 text-xs text-gray-300">
          <div>{groupRows[0].map((row) => renderSeats(row))}</div>
          <div className="grid grid-cols-2 gap-11">
            {groupRows.slice(1).map((rowGroup, idx) => (
              <div key={idx}>{rowGroup.map((row) => renderSeats(row))}</div>
            ))}
          </div>
        </div>
        <button
          onClick={bookTicket}
          disabled={loading}
          className="flex items-stretch gap-1 mt-20 px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95"
        >
          Proceed to Checkout <ArrowRightIcon strokeWidth={3} />
        </button>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default SeatLayout;

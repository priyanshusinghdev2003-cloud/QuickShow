import Title from "@/components/admin/Title";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import kConverter from "@/lib/kConverter";
import type { Show } from "@/types/assets";
import { CheckIcon, DeleteIcon, StarIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const AddShows = () => {
  const currency = import.meta.env.VITE_CURRENCY as string;
  const [nowPlayingMovies, setNowPlayingMovies] = useState<Show[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<number | null>(null);
  const [dateTimeSelection, setDateTimeSelection] = useState({});
  const [dateTimeInput, setDateTimeInput] = useState("");
  const [showPrice, setShowPrice] = useState("");
  const { axios, getToken, user, baseImgUrl } = useAppContext();
  const [addingShow, setAddingShow] = useState(false);

  const fetchNowPlayingMovies = async () => {
    try {
      const { data } = await axios.get("/api/show/now-playing", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
      if (data.success) {
        setNowPlayingMovies(data.movies);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDateTimeAdd = () => {
    if (!dateTimeInput) {
      toast.error("Please select a date time");
      return;
    }
    const [date, time] = dateTimeInput.split("T");
    if (!date || !time) {
      toast.error("Please select a date time");
      return;
    }
    setDateTimeSelection((prev: any) => {
      const times = prev[date] || [];
      if (!times.includes(time)) {
        return { ...prev, [date]: [...times, time] };
      }
      return prev;
    });
    setDateTimeInput("");
  };
  const handleRemoveTime = (date: string, time: string) => {
    setDateTimeSelection((prev: any) => {
      const filteredTimes = prev[date].filter((t: string) => t !== time);
      if (filteredTimes.length === 0) {
        const { [date]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [date]: filteredTimes };
    });
  };
  const handleAddShow = async () => {
    try {
      setAddingShow(true);
      if (
        Object.keys(dateTimeSelection).length === 0 ||
        !showPrice ||
        !selectedMovie
      ) {
        toast.error("Please fill all the fields");
        return;
      }
      const show = {
        movieId: selectedMovie,
        showInput: Object.entries(dateTimeSelection).map(([date, time]) => ({
          date,
          time,
        })),
        showPrice: Number(showPrice),
      };
      const { data } = await axios.post("/api/show/add", show, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
      if (data.success) {
        toast.success("Show added successfully");
        setSelectedMovie(null);
        setDateTimeSelection({});
        setShowPrice("");
        setAddingShow(false);
      } else {
        toast.error(data.message);
        setAddingShow(false);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
      setAddingShow(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNowPlayingMovies();
    }
  }, [user]);
  return nowPlayingMovies.length > 0 ? (
    <>
      <Title text1="Add" text2="Shows" />
      <p className="mt-10 text-lg font-medium">Now Playing Movies</p>
      <div className="overflow-x-auto pb-4 no-scrollbar ">
        <div className="group flex flex-wrap gap-4 mt-4 w-max ">
          {nowPlayingMovies.map((movie) => (
            <div
              key={movie.id}
              onClick={() => setSelectedMovie(movie.id)}
              className={`relative max-w-40 cursor-pointer group-hover:not-hover:opacity-40 hover:-translate-y-1 transition duration-300`}
            >
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={`${baseImgUrl}${movie.backdrop_path}`}
                  alt=""
                  className="w-full object-cover h-48 brightness-90"
                />
                <div className="text-sm flex items-center justify-between p-2 bg-black/70 w-full absolute bottom-0 left-0">
                  <p className="flex items-center gap-1 text-gray-400">
                    <StarIcon className="w-4 h-4 text-primary fill-primary" />
                    {movie.vote_average.toFixed(1)}
                  </p>
                  <p className="text-gray-300">
                    {kConverter(movie.vote_count)} Votes
                  </p>
                </div>
              </div>
              {selectedMovie == movie.id && (
                <div className="absolute top-2 right-2 flex items-center justify-center bg-primary h-6 w-6 rounded">
                  <CheckIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
              )}
              <p className="font-medium truncate">{movie.title}</p>
              <p className="text-gray-400 text-sm">{movie.release_date}</p>
            </div>
          ))}
        </div>
      </div>
      {/* show Price Input */}
      <div className="mt-8">
        <label className="block text-sm font-medium mb-2">Show Price</label>
        <div className="inline-flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md">
          <p className="text-gray-400 text-sm">{currency}</p>
          <input
            min={0}
            type="number"
            value={showPrice}
            onChange={(e) => setShowPrice(e.target.value)}
            placeholder="Enter Show Price"
            className=" outline-none"
          />
        </div>
      </div>
      {/* show Date Time Input */}
      <div className="mt-6">
        <label className="block text-sm font-medium mb-2">
          Select Date Time
        </label>
        <div className="inline-flex gap-5 border border-gray-600 p-1 pl-3 rounded-lg">
          <input
            type="datetime-local"
            value={dateTimeInput}
            onChange={(e) => setDateTimeInput(e.target.value)}
            className="outline-none rounded-md "
          />
          <button
            onClick={handleDateTimeAdd}
            className="bg-primary/80 text-white rounded-lg px-3 py-2 hover:bg-primary cursor-pointer"
          >
            Add Time
          </button>
        </div>
      </div>
      {/* show selected Tines */}
      {Object.keys(dateTimeSelection).length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2">Selected Date-Time</h2>
          <ul className="space-y-3">
            {Object.entries(dateTimeSelection).map(([date, times]: any) => (
              <li key={date}>
                <div className="font-medium">{date}</div>
                <div className="flex flex-wrap gap-2 mt-1 text-sm ">
                  {times.map((time: string) => (
                    <div
                      key={time}
                      className="border border-primary px-2 py-1 flex items-center rounded"
                    >
                      <span>{time}</span>
                      <DeleteIcon
                        onClick={() => handleRemoveTime(date, time)}
                        width={15}
                        className="ml-2 text-red-500 cursor-pointer hover:text-red-700"
                      />
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        onClick={handleAddShow}
        disabled={addingShow}
        className="bg-primary text-white px-8 py-2 rounded mt-6 hover:bg-primary/90 transition-all cursor-pointer"
      >
        Add Show
      </button>
    </>
  ) : (
    <Loading />
  );
};

export default AddShows;

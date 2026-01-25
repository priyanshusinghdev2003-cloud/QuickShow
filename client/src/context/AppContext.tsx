import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { Show } from "@/types/assets";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

interface AppContextType {
  axios: any;
  fetchIsAdmin: () => void;
  user: any;
  getToken: any;
  navigate: any;
  isAdmin: boolean;
  shows: Show[];
  favoriteShows: Show[];
  fetchFavoriteShows: () => void;
  baseImgUrl: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [shows, setShows] = useState<Show[]>([]);
  const [favoriteShows, setFavoriteShows] = useState<Show[]>([]);
  const { user } = useUser();
  const { getToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const baseImgUrl = import.meta.env.VITE_TMDB_BASE_IMG_URL;

  const fetchIsAdmin = async () => {
    try {
      const { data } = await axios.get("/api/admin/is-admin", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
      setIsAdmin(data.isAdmin);
      if (!data.isAdmin && location.pathname.startsWith("/admin")) {
        navigate("/");
        toast.error("You are not authorized to access this page");
      }
    } catch (error) {
      console.error("Error fetching admin status:", error);
    }
  };
  const fetchShows = async () => {
    try {
      const { data } = await axios.get("/api/show/all");
      if (data.success) {
        setShows(data.shows);
      } else {
        toast.error(data.message || "Failed to fetch shows");
      }
    } catch (error) {
      console.error("Error fetching shows:", error);
    }
  };

  const fetchFavoriteShows = async () => {
    try {
      const { data } = await axios.get("/api/user/favourites", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
      if (data.success) {
        setFavoriteShows(data.movies);
      } else {
        toast.error(data.message || "Failed to fetch favorite shows");
      }
    } catch (error) {
      console.error("Error fetching favorite shows:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchIsAdmin();
    }
  }, [user]);
  useEffect(() => {
    fetchShows();
    fetchFavoriteShows();
  }, []);

  const value = {
    axios,
    fetchIsAdmin,
    user,
    getToken,
    navigate,
    isAdmin,
    shows,
    favoriteShows,
    fetchFavoriteShows,
    baseImgUrl,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

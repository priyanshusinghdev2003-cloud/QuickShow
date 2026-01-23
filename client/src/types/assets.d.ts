export interface Trailer {
  image: string;
  videoUrl: string;
}

export interface Cast {
  name: string;
  profile_path: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Show {
  _id: string;
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  genres: Genre[];
  casts: Cast[];
  release_date: string;
  original_language?: string;
  tagline?: string;
  vote_average: number;
  vote_count: number;
  runtime: number;
}

export interface ShowTime {
  time: string;
  showId: string;
}

export type DateTimeMap = Record<string, ShowTime[]>;

export interface DashboardShow {
  _id: string;
  movie: Show;
  showDateTime: string;
  showPrice: number;
  occupiedSeats: Record<string, string>;
  __v?: number;
}

export interface DashboardData {
  totalBookings: number;
  totalRevenue: number;
  totalUser: number;
  activeShows: DashboardShow[];
}

export interface Booking {
  _id: string;
  user: { name: string };
  show: {
    _id: string;
    movie: Show;
    showDateTime: string;
    showPrice: number;
  };
  amount: number;
  bookedSeats: string[];
  isPaid: boolean;
}

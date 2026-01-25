import { Route, Routes, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import {
  Favourite,
  Home,
  MovieDetail,
  Movies,
  MyBookings,
  SeatLayout,
} from "./pages";
import { Toaster } from "sonner";
import Layout from "./pages/admin/Layout";
import Dashboard from "./pages/admin/Dashboard";
import AddShows from "./pages/admin/AddShows";
import ListShows from "./pages/admin/ListShows";
import ListBookings from "./pages/admin/ListBookings";
import { useAppContext } from "./context/AppContext";
import { SignIn } from "@clerk/clerk-react";

const App = () => {
  const isAdminRoute = useLocation().pathname.startsWith("/admin");
  const { user } = useAppContext();
  return (
    <>
      <Toaster />
      {!isAdminRoute && <NavBar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movies/:id" element={<MovieDetail />} />
        <Route path="/movie/:id/:date" element={<SeatLayout />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/favorite" element={<Favourite />} />

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            user ? (
              <Layout />
            ) : (
              <div className="min-h-screen flex items-center justify-center">
                <SignIn fallbackRedirectUrl="/admin" />
              </div>
            )
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="add-shows" element={<AddShows />} />
          <Route path="list-shows" element={<ListShows />} />
          <Route path="list-bookings" element={<ListBookings />} />
        </Route>
      </Routes>
      {!isAdminRoute && <Footer />}
    </>
  );
};

export default App;

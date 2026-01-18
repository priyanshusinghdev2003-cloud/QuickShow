import {Route,Routes,useLocation} from "react-router-dom"
import NavBar from "./components/NavBar"
import Footer from "./components/Footer"
import { Favourite, Home, MovieDetail, Movies, MyBookings, SeatLayout } from "./pages"
import { Toaster } from "sonner"

const App = () => {
  const isAdminRoute = useLocation().pathname.startsWith('/admin');
  return (
    <>
    <Toaster />
      {!isAdminRoute && <NavBar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movies/:id" element={<MovieDetail />} />
        <Route path="/movies/:id/:date" element={<SeatLayout />} />
        <Route path="/momy-bookings" element={<MyBookings />} />
        <Route path="/favorite" element={<Favourite />} />
      </Routes>
      {!isAdminRoute && <Footer />}
    </>
  )
}

export default App
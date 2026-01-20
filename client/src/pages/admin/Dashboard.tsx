import { dummyDashboardData } from "@/assets/assets";
import Title from "@/components/admin/Title";
import BlurCircle from "@/components/BlurCircle";
import Loading from "@/components/Loading";
import type { DashboardData } from "@/types/assets";
import {
  ChartLineIcon,
  CircleDollarSignIcon,
  PlayCircleIcon,
  UserIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const currency = import.meta.env.VITE_CURRENCY as string;
  const [dashboarddata, setDashboard] = useState<DashboardData>({
    totalBookings: 0,
    totalRevenue: 0,
    activeShows: [],
    totalUser: 0,
  });
  const [loading, setLoading] = useState(true);
  const dashboardCards = [
    {
      title: "Total Bookings",
      value: dashboarddata.totalBookings || "0",
      icon: ChartLineIcon,
    },
    {
      title: "Total Revenue",
      value: currency + dashboarddata.totalRevenue || "0",
      icon: CircleDollarSignIcon,
    },
    {
      title: "Active Shows",
      value: dashboarddata.activeShows.length || "0",
      icon: PlayCircleIcon,
    },
    {
      title: "Total Users",
      value: dashboarddata.totalUser || "0",
      icon: UserIcon,
    },
  ];

  const getDashboardData = async () => {
    try {
      const data = dummyDashboardData;
      setDashboard(data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  return !loading ? (
    <>
      <Title text1="Admin" text2="Dashboard" />
      <div className="relative flex flex-wrap gap-4 mt-6">
        <BlurCircle top="-100px" left="0" />
        <div className="flex flex-wrap gap-4 w-full">
          {dashboardCards.map((card, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-3 bg-primary/10 border border-primary/20 rounded-md max-w-50 w-full"
            >
              <div>
                <h1 className="text-sm">{card.title}</h1>
                <p className="text-xl font-medium mt-1">{card.value}</p>
              </div>
              <card.icon className="w-6 h-6 " />
            </div>
          ))}
        </div>
      </div>
    </>
  ) : (
    <Loading />
  );
};

export default Dashboard;

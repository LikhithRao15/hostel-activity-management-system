import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { CheckCircle, XCircle, Users, Scissors, Clock } from "lucide-react";
import BASE_URL from "../config/api";
import { getAuthToken } from "../utils/auth";

function AttenderDashboard() {
  const [registrations, setRegistrations] = useState([]);
  const [saloonBookings, setSaloonBookings] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("activities"); // "activities" or "saloon"

  const fetchData = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      // First fetch user profile to know their assigned facility
      const profileRes = await axios.get(`${BASE_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = profileRes.data.user;
      setUser(userData);

      // Fetch filtered data based on user role/facility
      const isSaloon = userData.facility === "Saloon";
      
      const requests = [
          axios.get(`${BASE_URL}/api/registration/all?facility=${userData.facility || ""}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
      ];

      if (isSaloon) {
          requests.push(
            axios.get(`${BASE_URL}/api/saloon/bookings?date=${new Date().toISOString().split('T')[0]}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
          );
          setActiveTab("saloon");
      } else {
          setActiveTab("activities");
      }

      const results = await Promise.all(requests);
      
      setRegistrations(results[0].data);
      if (isSaloon && results[1]) {
          setSaloonBookings(results[1].data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const markAttendance = async (registrationId, status) => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const response = await axios.post(
        `${BASE_URL}/api/attendance/mark`,
        { registrationId, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to mark attendance");
    }
  };

  const markSaloonStatus = async (bookingId, status) => {
      try {
          const token = getAuthToken();
          if (!token) return;
          await axios.put(
              `${BASE_URL}/api/saloon/attendance/${bookingId}`,
              { status },
              { headers: { Authorization: `Bearer ${token}` } }
          );
          toast.success(`Booking marked as ${status}`);
          fetchData();
      } catch (error) {
          toast.error("Failed to update status");
      }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Attender Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Managing: <span className="font-semibold text-blue-600 dark:text-blue-400">{user?.facility || "General"}</span>
          </p>
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            {user?.facility !== "Saloon" && (
                <button 
                    onClick={() => setActiveTab("activities")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'activities' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                >
                    Facilities
                </button>
            )}
            {user?.facility === "Saloon" && (
                <button 
                    onClick={() => setActiveTab("saloon")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'saloon' ? 'bg-white shadow text-pink-600' : 'text-gray-500'}`}
                >
                    Saloon
                </button>
            )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === "activities" ? (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Facility</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Action</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {registrations.length === 0 ? (
                    <tr><td colSpan="3" className="px-6 py-8 text-center text-gray-500">No pending facility registrations</td></tr>
                ) : (
                    registrations.map((reg) => (
                    <tr key={reg._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{reg.student?.name}</span>
                                <span className="text-xs text-gray-500">{reg.student?.usn}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span className="text-sm text-gray-900 dark:text-white">{reg.activity?.activityName}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => markAttendance(reg._id, "Present")} className="p-2 text-white bg-green-600 rounded-full hover:bg-green-700"><CheckCircle size={18} /></button>
                            <button onClick={() => markAttendance(reg._id, "Absent")} className="p-2 text-white bg-red-600 rounded-full hover:bg-red-700"><XCircle size={18} /></button>
                        </div>
                        </td>
                    </tr>
                    ))
                )}
                </tbody>
            </table>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Service</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Time</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {saloonBookings.length === 0 ? (
                        <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No saloon bookings for today</td></tr>
                    ) : (
                        saloonBookings.map(booking => (
                            <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{booking.user?.name}</span>
                                        <span className="text-xs text-gray-500">{booking.user?.usn}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{booking.service?.name}</td>
                                <td className="px-6 py-4 text-sm font-mono flex items-center">
                                    <Clock size={14} className="mr-1 text-gray-400" />
                                    {new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end space-x-2">
                                        <button 
                                            onClick={() => markSaloonStatus(booking._id, "Completed")} 
                                            className={`p-2 rounded-full transition-colors ${booking.status === 'Completed' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-600'}`}
                                            title="Mark Completed"
                                        >
                                            <CheckCircle size={18} />
                                        </button>
                                        <button 
                                            onClick={() => markSaloonStatus(booking._id, "No-Show")} 
                                            className={`p-2 rounded-full transition-colors ${booking.status === 'No-Show' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-600'}`}
                                            title="Mark No-Show"
                                        >
                                            <XCircle size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default AttenderDashboard;
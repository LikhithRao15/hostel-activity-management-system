import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Calendar, MapPin, Clock, Users, Scissors, ScissorsLineDashed } from "lucide-react";

function StudentDashboard() {
  const [activities, setActivities] = useState([]);
  const [saloonServices, setSaloonServices] = useState([]);
  const [saloonBookings, setSaloonBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("activities"); // "activities" or "saloon"
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedTime, setSelectedTime] = useState("");
  const [userGender, setUserGender] = useState("");

  const fetchUser = async () => {
      try {
          const token = localStorage.getItem("token");
          const response = await axios.get("http://localhost:3000/api/auth/profile", {
              headers: { Authorization: `Bearer ${token}` }
          });
          setUserGender(response.data.user.gender || "Male"); // Fallback to Male if not specified
      } catch (error) {
          console.error(error);
      }
  };

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/api/activity/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActivities(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load activities");
    }
  };

  const fetchSaloonData = async () => {
      try {
          const token = localStorage.getItem("token");
          const [servicesRes, bookingsRes] = await Promise.all([
              axios.get(`http://localhost:3000/api/saloon/services?gender=${userGender}`, {
                  headers: { Authorization: `Bearer ${token}` }
              }),
              axios.get(`http://localhost:3000/api/saloon/bookings?date=${selectedDate}`, {
                  headers: { Authorization: `Bearer ${token}` }
              })
          ]);
          setSaloonServices(servicesRes.data);
          setSaloonBookings(bookingsRes.data);
      } catch (error) {
          console.error(error);
          toast.error("Failed to load saloon data");
      }
  };

  const registerActivity = async (activityId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:3000/api/registration/register",
        { activityId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message);
      fetchActivities(); // Refresh to update seat counts
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Registration Failed");
    }
  };

  const bookSaloon = async () => {
      if (!selectedService || !selectedTime) {
          toast.error("Please select a service and time slot");
          return;
      }
      try {
          const token = localStorage.getItem("token");
          const startTime = new Date(`${selectedDate}T${selectedTime}:00`);
          await axios.post(
              "http://localhost:3000/api/saloon/book",
              {
                  serviceId: selectedService._id,
                  startTime: startTime.toISOString(),
                  date: selectedDate
              },
              { headers: { Authorization: `Bearer ${token}` } }
          );
          toast.success("Saloon appointment booked successfully!");
          fetchSaloonData();
          setSelectedTime("");
      } catch (error) {
          console.error(error);
          toast.error(error.response?.data?.message || "Booking Failed");
      }
  };

  useEffect(() => {
    const init = async () => {
        setIsLoading(true);
        await fetchUser();
        await fetchActivities();
        setIsLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
      if (activeTab === "saloon" && userGender) {
          fetchSaloonData();
      }
  }, [activeTab, userGender, selectedDate]);

  const generateTimeSlots = () => {
      const slots = [];
      let current = new Date(`${selectedDate}T18:45:00`);
      const end = new Date(`${selectedDate}T21:00:00`);
      
      while (current < end) {
          slots.push(current.toTimeString().substring(0, 5));
          current.setMinutes(current.getMinutes() + 5);
      }
      return slots;
  };

  const isSlotBooked = (time) => {
      const slotStart = new Date(`${selectedDate}T${time}:00`);
      return saloonBookings.some(booking => {
          const bStart = new Date(booking.startTime);
          const bEnd = new Date(booking.endTime);
          return slotStart >= bStart && slotStart < bEnd;
      });
  };

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
            Student Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your facilities and saloon appointments
          </p>
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <button 
                onClick={() => setActiveTab("activities")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'activities' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}
            >
                Facilities
            </button>
            <button 
                onClick={() => setActiveTab("saloon")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'saloon' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}
            >
                Saloon
            </button>
        </div>
      </div>

      {activeTab === "activities" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {activities.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-gray-800 p-8 rounded-xl text-center text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700">
                No facilities available at the moment.
            </div>
            ) : (
            activities.map((activity) => {
                const isFull = activity.registeredCount >= activity.capacity;
                const progress = (activity.registeredCount / activity.capacity) * 100;

                return (
                <div
                    key={activity._id}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                    <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
                        {activity.activityName}
                        </h2>
                        {isFull ? (
                        <span className="px-2.5 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-semibold rounded-full whitespace-nowrap">
                            Full
                        </span>
                        ) : (
                        <span className="px-2.5 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-semibold rounded-full whitespace-nowrap">
                            Available
                        </span>
                        )}
                    </div>

                    <div className="space-y-3 mb-6">
                        <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                        <MapPin size={16} className="mr-2 text-gray-400" />
                        {activity.venue}
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                        <Clock size={16} className="mr-2 text-gray-400" />
                        {activity.timing}
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-500 dark:text-gray-400 flex items-center">
                            <Users size={14} className="mr-1" />
                            Seats
                        </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                            {activity.registeredCount || 0} / {activity.capacity}
                        </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full ${
                            isFull ? "bg-red-500" : progress > 80 ? "bg-amber-500" : "bg-blue-500"
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                        </div>
                    </div>

                    <button
                        onClick={() => registerActivity(activity._id)}
                        disabled={isFull}
                        className={`w-full py-2.5 rounded-lg font-medium transition-colors ${
                        isFull
                            ? "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                        }`}
                    >
                        {isFull ? "Facility Full" : "Register Now"}
                    </button>
                    </div>
                </div>
                );
            })
            )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Services List */}
            <div className="lg:col-span-1 space-y-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <Scissors size={20} className="mr-2 text-blue-500" />
                    Select Service ({userGender})
                </h2>
                <div className="grid grid-cols-1 gap-3 max-h-[600px] overflow-y-auto pr-2">
                    {saloonServices.map(service => (
                        <div 
                            key={service._id}
                            onClick={() => {
                                setSelectedService(service);
                                setSelectedTime("");
                            }}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedService?._id === service._id ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-blue-300'}`}
                        >
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-900 dark:text-white">{service.name}</span>
                                <span className="text-blue-600 dark:text-blue-400 font-bold">₹{service.price}</span>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                                <Clock size={14} className="mr-1" />
                                {service.duration} mins
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Slot Selection */}
            <div className="lg:col-span-2 space-y-6 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Select Slot</h2>
                    <input 
                        type="date" 
                        min={new Date().toISOString().split("T")[0]}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                {selectedService ? (
                    <div className="space-y-6">
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Booking for:</span>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedService.name} ({selectedService.duration} min)</div>
                        </div>

                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                            {generateTimeSlots().map(time => {
                                const booked = isSlotBooked(time);
                                return (
                                    <button
                                        key={time}
                                        disabled={booked}
                                        onClick={() => setSelectedTime(time)}
                                        className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                                            booked 
                                                ? 'bg-gray-100 text-gray-300 border-gray-100 dark:bg-gray-900 dark:text-gray-700 dark:border-gray-800 cursor-not-allowed'
                                                : selectedTime === time
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                                    : 'bg-white text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 hover:border-blue-500'
                                        }`}
                                    >
                                        {time}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                            <button
                                onClick={bookSaloon}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-[0.98]"
                            >
                                Confirm Booking
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
                        <ScissorsLineDashed size={48} className="mb-4 opacity-20" />
                        <p>Please select a service from the left to see available slots</p>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Calendar, MapPin, Clock, Users, Scissors, ScissorsLineDashed } from "lucide-react";
import gsap from "gsap";
import BASE_URL from "../config/api";

function StudentDashboard() {
  const [activities, setActivities] = useState([]);
  const [saloonServices, setSaloonServices] = useState([]);
  const [saloonBookings, setSaloonBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("activities");
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedTime, setSelectedTime] = useState("");
  const [userGender, setUserGender] = useState("");

  const headerRef = useRef(null);
  const cardsContainerRef = useRef(null);
  const saloonRef = useRef(null);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserGender(response.data.user.gender || "Male");
    } catch (error) {
      console.error(error);
    }
  };

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/activity/all`, {
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
        axios.get(`${BASE_URL}/api/saloon/services?gender=${userGender}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${BASE_URL}/api/saloon/bookings?date=${selectedDate}`, {
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
        `${BASE_URL}/api/registration/register`,
        { activityId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message);
      fetchActivities();
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
        `${BASE_URL}/api/saloon/book`,
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

  // GSAP entrance animations
  useEffect(() => {
    if (!isLoading && headerRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(headerRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
        );
      });
      return () => ctx.revert();
    }
  }, [isLoading]);

  // Stagger cards animation
  useEffect(() => {
    if (!isLoading && activeTab === "activities" && cardsContainerRef.current) {
      const cards = cardsContainerRef.current.children;
      if (cards.length > 0) {
        gsap.fromTo(cards,
          { y: 40, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.08, ease: "back.out(1.4)" }
        );
      }
    }
  }, [isLoading, activeTab, activities]);

  // Saloon section animation
  useEffect(() => {
    if (!isLoading && activeTab === "saloon" && saloonRef.current) {
      gsap.fromTo(saloonRef.current.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, [isLoading, activeTab]);

  // 3D tilt effect for cards
  const handleCardMouseMove = (e, cardEl) => {
    if (!cardEl) return;
    const rect = cardEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -3;
    const rotateY = ((x - centerX) / centerX) * 3;

    gsap.to(cardEl, {
      rotateX, rotateY,
      transformPerspective: 800,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleCardMouseLeave = (cardEl) => {
    if (!cardEl) return;
    gsap.to(cardEl, {
      rotateX: 0, rotateY: 0,
      duration: 0.5,
      ease: "elastic.out(1, 0.6)"
    });
  };

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
      <div className="flex flex-col justify-center items-center h-64 gap-4">
        <div className="loading-cube-wrapper">
          <div className="loading-cube">
            <div className="loading-cube-face" /><div className="loading-cube-face" />
            <div className="loading-cube-face" /><div className="loading-cube-face" />
            <div className="loading-cube-face" /><div className="loading-cube-face" />
          </div>
        </div>
        <p className="text-sm animate-pulse" style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div ref={headerRef} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold gradient-text-animated">
            Student Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Manage your facilities and saloon appointments
          </p>
        </div>
        <div className="flex glass rounded-xl p-1 self-stretch sm:self-auto">
          <button
            onClick={() => setActiveTab("activities")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'activities'
              ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
              : ''}`}
            style={activeTab !== 'activities' ? { color: 'var(--text-secondary)' } : {}}
          >
            Facilities
          </button>
          <button
            onClick={() => setActiveTab("saloon")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'saloon'
              ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
              : ''}`}
            style={activeTab !== 'saloon' ? { color: 'var(--text-secondary)' } : {}}
          >
            Saloon
          </button>
        </div>
      </div>

      {/* Activities Tab */}
      {activeTab === "activities" && (
        <div ref={cardsContainerRef} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {activities.length === 0 ? (
            <div className="col-span-full glass-card p-10 text-center" style={{ color: 'var(--text-secondary)' }}>
              <div className="text-4xl mb-3 opacity-30">🏠</div>
              No facilities available at the moment.
            </div>
          ) : (
            activities.map((activity) => {
              const isFull = activity.registeredCount >= activity.capacity;
              const progress = (activity.registeredCount / activity.capacity) * 100;

              return (
                <div
                  key={activity._id}
                  className="glass-card overflow-hidden cursor-default"
                  style={{ transformStyle: 'preserve-3d' }}
                  onMouseMove={(e) => handleCardMouseMove(e, e.currentTarget)}
                  onMouseLeave={(e) => handleCardMouseLeave(e.currentTarget)}
                >
                  {/* Top accent gradient */}
                  <div className={`h-1 w-full ${isFull ? 'bg-gradient-to-r from-rose-500 to-pink-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500'}`} />

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-lg font-bold line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                        {activity.activityName}
                      </h2>
                      {isFull ? (
                        <span className="px-2.5 py-1 bg-rose-500/10 text-rose-500 text-xs font-bold rounded-lg whitespace-nowrap badge-glow-red">
                          Full
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-bold rounded-lg whitespace-nowrap badge-glow-green">
                          Available
                        </span>
                      )}
                    </div>

                    <div className="space-y-2.5 mb-5">
                      <div className="flex items-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <MapPin size={15} className="mr-2 text-indigo-400" />
                        {activity.venue}
                      </div>
                      <div className="flex items-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <Clock size={15} className="mr-2 text-indigo-400" />
                        {activity.timing}
                      </div>
                    </div>

                    <div className="mb-5">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="flex items-center" style={{ color: 'var(--text-secondary)' }}>
                          <Users size={13} className="mr-1" />
                          Seats
                        </span>
                        <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                          {activity.registeredCount || 0} / {activity.capacity}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
                        <div
                          className={`h-full rounded-full progress-bar-animated ${isFull ? 'bg-gradient-to-r from-rose-500 to-pink-500' : progress > 80 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500'}`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => registerActivity(activity._id)}
                      disabled={isFull}
                      className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${isFull
                        ? 'opacity-40 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:scale-[0.98]'
                      }`}
                      style={isFull ? { background: 'var(--border-color)', color: 'var(--text-secondary)' } : {}}
                    >
                      {isFull ? "Facility Full" : "Register Now"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Saloon Tab */}
      {activeTab === "saloon" && (
        <div ref={saloonRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Services List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-bold flex items-center" style={{ color: 'var(--text-primary)' }}>
              <Scissors size={18} className="mr-2 text-indigo-400" />
              Select Service ({userGender})
            </h2>
            <div className="grid grid-cols-1 gap-3 max-h-[60vh] lg:max-h-[600px] overflow-y-auto pr-1">
              {saloonServices.map(service => (
                <div
                  key={service._id}
                  onClick={() => {
                    setSelectedService(service);
                    setSelectedTime("");
                  }}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${selectedService?._id === service._id
                    ? 'glass-card shadow-lg shadow-indigo-500/15 ring-2 ring-indigo-500/50'
                    : 'glass-card hover:-translate-y-0.5'}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{service.name}</span>
                    <span className="font-extrabold text-sm gradient-text">₹{service.price}</span>
                  </div>
                  <div className="text-xs mt-1 flex items-center" style={{ color: 'var(--text-secondary)' }}>
                    <Clock size={12} className="mr-1" />
                    {service.duration} mins
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slot Selection */}
          <div className="lg:col-span-2 glass-card p-6 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Select Slot</h2>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 rounded-xl border bg-white/50 dark:bg-white/5 focus:ring-2 focus:ring-indigo-500 outline-none input-glow text-sm"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              />
            </div>

            {selectedService ? (
              <div className="space-y-5">
                <div className="p-4 rounded-xl" style={{ background: 'var(--border-color)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Booking for:</span>
                  <div className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                    {selectedService.name} ({selectedService.duration} min)
                  </div>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {generateTimeSlots().map(time => {
                    const booked = isSlotBooked(time);
                    return (
                      <button
                        key={time}
                        disabled={booked}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 text-xs font-semibold rounded-lg border transition-all duration-200 ${booked
                          ? 'opacity-30 cursor-not-allowed'
                          : selectedTime === time
                            ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-500/25'
                            : 'hover:border-indigo-400 hover:-translate-y-0.5'
                        }`}
                        style={!booked && selectedTime !== time ? { borderColor: 'var(--border-color)', color: 'var(--text-secondary)' } : booked ? { borderColor: 'var(--border-color)', color: 'var(--text-secondary)' } : {}}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                  <button
                    onClick={bookSaloon}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    Confirm Booking
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16" style={{ color: 'var(--text-secondary)' }}>
                <ScissorsLineDashed size={48} className="mb-4 opacity-20" />
                <p className="text-sm">Please select a service to see available slots</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
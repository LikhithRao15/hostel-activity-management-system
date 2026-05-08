import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Calendar, MapPin, Clock, Users } from "lucide-react";

function StudentDashboard() {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
    } finally {
      setIsLoading(false);
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

  useEffect(() => {
    fetchActivities();
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
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Available Activities
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Browse and register for upcoming hostel events
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {activities.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-gray-800 p-8 rounded-xl text-center text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700">
            No activities available at the moment.
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
                    {isFull ? "Activity Full" : "Register Now"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;
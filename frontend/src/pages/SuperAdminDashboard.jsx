import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { PlusCircle } from "lucide-react";
import BASE_URL from "../config/api";

function SuperAdminDashboard() {
  const [formData, setFormData] = useState({
    activityName: "",
    venue: "",
    timing: "",
    capacity: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${BASE_URL}/api/activity/create`,
        {
          ...formData,
          capacity: Number(formData.capacity)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Facility Created Successfully!");
      setFormData({ activityName: "", venue: "", timing: "", capacity: "" });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to create facility");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Super Admin Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage system configurations and create new facilities
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <PlusCircle className="text-blue-600 dark:text-blue-400" size={20} />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create New Facility</h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Add a new facility to the hostel system</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Facility Name
              </label>
              <div className="flex flex-col space-y-2">
                <select
                  name="activityName"
                  value={["Gym", "Badminton", "Swimming"].includes(formData.activityName) ? formData.activityName : (formData.activityName === "" ? "" : "Other")}
                  onChange={(e) => {
                    if (e.target.value !== "Other") {
                      setFormData({ ...formData, activityName: e.target.value });
                    } else {
                      setFormData({ ...formData, activityName: "Other" });
                    }
                  }}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                >
                  <option value="">Select Facility</option>
                  <option value="Gym">Gym</option>
                  <option value="Badminton">Badminton</option>
                  <option value="Swimming">Swimming</option>
                  <option value="Other">Other</option>
                </select>
                
                {(!["Gym", "Badminton", "Swimming"].includes(formData.activityName) && formData.activityName !== "") || formData.activityName === "Other" ? (
                  <input
                    type="text"
                    placeholder="Enter custom facility name"
                    value={formData.activityName === "Other" ? "" : formData.activityName}
                    onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                ) : null}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Venue
              </label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                placeholder="e.g., Main Ground"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Timing
              </label>
              <input
                type="text"
                name="timing"
                value={formData.timing}
                onChange={handleChange}
                placeholder="e.g., 4:00 PM - 6:00 PM"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Capacity (Number of Seats)
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="e.g., 50"
                min="1"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Plus size={18} />
                  <span>Create Facility</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SuperAdminDashboard;

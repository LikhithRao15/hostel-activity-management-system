import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { User, Lock, Camera, Mail, Phone, BookOpen, Home, X } from "lucide-react";
import BASE_URL from "../config/api";

function ProfileModal({ isOpen, onClose }) {
  const [user, setUser] = useState(null);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchUser();
    }
  }, [isOpen]);

  const fetchUser = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.user);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      setIsUpdatingProfile(true);
      const token = localStorage.getItem("token");
      const response = await axios.put(`${BASE_URL}/api/auth/update-profile`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      setUser(response.data.user);
      toast.success("Profile picture updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile picture");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error("New passwords do not match");
    }

    try {
      setIsUpdatingPassword(true);
      const token = localStorage.getItem("token");
      await axios.put(`${BASE_URL}/api/auth/change-password`, {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Password changed successfully!");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity p-4 sm:p-6">
      <div className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <User className="mr-2 text-blue-500" />
            My Profile
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6">
          {isLoading || !user ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Details */}
              <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center">
                  <div className="relative mb-6">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-100 dark:border-blue-900 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          {user.profilePicture ? (
                              <img src={`${BASE_URL}${user.profilePicture}`} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                              <User size={64} className="text-gray-400" />
                          )}
                      </div>
                      <label className={`absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-md ${isUpdatingProfile ? 'opacity-50 pointer-events-none' : ''}`}>
                          <Camera size={18} />
                          <input type="file" className="hidden" accept="image/*" onChange={handleProfilePictureChange} disabled={isUpdatingProfile} />
                      </label>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-1">{user.name}</h2>
                  <p className="text-blue-600 dark:text-blue-400 font-medium mb-6">{user.role.toUpperCase()}</p>

                  <div className="w-full space-y-4">
                      <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <Mail size={18} className="text-gray-400 mr-3" />
                          <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white break-all">{user.email}</p>
                          </div>
                      </div>
                      <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <BookOpen size={18} className="text-gray-400 mr-3" />
                          <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">USN</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{user.usn || 'N/A'}</p>
                          </div>
                      </div>
                      <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <Home size={18} className="text-gray-400 mr-3" />
                          <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Hostel</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{user.hostelName || 'N/A'}</p>
                          </div>
                      </div>
                      <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <Phone size={18} className="text-gray-400 mr-3" />
                          <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{user.phoneNumber || 'N/A'}</p>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Change Password */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center mb-6">
                      <Lock size={20} className="mr-2 text-blue-500" />
                      Change Password
                  </h2>
                  
                  <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                          <input 
                              type="password" 
                              required
                              value={passwords.currentPassword}
                              onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                              placeholder="Enter current password"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                          <input 
                              type="password" 
                              required
                              value={passwords.newPassword}
                              onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                              placeholder="Enter new password"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                          <input 
                              type="password" 
                              required
                              value={passwords.confirmPassword}
                              onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                              placeholder="Confirm new password"
                          />
                      </div>
                      
                      <button 
                          type="submit" 
                          disabled={isUpdatingPassword}
                          className={`w-full py-3 rounded-xl font-bold text-white transition-all transform active:scale-[0.98] ${isUpdatingPassword ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md'}`}
                      >
                          {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                      </button>
                  </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileModal;

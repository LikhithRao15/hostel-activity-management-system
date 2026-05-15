import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Download, Users, CheckCircle, XCircle, Scissors, Plus, Trash2, Edit2, Calendar } from "lucide-react";

function AdminDashboard() {
  const [report, setReport] = useState(null);
  const [saloonServices, setSaloonServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // "overview", "saloon-services", "saloon-bookings"
  
  // Service Form State
  const [serviceForm, setServiceForm] = useState({ name: "", duration: "", price: "", gender: "Male" });
  const [editingServiceId, setEditingServiceId] = useState(null);

  const fetchReport = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/api/report/daily", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReport(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load reports");
    }
  };

  const fetchSaloonServices = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/api/saloon/services", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSaloonServices(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load services");
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchReport();
      await fetchSaloonServices();
      setIsLoading(false);
    };
    init();
  }, []);

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (editingServiceId) {
        await axios.put(`http://localhost:3000/api/saloon/services/${editingServiceId}`, serviceForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Service updated");
      } else {
        await axios.post("http://localhost:3000/api/saloon/services", serviceForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Service added");
      }
      setServiceForm({ name: "", duration: "", price: "", gender: "Male" });
      setEditingServiceId(null);
      fetchSaloonServices();
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const deleteService = async (id) => {
    if (!window.confirm("Delete this service?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/api/saloon/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Service deleted");
      fetchSaloonServices();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const generatePDF = () => {
    if (!report) return;
    
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text("Daily Facility & Saloon Report", 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 30);
    
    // Stats Summary
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Facility Stats", 14, 45);
    doc.setFontSize(10);
    doc.text(`Total Registrations: ${report.totalRegistrations} | Present: ${report.presentCount} | Absent: ${report.absentCount}`, 14, 52);

    doc.setFontSize(14);
    doc.text("Saloon Stats", 14, 65);
    doc.setFontSize(10);
    doc.text(`Total Bookings: ${report.saloonStats?.total} | Completed: ${report.saloonStats?.completed} | Pending: ${report.saloonStats?.pending}`, 14, 72);

    // Facility Table
    const activityColumn = ["Student Name", "USN", "Facility", "Status"];
    const activityRows = report.attendanceDetails.map(item => [
      item.registration?.student?.name || "Unknown",
      item.registration?.student?.usn || "N/A",
      item.registration?.activity?.activityName || "Unknown",
      item.status
    ]);

    doc.autoTable({
      head: [activityColumn],
      body: activityRows,
      startY: 80,
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202] },
    });

    // Saloon Table
    if (report.saloonBookings?.length > 0) {
        doc.addPage();
        doc.text("Saloon Bookings", 14, 22);
        const saloonColumn = ["Student Name", "USN", "Service", "Time", "Status"];
        const saloonRows = report.saloonBookings.map(b => [
            b.user?.name || "Unknown",
            b.user?.usn || "N/A",
            b.service?.name || "Unknown",
            `${new Date(b.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
            b.status
        ]);
        doc.autoTable({
            head: [saloonColumn],
            body: saloonRows,
            startY: 30,
            theme: 'grid',
            headStyles: { fillColor: [219, 39, 119] },
        });
    }

    doc.save(`daily_report_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("PDF Report downloaded!");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!report) return null;

  const pieData = [
    { name: 'Present', value: report.presentCount },
    { name: 'Absent', value: report.absentCount },
  ];
  const COLORS = ['#10b981', '#ef4444'];

  const activityMap = {};
  report.attendanceDetails.forEach(item => {
    const actName = item.registration?.activity?.activityName || "Unknown";
    activityMap[actName] = (activityMap[actName] || 0) + 1;
  });
  const barData = Object.keys(activityMap).map(key => ({
    name: key.length > 15 ? key.substring(0, 15) + '...' : key,
    registrations: activityMap[key]
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            System overview and saloon management
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                <button onClick={() => setActiveTab("overview")} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'overview' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Overview</button>
                <button onClick={() => setActiveTab("saloon-services")} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'saloon-services' ? 'bg-white shadow text-pink-600' : 'text-gray-500'}`}>Services</button>
                <button onClick={() => setActiveTab("saloon-bookings")} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'saloon-bookings' ? 'bg-white shadow text-pink-600' : 'text-gray-500'}`}>Bookings</button>
            </div>
            <button
                onClick={generatePDF}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
            >
                <Download size={18} />
                <span>PDF Report</span>
            </button>
        </div>
      </div>

      {activeTab === "overview" && (
        <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center">
                    <div className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl mr-4">
                        <Users size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Facilities</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{report.totalRegistrations}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center">
                    <div className="p-4 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-xl mr-4">
                        <Scissors size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Saloon Bookings</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{report.saloonStats?.total}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center">
                    <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl mr-4">
                        <CheckCircle size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Present (Facs)</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{report.presentCount}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center">
                    <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl mr-4">
                        <XCircle size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Absent (Facs)</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{report.absentCount}</p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Attendance Distribution</h2>
                <div className="h-64">
                    {report.presentCount === 0 && report.absentCount === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">No attendance data yet</div>
                    ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                        <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                    )}
                </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Registrations by Facility</h2>
                <div className="h-64">
                    {barData.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">No registrations yet</div>
                    ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} allowDecimals={false} />
                        <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                        <Bar dataKey="registrations" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                    )}
                </div>
                </div>
            </div>

            {/* Attendance Details Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Detailed Attendance Log</h2>
                </div>
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50/50 dark:bg-gray-900/20">
                    <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Facility</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {report.attendanceDetails.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{item.registration?.student?.name}</span>
                                    <span className="text-xs text-gray-500">{item.registration?.student?.usn}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="text-sm text-gray-900 dark:text-white">{item.registration?.activity?.activityName}</span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {item.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>
        </>
      )}

      {activeTab === "saloon-services" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                        <Plus size={20} className="mr-2" />
                        {editingServiceId ? "Edit Service" : "Add Service"}
                    </h2>
                    <form onSubmit={handleServiceSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Service Name</label>
                            <input 
                                type="text" 
                                required
                                value={serviceForm.name}
                                onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
                                className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Duration (min)</label>
                                <input 
                                    type="number" 
                                    required
                                    value={serviceForm.duration}
                                    onChange={(e) => setServiceForm({...serviceForm, duration: e.target.value})}
                                    className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Price (₹)</label>
                                <input 
                                    type="number" 
                                    required
                                    value={serviceForm.price}
                                    onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})}
                                    className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Gender</label>
                            <select 
                                value={serviceForm.gender}
                                onChange={(e) => setServiceForm({...serviceForm, gender: e.target.value})}
                                className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 outline-none"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <button className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-sm">
                            {editingServiceId ? "Update Service" : "Save Service"}
                        </button>
                        {editingServiceId && (
                            <button onClick={() => {setEditingServiceId(null); setServiceForm({name:"", duration:"", price:"", gender:"Male"})}} className="w-full py-2 text-gray-500 text-sm">Cancel</button>
                        )}
                    </form>
                </div>
            </div>

            <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Service</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Gender</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Info</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {saloonServices.map(service => (
                                <tr key={service._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{service.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${service.gender === 'Male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                                            {service.gender}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {service.duration} min | ₹{service.price}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => {setEditingServiceId(service._id); setServiceForm(service)}} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16}/></button>
                                        <button onClick={() => deleteService(service._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}

      {activeTab === "saloon-bookings" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
             <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">All Saloon Appointments</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Service</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Time</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {report.saloonBookings?.map(booking => (
                            <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{booking.user?.name}</span>
                                        <span className="text-xs text-gray-500">{booking.user?.usn}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm">{booking.service?.name}</td>
                                <td className="px-6 py-4 text-sm font-mono">
                                    {new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                        booking.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                        booking.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {booking.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
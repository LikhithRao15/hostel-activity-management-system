import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { UserPlus } from "lucide-react";
import BASE_URL from "../config/api";
import AnimatedBackground from "../components/AnimatedBackground";
import gsap from "gsap";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    usn: "",
    hostelName: "",
    gender: "Male",
    phoneNumber: "",
    facility: "",
    accessKey: "",
  });
  const [facilities, setFacilities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const cardRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/activity/all`);
        setFacilities(response.data);
      } catch (error) {
        console.error("Failed to fetch facilities", error);
      }
    };
    fetchFacilities();
  }, []);

  // GSAP entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(cardRef.current,
        { y: 60, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8 }
      );

      if (formRef.current) {
        tl.fromTo(formRef.current.children,
          { y: 25, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.06 },
          "-=0.4"
        );
      }
    });
    return () => ctx.revert();
  }, []);

  // 3D tilt effect
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -3;
      const rotateY = ((x - centerX) / centerX) * 3;

      gsap.to(card, {
        rotateX, rotateY,
        transformPerspective: 1000,
        duration: 0.4,
        ease: "power2.out"
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        rotateX: 0, rotateY: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.5)"
      });
    };

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const handleChange = (e) => {
    if (e.target.name === "role" && e.target.value === "student") {
      setFormData({ ...formData, role: "student", accessKey: "" });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post(`${BASE_URL}/api/auth/register`, formData);
      toast.success("Registration Successful! Please login.");
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Registration Failed");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 rounded-xl border bg-white/50 dark:bg-white/5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none input-glow";
  const inputStyle = { borderColor: 'var(--border-color)', color: 'var(--text-primary)' };
  const labelClasses = "block text-sm font-semibold mb-1.5";
  const labelStyle = { color: 'var(--text-secondary)' };

  // Count filled fields for progress
  const requiredFields = formData.role === "student"
    ? ["name", "email", "password", "usn", "hostelName", "gender", "phoneNumber"]
    : formData.role === "attender"
      ? ["name", "email", "password", "facility", "gender", "phoneNumber", "accessKey"]
      : formData.role === "admin"
        ? ["name", "email", "password", "gender", "phoneNumber", "accessKey"]
        : ["name", "email", "password", "gender", "phoneNumber"];
  const filledCount = requiredFields.filter(f => formData[f]).length;
  const progress = (filledCount / requiredFields.length) * 100;

  return (
    <div className="flex justify-center items-center min-h-screen px-4 py-8 relative overflow-hidden"
         style={{ background: 'var(--gradient-bg)' }}>

      <AnimatedBackground />

      <div
        ref={cardRef}
        className="glass-card p-8 sm:p-10 w-full max-w-md relative z-10"
        style={{ opacity: 0, transformStyle: 'preserve-3d' }}
      >
        <div ref={formRef}>
          {/* Icon + Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white mb-4 shadow-lg shadow-emerald-500/25 animate-float">
              <UserPlus size={28} />
            </div>
            <h1 className="text-3xl font-extrabold gradient-text-animated">
              Create Account
            </h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Join the hostel facility management system
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              <span>Form Progress</span>
              <span className="font-semibold">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 progress-bar-animated"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role */}
            <div>
              <label className={labelClasses} style={labelStyle}>Register As</label>
              <div className="relative">
                <select
                  name="role"
                  className={inputClasses + " appearance-none"}
                  style={inputStyle}
                  onChange={handleChange}
                  value={formData.role}
                >
                  <option value="student">Student</option>
                  <option value="attender">Attender</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4" style={{ color: 'var(--text-secondary)' }}>
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Security Access Key (Conditionally Rendered for Admin/Attender) */}
            {(formData.role === "admin" || formData.role === "attender") && (
              <div>
                <label className={labelClasses} style={labelStyle}>Security Access Key</label>
                <input
                  type="password"
                  name="accessKey"
                  placeholder="Enter security access key"
                  className={inputClasses}
                  style={inputStyle}
                  onChange={handleChange}
                  value={formData.accessKey || ""}
                  required
                />
              </div>
            )}

            {/* Name */}
            <div>
              <label className={labelClasses} style={labelStyle}>Full Name</label>
              <input type="text" name="name" placeholder="John Doe" className={inputClasses} style={inputStyle} onChange={handleChange} required />
            </div>

            {/* Email */}
            <div>
              <label className={labelClasses} style={labelStyle}>Email Address</label>
              <input type="email" name="email" placeholder="you@example.com" className={inputClasses} style={inputStyle} onChange={handleChange} required />
            </div>

            {/* Password */}
            <div>
              <label className={labelClasses} style={labelStyle}>Password</label>
              <input type="password" name="password" placeholder="••••••••" className={inputClasses} style={inputStyle} onChange={handleChange} required />
            </div>

            {/* Attender: Facility */}
            {formData.role === "attender" && (
              <div>
                <label className={labelClasses} style={labelStyle}>Assigned Facility</label>
                <select name="facility" className={inputClasses} style={inputStyle} onChange={handleChange} value={formData.facility} required>
                  <option value="">Select Facility</option>
                  <option value="Saloon">Saloon</option>
                  <option value="Badminton">Badminton</option>
                  <option value="Gym">Gym</option>
                  <option value="Swimming">Swimming</option>
                  {facilities.map((f) => {
                    if (["Saloon", "Badminton", "Gym", "Swimming"].includes(f.activityName)) return null;
                    return (
                      <option key={f._id} value={f.activityName}>
                        {f.activityName}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Student fields */}
            {formData.role === "student" && (
              <>
                <div>
                  <label className={labelClasses} style={labelStyle}>USN</label>
                  <input type="text" name="usn" placeholder="1AB23CD456" className={inputClasses} style={inputStyle} onChange={handleChange} required />
                </div>
                <div>
                  <label className={labelClasses} style={labelStyle}>Hostel Name</label>
                  <input type="text" name="hostelName" placeholder="Main Hostel" className={inputClasses} style={inputStyle} onChange={handleChange} required />
                </div>
              </>
            )}

            {/* Gender */}
            <div>
              <label className={labelClasses} style={labelStyle}>Gender</label>
              <select name="gender" className={inputClasses} style={inputStyle} onChange={handleChange} required>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Phone */}
            <div>
              <label className={labelClasses} style={labelStyle}>Phone Number</label>
              <input type="tel" name="phoneNumber" placeholder="9876543210" className={inputClasses} style={inputStyle} onChange={handleChange} required />
            </div>

            <button
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] flex items-center justify-center space-x-2 glow-button"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Already have an account?
            <Link to="/" className="font-bold ml-1 gradient-text hover:opacity-80 transition-opacity">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
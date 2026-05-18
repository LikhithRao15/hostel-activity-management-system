import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { LogIn } from "lucide-react";
import BASE_URL from "../config/api";
import AnimatedBackground from "../components/AnimatedBackground";
import gsap from "gsap";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const cardRef = useRef(null);
  const formRef = useRef(null);

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
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.08 },
          "-=0.4"
        );
      }
    });
    return () => ctx.revert();
  }, []);

  // 3D tilt effect on card
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;

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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${BASE_URL}/api/auth/login`,
        formData
      );
      const data = response.data;

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);

      toast.success("Login Successful!");

      if (data.user.role === "student") navigate("/student");
      else if (data.user.role === "admin") navigate("/admin");
      else if (data.user.role === "attender") navigate("/attender");
      else if (data.user.role === "superadmin") navigate("/superadmin");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Login Failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen px-4 relative overflow-hidden"
         style={{ background: 'var(--gradient-bg)' }}>

      <AnimatedBackground />

      <div
        ref={cardRef}
        className="glass-card p-8 sm:p-10 w-full max-w-md relative z-10"
        style={{ opacity: 0, transformStyle: 'preserve-3d' }}
      >
        <div ref={formRef}>
          {/* Icon + Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white mb-4 shadow-lg shadow-indigo-500/25 animate-float">
              <LogIn size={28} />
            </div>
            <h1 className="text-3xl font-extrabold gradient-text-animated">
              Welcome Back
            </h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Log in to manage your hostel activities
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border bg-white/50 dark:bg-white/5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none input-glow"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border bg-white/50 dark:bg-white/5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none input-glow"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                onChange={handleChange}
                required
              />
            </div>

            <button
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] flex items-center justify-center space-x-2 glow-button"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Don't have an account?
            <Link
              to="/register"
              className="font-bold ml-1 gradient-text hover:opacity-80 transition-opacity"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
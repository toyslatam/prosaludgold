import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ProSaludLogo from "@/components/ProSaludLogo";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);

  // Si ya hay sesión activa, ir directo al dashboard
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/demo/multi", { replace: true });
      setCheckingSession(false);
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Correo o contraseña incorrectos. Verifica tus datos.");
      setLoading(false);
    } else {
      navigate("/demo/multi", { replace: true });
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #0a1f1c 0%, #0d2d2a 40%, #0f3630 70%, #0a1f1c 100%)" }}
      >
        <div className="flex flex-col items-center gap-4">
          <ProSaludLogo size={64} />
          <svg className="animate-spin w-6 h-6 text-teal-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0a1f1c 0%, #0d2d2a 40%, #0f3630 70%, #0a1f1c 100%)" }}
    >
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #2dd4bf 0%, transparent 70%)" }} />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #0f766e 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #5eead4 0%, transparent 60%)" }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 mb-8"
        >
          <ProSaludLogo size={88} />
          <span className="text-2xl font-bold text-white tracking-tight">
            ProSalud <span className="text-teal-400">Gold</span>
          </span>
          <p className="text-xs tracking-widest uppercase" style={{ color: "rgba(94,234,212,0.45)", letterSpacing: "0.2em" }}>
            Gestión Clínica Inteligente
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl p-8 border shadow-2xl"
          style={{
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(24px)",
            borderColor: "rgba(255,255,255,0.12)",
          }}
        >
          <h1 className="text-2xl font-bold text-white mb-1">Bienvenido</h1>
          <p className="text-sm mb-7" style={{ color: "rgba(167,243,234,0.6)" }}>
            Inicia sesión para continuar
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="usuario@clinica.com"
                required
                className="h-11 border text-white placeholder:text-white/30 focus-visible:ring-teal-400/50 focus-visible:border-teal-400"
                style={{ background: "rgba(255,255,255,0.08)", borderColor: error ? "rgba(248,113,113,0.6)" : "rgba(255,255,255,0.15)" }}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  required
                  className="h-11 border text-white placeholder:text-white/30 pr-10 focus-visible:ring-teal-400/50 focus-visible:border-teal-400"
                  style={{ background: "rgba(255,255,255,0.08)", borderColor: error ? "rgba(248,113,113,0.6)" : "rgba(255,255,255,0.15)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 text-sm rounded-lg px-3 py-2.5"
                  style={{ background: "rgba(248,113,113,0.1)", color: "rgba(252,165,165,0.9)", border: "1px solid rgba(248,113,113,0.2)" }}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer select-none" style={{ color: "rgba(255,255,255,0.5)" }}>
                <input type="checkbox" className="rounded accent-teal-400" />
                Recordarme
              </label>
              <a href="#" className="text-teal-400 hover:text-teal-300 transition-colors text-sm">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 font-semibold text-white shadow-lg mt-1 bg-teal-600 hover:bg-teal-500"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Verificando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Iniciar sesión <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-7 pt-5 border-t text-center" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              © {new Date().getFullYear()} ProSalud Gold · Panamá
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;

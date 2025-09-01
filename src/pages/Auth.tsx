import { useState, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Shield, 
  Users, 
  ArrowRight, 
  CheckCircle, 
  Sparkles, 
  Globe, 
  BarChart3, 
  Zap,
  Building2,
  Target,
  Lock,
  Award,
  Activity,
  PieChart,
  LineChart,
  DollarSign,
  Briefcase,
  TrendingDown
} from "lucide-react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import gsap from "gsap";
// import { Particles } from "@/components/magicui/particles";

// Liquid Glass Card Component - Simplified without 3D effects
const LiquidGlassCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-slate-800/50 bg-gradient-to-br from-slate-900/40 via-slate-800/20 to-slate-900/40 backdrop-blur-2xl",
        "before:absolute before:inset-0 before:pointer-events-none before:bg-gradient-to-br before:from-slate-700/10 before:via-transparent before:to-slate-700/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
        "after:absolute after:inset-0 after:pointer-events-none after:bg-gradient-to-br after:from-transparent after:via-slate-600/5 after:to-transparent after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-700",
        "shadow-2xl shadow-black/20",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};
const Auth = () => {
  let user, loading, signIn, signUp;
  try {
    const authData = useAuth();
    user = authData.user;
    loading = authData.loading;
    signIn = authData.signIn;
    signUp = authData.signUp;
  } catch (error) {
    console.error("useAuth error:", error);
    user = null;
    loading = false;
    signIn = async () => ({ error: new Error("Authentication service unavailable") });
    signUp = async () => ({ error: new Error("Authentication service unavailable") });
  }
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    username: "",
  });

  // Redirect if already authenticated
  if (user && !loading) {
    return <Navigate to="/" replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signIn(formData.email, formData.password);
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signUp(formData.email, formData.password, formData.fullName, formData.username);
    setIsLoading(false);
  };

  // GSAP animations
  useEffect(() => {
    try {
    gsap.fromTo(".hero-title", 
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: "power3.out", delay: 0.2 }
    );
    
    gsap.fromTo(".hero-subtitle", 
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power2.out", delay: 0.6 }
    );
    
    gsap.fromTo(".feature-card", 
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.8, stagger: 0.2 }
    );
      } catch (error) {
      console.error("GSAP animation error:", error);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 overflow-x-hidden">
        <motion.div 
          className="flex flex-col items-center space-y-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <div className="w-20 h-20 border-4 border-slate-700 border-t-slate-400 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-slate-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <motion.p 
            className="text-slate-300 font-medium text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Loading your experience...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 overflow-x-hidden relative">
      
      {/* Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-slate-800/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-slate-700/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-slate-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
        {/* Hero Section */}
        <motion.div 
          className="text-white space-y-12 max-w-2xl"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <div className="space-y-8">
            <motion.div 
              className="flex items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="relative">
                <motion.div 
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 flex items-center justify-center shadow-2xl shadow-slate-900/50 border border-slate-600/30"
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  transition={{ duration: 0.3 }}
                >
                  <TrendingUp className="h-8 w-8 text-slate-200" />
                </motion.div>
                <motion.div
                  className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center border border-slate-800"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Award className="h-3 w-3 text-white" />
                </motion.div>
              </div>
              <div>
                <h1 className="hero-title text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-slate-200 to-slate-300">
                  Stockfolio
                </h1>
                <p className="text-slate-400 text-lg font-medium">Professional Investment Management</p>
              </div>
            </motion.div>
            
            <motion.p 
              className="hero-subtitle text-xl text-slate-300 max-w-lg leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Advanced portfolio analytics, institutional-grade security, and professional trading tools for serious investors and financial institutions.
            </motion.p>
          </div>
          
          <div className="space-y-6">
            <motion.div 
              className="feature-card flex items-start gap-5 p-6 bg-gradient-to-br from-slate-800/30 to-slate-900/20 backdrop-blur-xl rounded-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-500 group"
              whileHover={{ y: -3, scale: 1.01 }}
            >
              <div className="p-3 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex-shrink-0 mt-1 group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-slate-900/50 border border-slate-600/30">
                <BarChart3 className="h-6 w-6 text-slate-200" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-100 text-lg">Institutional Analytics</h3>
                <p className="text-slate-400">Professional-grade portfolio analysis with advanced risk metrics and performance attribution</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="feature-card flex items-start gap-5 p-6 bg-gradient-to-br from-slate-800/30 to-slate-900/20 backdrop-blur-xl rounded-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-500 group"
              whileHover={{ y: -3, scale: 1.01 }}
            >
              <div className="p-3 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex-shrink-0 mt-1 group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-slate-900/50 border border-slate-600/30">
                <Building2 className="h-6 w-6 text-slate-200" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-100 text-lg">Enterprise Platform</h3>
                <p className="text-slate-400">Built for financial institutions with multi-user management and compliance reporting</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="feature-card flex items-start gap-5 p-6 bg-gradient-to-br from-slate-800/30 to-slate-900/20 backdrop-blur-xl rounded-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-500 group"
              whileHover={{ y: -3, scale: 1.01 }}
            >
              <div className="p-3 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex-shrink-0 mt-1 group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-slate-900/50 border border-slate-600/30">
                <Lock className="h-6 w-6 text-slate-200" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-100 text-lg">Bank-Grade Security</h3>
                <p className="text-slate-400">SOC 2 Type II certified with end-to-end encryption and advanced threat protection</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Auth Forms */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="w-full max-w-md mx-auto"
        >
          <LiquidGlassCard className="w-full p-8">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600 rounded-t-3xl"></div>
            
            <CardHeader className="text-center pt-6 pb-8">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                <CardTitle className="text-3xl font-bold text-slate-100 mb-2">Access Platform</CardTitle>
                <CardDescription className="text-slate-400 text-lg">
                  Secure authentication for professional users
                </CardDescription>
              </motion.div>
            </CardHeader>
            
            <CardContent className="pb-8">
              <Tabs 
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-1.5 h-auto rounded-2xl mb-8">
                  <TabsTrigger 
                    value="signin" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-700/50 data-[state=active]:to-slate-600/50 data-[state=active]:text-slate-100 data-[state=active]:shadow-lg rounded-xl py-3 px-6 text-sm font-medium transition-all duration-300 hover:bg-slate-700/30 data-[state=active]:border data-[state=active]:border-slate-600/50"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-700/50 data-[state=active]:to-slate-600/50 data-[state=active]:text-slate-100 data-[state=active]:shadow-lg rounded-xl py-3 px-6 text-sm font-medium transition-all duration-300 hover:bg-slate-700/30 data-[state=active]:border data-[state=active]:border-slate-600/50"
                  >
                    Create Account
                  </TabsTrigger>
                </TabsList>
              
                <AnimatePresence mode="wait">
                  <TabsContent value="signin" className="mt-0">
                    <motion.form 
                      onSubmit={handleSignIn} 
                      className="space-y-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="space-y-2">
                        <Label htmlFor="signin-email" className="text-sm font-medium text-slate-200">Email Address</Label>
                        <div className="relative">
                          <Input
                            id="signin-email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="your@email.com"
                            required
                            className="bg-slate-800/50 border-slate-700/50 text-slate-100 placeholder-slate-400 h-14 focus:border-slate-500/50 focus:visible:ring-offset-0 focus:visible:ring-slate-500/30 rounded-2xl transition-all duration-300 text-base"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="signin-password" className="text-sm font-medium text-slate-200">Password</Label>
                          <a href="#" className="text-xs text-slate-400 hover:text-slate-300 transition-colors font-medium">Forgot password?</a>
                        </div>
                        <Input
                          id="signin-password"
                          name="password"
                          type="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          required
                          className="bg-slate-800/50 border-slate-700/50 text-slate-100 placeholder-slate-400 h-14 focus:border-slate-500/50 focus:visible:ring-offset-0 focus:visible:ring-slate-500/30 rounded-2xl transition-all duration-300 text-base"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-slate-400 pt-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        <span>I agree to the <a href="#" className="text-slate-300 hover:underline font-medium">Terms of Service</a> and <a href="#" className="text-slate-300 hover:underline font-medium">Privacy Policy</a></span>
                      </div>
                      
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <Button 
                          type="submit" 
                          className={cn(
                            "w-full h-14 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 hover:from-slate-600 hover:via-slate-500 hover:to-slate-600 text-slate-100 font-semibold rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-slate-900/50 hover:-translate-y-0.5 text-lg border border-slate-600/30",
                            isLoading && "opacity-70 cursor-not-allowed"
                          )}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <motion.div
                              className="flex items-center gap-2"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              <div className="w-5 h-5 border-2 border-slate-400/30 border-t-slate-200 rounded-full animate-spin"></div>
                              Signing in...
                            </motion.div>
                          ) : (
                            <motion.div
                              className="flex items-center gap-2"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              Sign In
                              <ArrowRight className="h-5 w-5" />
                            </motion.div>
                          )}
                        </Button>
                      </motion.div>
                    </motion.form>
                  </TabsContent>
                  
                  <TabsContent value="signup" className="mt-0">
                    <motion.form 
                      onSubmit={handleSignUp} 
                      className="space-y-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName" className="text-sm font-medium text-slate-200">Full Name</Label>
                          <Input
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            required
                            className="bg-slate-800/50 border-slate-700/50 text-slate-100 placeholder-slate-400 h-14 focus:border-slate-500/50 focus:visible:ring-offset-0 focus:visible:ring-slate-500/30 rounded-2xl transition-all duration-300 text-base"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="username" className="text-sm font-medium text-slate-200">Username</Label>
                          <Input
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            placeholder="johndoe"
                            required
                            className="bg-slate-800/50 border-slate-700/50 text-slate-100 placeholder-slate-400 h-14 focus:border-slate-500/50 focus:visible:ring-offset-0 focus:visible:ring-slate-500/30 rounded-2xl transition-all duration-300 text-base"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-sm font-medium text-slate-200">Email Address</Label>
                        <Input
                          id="signup-email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your@email.com"
                          required
                          className="bg-slate-800/50 border-slate-700/50 text-slate-100 placeholder-slate-400 h-14 focus:border-slate-500/50 focus:visible:ring-offset-0 focus:visible:ring-slate-500/30 rounded-2xl transition-all duration-300 text-base"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-sm font-medium text-slate-200">Password</Label>
                        <Input
                          id="signup-password"
                          name="password"
                          type="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          required
                          className="bg-slate-800/50 border-slate-700/50 text-slate-100 placeholder-slate-400 h-14 focus:border-slate-500/50 focus:visible:ring-offset-0 focus:visible:ring-slate-500/30 rounded-2xl transition-all duration-300 text-base"
                        />
                        <p className="text-xs text-slate-500 mt-2">Use 8+ characters with letters, numbers & symbols</p>
                      </div>
                      
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                          <span>I agree to the <a href="#" className="text-slate-300 hover:underline font-medium">Terms of Service</a> and <a href="#" className="text-slate-300 hover:underline font-medium">Privacy Policy</a></span>
                        </div>
                        
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <Button 
                            type="submit" 
                            className={cn(
                              "w-full h-14 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600 hover:from-slate-500 hover:via-slate-400 hover:to-slate-500 text-slate-100 font-semibold rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-slate-900/50 hover:-translate-y-0.5 text-lg border border-slate-500/30",
                              isLoading && "opacity-70 cursor-not-allowed"
                            )}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <motion.div
                                className="flex items-center gap-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                              >
                                <div className="w-5 h-5 border-2 border-slate-400/30 border-t-slate-200 rounded-full animate-spin"></div>
                                Creating account...
                              </motion.div>
                            ) : (
                              <motion.div
                                className="flex items-center gap-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                              >
                                Create Account
                                <ArrowRight className="h-5 w-5" />
                              </motion.div>
                            )}
                          </Button>
                        </motion.div>
                      </div>
                    </motion.form>
                  </TabsContent>
                </AnimatePresence>
              </Tabs>
            </CardContent>
            
            <CardFooter className="text-center text-sm text-slate-500 pb-6 px-8">
              <p>
                {activeTab === "signin" ? "Don't have an account? " : "Already have an account? "}
                <button 
                  type="button" 
                  onClick={() => setActiveTab(activeTab === "signin" ? "signup" : "signin")}
                  className="text-slate-300 hover:text-slate-200 font-medium transition-colors hover:underline"
                >
                  {activeTab === "signin" ? "Sign up" : "Sign in"}
                </button>
              </p>
            </CardFooter>
          </LiquidGlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;

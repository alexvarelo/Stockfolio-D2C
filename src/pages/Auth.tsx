import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import stockyLogo from '@/assets/stocky.png';
import { TrendingUp, Shield, Globe, ArrowRight, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const Auth = () => {
  const { user, loading, signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    username: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(formData.email, formData.password);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signUp(formData.email, formData.password, formData.fullName, formData.username);
    } finally {
      setIsLoading(false);
    }
  };

  if (user && !loading) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-background overflow-hidden">
      {/* Left Panel - Branding (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-950 text-white overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-600/20 blur-[120px]" />
          <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-purple-600/20 blur-[120px]" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-16 w-full h-full">
          <div className="flex items-center gap-4">
            <img src={stockyLogo} alt="Stocky" className="h-16 w-16 rounded-xl shadow-lg" />
            <span className="text-3xl font-bold tracking-tight">Stocky</span>
          </div>

          <div className="space-y-12 max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-6">
                The future of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  social investing
                </span>
              </h1>
              <p className="text-lg text-zinc-400 leading-relaxed">
                Join a global community of investors. Track portfolios, share insights, and grow your wealth with professional-grade tools.
              </p>
            </motion.div>

            <div className="space-y-6">
              <FeatureRow icon={TrendingUp} title="Advanced Analytics" description="Real-time tracking and performance metrics" delay={0.2} />
              <FeatureRow icon={Globe} title="Global Markets" description="Access to international exchanges and assets" delay={0.3} />
              <FeatureRow icon={Shield} title="Bank-Grade Security" description="Your data and assets are protected 24/7" delay={0.4} />
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <span>© 2024 Stocky Inc.</span>
            <a href="#" className="hover:text-zinc-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 relative">
        <div className="w-full max-w-md space-y-10">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-8 space-y-4">
            <img src={stockyLogo} alt="Stocky" className="h-24 w-24 rounded-2xl shadow-xl" />
            <h2 className="text-3xl font-bold">Stocky</h2>
          </div>

          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">
              {activeTab === 'signin' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-muted-foreground">
              {activeTab === 'signin'
                ? 'Enter your details to access your portfolio.'
                : 'Start your investment journey in seconds.'}
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-muted/50 rounded-full">
              <TabsTrigger value="signin" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Sign Up</TabsTrigger>
            </TabsList>

            <div className="relative min-h-[320px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <TabsContent value="signin" className="mt-0 space-y-6">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Input
                          type="email"
                          name="email"
                          placeholder="Email address"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="h-12 bg-muted/30 border-muted-foreground/20 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <Input
                          type="password"
                          name="password"
                          placeholder="Password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          className="h-12 bg-muted/30 border-muted-foreground/20 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                        />
                        <div className="flex justify-end">
                          <Button variant="link" className="px-0 h-auto text-xs text-muted-foreground hover:text-primary">
                            Forgot password?
                          </Button>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full h-12 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign In'}
                        {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup" className="mt-0 space-y-6">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Input
                            type="text"
                            name="fullName"
                            placeholder="Full Name"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                            className="h-12 bg-muted/30 border-muted-foreground/20 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <Input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleInputChange}
                            required
                            className="h-12 bg-muted/30 border-muted-foreground/20 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Input
                          type="email"
                          name="email"
                          placeholder="Email address"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="h-12 bg-muted/30 border-muted-foreground/20 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <Input
                          type="password"
                          name="password"
                          placeholder="Create a password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          className="h-12 bg-muted/30 border-muted-foreground/20 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                        />
                        <p className="text-xs text-muted-foreground ml-1">
                          Must be at least 8 characters long
                        </p>
                      </div>
                      <Button
                        type="submit"
                        className="w-full h-12 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Account'}
                        {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                      </Button>
                    </form>
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

const FeatureRow = ({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay }}
    className="flex items-start gap-4"
  >
    <div className="mt-1 p-2 rounded-lg bg-zinc-900 border border-zinc-800">
      <Icon className="h-5 w-5 text-blue-400" />
    </div>
    <div>
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="text-sm text-zinc-400">{description}</p>
    </div>
  </motion.div>
);

export default Auth;

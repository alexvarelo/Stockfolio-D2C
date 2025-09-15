import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Home, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const handleGoHome = () => navigate("/");
  const handleGoBack = () => navigate(-1);
  const handleReload = () => window.location.reload();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <motion.div 
        className="max-w-3xl w-full text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo with floating animation */}
        <motion.div
          className="mx-auto w-32 h-32 md:w-52 md:h-52"
          animate={{ y: [0, -15, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <motion.div 
            className="w-full h-fullshadow-lg flex items-center justify-center overflow-hidden"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img 
              src="/socky_empty_bg.png" 
              alt="Stockfolio Logo"
              className="w-full h-full object-contain p-4"
              draggable={false}
            />
          </motion.div>
        </motion.div>

        {/* 404 Content */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.h1 
              className="text-8xl md:text-9xl font-bold text-blue-600 mb-2"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{
                duration: 2,
              }}
            >
              404
            </motion.h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
              Oops! Page not found
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </motion.div>

          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleGoHome}
                variant="default"
                className="group relative overflow-hidden px-6 py-3 text-base w-full sm:w-auto"
              >
                <Home className="w-5 h-5 mr-2" />
                Go to Homepage
                <motion.span
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: -100, opacity: 0 }}
                  whileHover={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleGoBack}
                variant="outline"
                className="group relative overflow-hidden px-6 py-3 text-base w-full sm:w-auto"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Go Back
                <motion.span
                  className="absolute inset-0 bg-gray-100"
                  initial={{ x: -100, opacity: 0 }}
                  whileHover={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </Button>
            </motion.div>
          </motion.div>

          <motion.div 
            className="mt-8 pt-6 border-t border-gray-100 text-sm text-gray-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p>Looking for something specific? Try our search feature.</p>
            <p className="text-xs mt-1">(Error: Page not found - {location.pathname})</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;

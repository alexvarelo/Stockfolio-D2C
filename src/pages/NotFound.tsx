import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Dog, Home, Search, RotateCcw } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <motion.div 
        className="max-w-3xl w-full text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
          <motion.div 
            className="text-center"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div 
              className="flex justify-center mb-6"
              variants={item}
            >
              <div className="relative">
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -top-2 -left-2 bg-yellow-100 rounded-full p-2"
                >
                  <Search className="h-5 w-5 text-yellow-600" />
                </motion.div>
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                >
                  <Dog className="h-24 w-24 text-amber-500 mx-auto" />
                </motion.div>
              </div>
            </motion.div>
            
            <motion.h1 
              className="text-6xl font-bold text-gray-900 mb-2"
              variants={item}
            >
              404
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-600 mb-8"
              variants={item}
            >
              Woof! We couldn't sniff out that page
            </motion.p>
            
            <motion.p 
              className="text-gray-500 mb-8"
              variants={item}
            >
              The page you're looking for might have been moved, deleted, or doesn't exist.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={item}
            >
              <Button 
                onClick={() => navigate('/')}
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Try Again
              </Button>
            </motion.div>
            
            <motion.div 
              className="mt-8 pt-6 border-t border-gray-100 text-sm text-gray-400"
              variants={item}
            >
              <p>Looking for something specific? Try our search feature.</p>
              <p className="text-xs mt-1">(Error: Page not found - {location.pathname})</p>
            </motion.div>
          </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;

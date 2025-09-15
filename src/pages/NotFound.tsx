import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Home, RotateCcw, User, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface NotFoundProps {
  type?: 'page' | 'user' | 'portfolio';
  message?: string;
}

const NotFound = ({ type = 'page', message }: NotFoundProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const notFoundItem = pathSegments[pathSegments.length - 1] || 'page';

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  // Determine the type of 404 page to show
  const getNotFoundContent = () => {
    switch (type) {
      case 'user':
        return {
          title: 'User Not Found',
          description: message || `The user "${notFoundItem}" doesn't exist or has been removed.`,
          icon: <User className="w-16 h-16 text-blue-500 mb-4" />
        };
      case 'portfolio':
        return {
          title: 'Portfolio Not Found',
          description: message || `The portfolio "${notFoundItem}" doesn't exist or you don't have permission to view it.`,
          icon: <Briefcase className="w-16 h-16 text-blue-500 mb-4" />
        };
      default:
        return {
          title: 'Page Not Found',
          description: message || "The page you're looking for doesn't exist or has been moved.",
          icon: null
        };
    }
  };

  const { title, description, icon } = getNotFoundContent();
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
        {/* Not Found Illustration */}
        <motion.div className="mb-4 ml-8">
          <motion.div
            className="mx-auto w-32 h-32 md:w-48 md:h-48 relative"
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <motion.div 
              className="w-full h-full flex items-center justify-center bg-transparent"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img 
                src="/stocky_not_found.png" 
                alt="Not Found"
                className="w-full h-full object-contain mix-blend-multiply"
                style={{ backgroundColor: 'transparent' }}
                draggable={false}
              />
            </motion.div>
            {icon && (
              <motion.div 
                className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-3 rounded-full shadow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
              >
                {icon}
              </motion.div>
            )}
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
              Oops! {title}
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {description}
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

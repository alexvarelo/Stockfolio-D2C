import { motion } from "framer-motion";
import { MarketResearch } from "@/components/discover/MarketResearch";

export default function MarketResearchPage() {
  return (
    <motion.div
      className="py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Market Research</h1>
        <div className="flex items-center space-x-2">
          <p className="text-muted-foreground">
            Real-time market insights and trending stocks with comprehensive financial data
          </p>
        </div>
      </div>

      <MarketResearch />
    </motion.div>
  );
}

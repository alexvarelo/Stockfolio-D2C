import { motion } from "framer-motion";
import { WorldMap } from "@/components/ui/world-map";
import { MarketResearch } from "@/components/discover/MarketResearch";

export default function MarketResearchPage() {
  return (
    <div className="min-h-screen">
      {/* World Map Landing Section */}
      {/* <div className="py-5 md:py-10 w-full">
        <div className="max-w-7xl mx-auto text-center px-4">
          <p className="font-extrabold text-4xl md:text-6xl mb-2">
            Global{" "}
            <span className="text-blue-600">
              {"Market data".split("").map((word, idx) => (
                <motion.span
                  key={idx}
                  className="inline-block"
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: idx * 0.04 }}
                >
                  {word}
                </motion.span>
              ))}
            </span>
          </p>
          <p className="text-xs md:text-lg text-neutral-500 max-w-3xl mx-auto py-4">
            Access comprehensive market data from exchanges worldwide. Track stocks, indices, and market trends across 60+ global markets with real-time updates and advanced analytics.
          </p>
        </div>
        <WorldMap
          dots={[
            // North America
            { start: { lat: 40.7128, lng: -74.0060 }, end: { lat: 34.0522, lng: -118.2437 } }, // NYC to LA
            { start: { lat: 43.6532, lng: -79.3832 }, end: { lat: 45.4215, lng: -75.6972 } }, // Toronto to Ottawa

            // Europe
            { start: { lat: 51.5074, lng: -0.1278 }, end: { lat: 48.8566, lng: 2.3522 } }, // London to Paris
            { start: { lat: 52.5200, lng: 13.4050 }, end: { lat: 50.1109, lng: 8.6821 } }, // Berlin to Frankfurt
            { start: { lat: 41.9028, lng: 12.4964 }, end: { lat: 45.4642, lng: 9.1900 } }, // Rome to Milan

            // Asia-Pacific
            { start: { lat: 35.6762, lng: 139.6503 }, end: { lat: 37.5665, lng: 126.9780 } }, // Tokyo to Seoul
            { start: { lat: 22.3193, lng: 114.1694 }, end: { lat: 1.3521, lng: 103.8198 } }, // Hong Kong to Singapore
            { start: { lat: 28.6139, lng: 77.2090 }, end: { lat: 19.0760, lng: 72.8777 } }, // Delhi to Mumbai

            // Americas
            { start: { lat: -23.5505, lng: -46.6333 }, end: { lat: -22.9068, lng: -43.1729 } }, // São Paulo to Rio
            { start: { lat: 19.4326, lng: -99.1332 }, end: { lat: 20.6597, lng: -103.3496 } }, // Mexico City to Guadalajara

            // Global connections
            { start: { lat: 40.7128, lng: -74.0060 }, end: { lat: 51.5074, lng: -0.1278 } }, // NYC to London
            { start: { lat: 35.6762, lng: 139.6503 }, end: { lat: 40.7128, lng: -74.0060 } }, // Tokyo to NYC
            { start: { lat: 51.5074, lng: -0.1278 }, end: { lat: 28.6139, lng: 77.2090 } }, // London to Delhi
          ]}
        />
      </div> */}

      {/* Market Research Component */}
      <div className="bg-background">
        <MarketResearch />
      </div>
    </div>
  );
}
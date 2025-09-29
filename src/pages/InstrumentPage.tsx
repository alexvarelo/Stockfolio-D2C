import { useParams } from "react-router-dom";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ArrowUp,
  ArrowDown,
  ExternalLink,
  BarChart2,
  Calculator,
  Bot,
  MessageCircle,
  MessageSquare,
} from "lucide-react";
import { InstrumentChatbot } from "@/components/chat/InstrumentChatbot";
import { DrawerTrigger } from "@/components/ui/drawer";
import { StockyChatDrawer } from "@/components/chat/StockyChatDrawer";
import { useGetStockInfoApiV1StockTickerGet } from "@/api/stock/stock";
import type { StockInfo, CompanyInfo } from "@/api/financialDataApi.schemas";
import { PriceChart } from "@/components/charts/PriceChart";
import { NewsSection } from "@/components/news/NewsSection";
import { InstrumentPosts } from "@/components/instruments/InstrumentPosts";
import { InstrumentPostsCarousel } from "@/components/instruments/InstrumentPostsCarousel";
import { InvestmentSimulator } from "@/components/instruments/InvestmentSimulator";

// Formatter components
import {
  MoneyDisplay,
  PercentageDisplay,
  LargeNumberDisplay,
  PriceChangeDisplay,
  FormattedNumber,
} from "@/components/formatters";

// Extended CompanyInfo with additional properties
interface ExtendedCompanyInfo extends CompanyInfo {
  market_cap?: number;
  shares_outstanding?: number;
  dividend_yield?: number;
  pe_ratio?: number;
  eps?: number;
  profit_margin?: number;
  currency?: string;
}

// Type for additional data
interface AdditionalData {
  marketCap?: number;
  trailingPE?: number;
  epsTrailingTwelveMonths?: number;
  dividendYield?: number;
  fiftyTwoWeekLow?: number;
  fiftyTwoWeekHigh?: number;
  beta?: number;
  totalRevenue?: number;
  ebitda?: number;
  profitMargins?: number;
  fiftyDayAverage?: number;
  twoHundredDayAverage?: number;
  sharesOutstanding?: number;
  heldPercentInstitutions?: number;
  [key: string]: any; // For any other properties that might exist
}

export function InstrumentPage() {
  const { ticker } = useParams<{ ticker: string }>();
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const {
    data: response,
    isLoading,
    error,
  } = useGetStockInfoApiV1StockTickerGet(ticker || "");

  // Type assertion for the response data
  const stockInfo = response?.data as
    | (StockInfo & {
        company_info: ExtendedCompanyInfo;
      })
    | undefined;

  const {
    price_data: priceData,
    company_info: companyInfo,
    additional_data,
  } = stockInfo || {};
  const additionalData: AdditionalData =
    (additional_data as AdditionalData) || {};

  if (isLoading) {
    return (
      <div className="space-y-6 p-4">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !stockInfo || !priceData || !companyInfo) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              Failed to load stock information. Please try again later.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const renderInfoCard = (title: string, value: React.ReactNode) => {
    // If value is undefined, null, or empty, return N/A
    if (value === undefined || value === null || value === "") {
      return (
        <div className="flex flex-col space-y-1 p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="font-medium">N/A</div>
        </div>
      );
    }

    return (
      <div className="flex flex-col space-y-1 p-4 border rounded-lg">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className="font-medium">{value}</div>
      </div>
    );
  };

  // Mock portfolios - replace with actual portfolio data from your app
  const userPortfolios = [
    { id: 'portfolio1', name: 'My Portfolio' },
    { id: 'portfolio3', name: 'Growth' },
  ];

  // The StockyChatDrawer is always rendered but controlled by isChatOpen
  return (
    <div className="space-y-6">
      <StockyChatDrawer 
        ticker={ticker || ''} 
        isOpen={isChatOpen} 
        onOpenChange={setIsChatOpen}
        portfolios={userPortfolios}
      />
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <h1 className="text-3xl font-bold">
            {stockInfo.company_info?.name || ticker} ({stockInfo.symbol})
          </h1>
          <div className="flex flex-col items-end gap-2">
            {additionalData.website && (
              <a
                href={additionalData.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-500 hover:underline"
              >
                Company Website <ExternalLink className="ml-1 h-4 w-4" />
              </a>
            )}
            <Button 
              variant="outline"
              size="sm"
              className="gap-2 text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setIsChatOpen(true)}
            >
              <MessageCircle className="h-4 w-4" />
              <span>Ask Stocky</span>
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold">
            <MoneyDisplay
              value={priceData.current_price}
              currency={companyInfo.currency}
            />
          </span>
          <span
            className={`flex items-center text-sm ${
              (priceData.change_percent || 0) >= 0
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {(priceData.change_percent || 0) >= 0 ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
            <PriceChangeDisplay value={priceData.change_percent} /> Today
          </span>
        </div>
      </div>

      {/* Chart - Full width on all screens */}
      <div className="mb-6">
        <PriceChart
          ticker={ticker || ""}
          currency={companyInfo?.currency || "USD"}
        />
      </div>

      {/* Posts Carousel */}
      {ticker && <InstrumentPostsCarousel ticker={ticker} />}
      {/* Tabs for Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="simulation" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            <span>Simulation</span>
          </TabsTrigger>
          <TabsTrigger value="discussion" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Community</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Financial Highlights and Key Executives */}
            <div className="space-y-6 lg:col-span-2">
              {/* Company Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Industry
                        </h3>
                        <p>{additionalData.industry || "N/A"}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Sector
                        </h3>
                        <p>{additionalData.sector || "N/A"}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Employees
                        </h3>
                        <p>
                          {additionalData.fullTimeEmployees?.toLocaleString() ||
                            "N/A"}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Headquarters
                        </h3>
                        <p>
                          {[additionalData.city, additionalData.country]
                            .filter(Boolean)
                            .join(", ") || "N/A"}
                        </p>
                      </div>
                    </div>

                    {additionalData.longBusinessSummary && (
                      <div className="pt-4 border-t">
                        <h3 className="font-medium mb-2">About</h3>
                        <p className="text-sm text-muted-foreground">
                          {additionalData.longBusinessSummary}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Financial Highlights */}
              <Card>
                <CardHeader>
                  <CardTitle>Financial Highlights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {renderInfoCard(
                      "Market Cap",
                      <MoneyDisplay
                        value={companyInfo?.market_cap}
                        currency={companyInfo?.currency}
                      />
                    )}
                    {renderInfoCard(
                      "P/E (TTM)",
                      <FormattedNumber value={companyInfo?.pe_ratio} />
                    )}
                    {renderInfoCard(
                      "EPS (TTM)",
                      <FormattedNumber value={companyInfo?.eps} />
                    )}
                    {renderInfoCard(
                      "Dividend Yield",
                      <PercentageDisplay value={companyInfo?.dividend_yield} />
                    )}
                    {renderInfoCard(
                      "52-Week Range",
                      additionalData?.fiftyTwoWeekLow !== undefined &&
                        additionalData?.fiftyTwoWeekHigh !== undefined ? (
                        <span>
                          <MoneyDisplay
                            value={additionalData.fiftyTwoWeekLow}
                            currency={companyInfo?.currency}
                          />
                          {" - "}
                          <MoneyDisplay
                            value={additionalData.fiftyTwoWeekHigh}
                            currency={companyInfo?.currency}
                          />
                        </span>
                      ) : (
                        "N/A"
                      )
                    )}
                    {additionalData?.beta !== undefined &&
                      renderInfoCard(
                        "Beta",
                        <FormattedNumber value={additionalData.beta} />
                      )}
                    {additionalData?.totalRevenue !== undefined &&
                      renderInfoCard(
                        "Revenue (TTM)",
                        <MoneyDisplay
                          value={additionalData.totalRevenue}
                          currency={companyInfo?.currency}
                        />
                      )}
                    {additionalData?.ebitda !== undefined &&
                      renderInfoCard(
                        "EBITDA",
                        <MoneyDisplay
                          value={additionalData.ebitda}
                          currency={companyInfo?.currency}
                        />
                      )}
                    {additionalData?.profitMargins !== undefined &&
                      renderInfoCard(
                        "Profit Margin",
                        <PercentageDisplay
                          value={additionalData.profitMargins}
                        />
                      )}
                  </div>
                </CardContent>
              </Card>

              {/* Key Executives */}
              {additionalData.companyOfficers?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Key Executives</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {additionalData.companyOfficers.map(
                        (officer: any, index: number) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <h4 className="font-medium">{officer.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {officer.title}
                            </p>
                            {officer.totalPay && (
                              <p className="text-sm mt-1">
                                Total Pay:
                                <MoneyDisplay
                                  value={officer.totalPay}
                                  currency={companyInfo?.currency}
                                />
                              </p>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - News */}
            <div className="space-y-6">
              <NewsSection
                news={stockInfo.news}
                ticker={ticker}
                companyName={companyInfo?.name}
                isLoading={isLoading}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="simulation" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              {ticker && (
                <InvestmentSimulator 
                  ticker={ticker} 
                  currentPrice={priceData?.current_price || 0}
                  currency={companyInfo?.currency || 'USD'}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discussion" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              {ticker && <InstrumentPosts ticker={ticker} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

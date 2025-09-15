import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Lock, User, Users, Heart, HeartOff, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import { usePortfolioFollows } from '@/api/portfolio/usePortfolioFollows';
import { usePortfolio } from '@/api/portfolio/portfolio';
import { formatCurrency } from '@/lib/formatters';

export interface Holding {
  ticker: string;
  quantity: number;
  average_price?: number;
  current_price?: number;
  total_value?: number;
  total_invested?: number;
}

export interface PortfolioCardProps {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  is_default: boolean;
  created_at: string;
  holdings?: Holding[];
  isFollowing?: boolean;
  showOwner?: boolean;
  user_id?: string;
  user_name?: string;
  user_avatar_url?: string;
  className?: string;
  isOwnPortfolio?: boolean;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({
  id,
  name,
  description,
  is_public,
  is_default,
  created_at,
  holdings = [],
  isFollowing: initialIsFollowing = false,
  showOwner = false,
  user_id,
  user_name,
  user_avatar_url,
  className = '',
  isOwnPortfolio,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isFollowing, toggleFollow, isLoading: isFollowLoading, followersCount } = usePortfolioFollows(id);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleFollowClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      navigate('/auth/signin');
      return;
    }
    
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      await toggleFollow();
      toast({
        title: isFollowing ? 'Unfollowed portfolio' : 'Following portfolio',
        description: isFollowing 
          ? `You've unfollowed ${name}`
          : `You're now following ${name}`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update follow status',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Get portfolio data with metrics
  const { data: portfolioData, isLoading: isLoadingPrices } = usePortfolio(id, true);

  // Calculate portfolio metrics from portfolio data
  const portfolioMetrics = useMemo(() => {
    if (!portfolioData?.holdings?.length) {
      return {
        currentValue: 0,
        costBasis: 0,
        earnedLost: 0,
        isPositive: true,
        formattedPerformance: '0.00'
      };
    }

    const { currentValue, costBasis } = portfolioData.holdings.reduce<{ currentValue: number; costBasis: number }>(
      (acc, holding) => {
        const price = holding.current_price || 0;
        return {
          currentValue: acc.currentValue + (price * holding.quantity),
          costBasis: acc.costBasis + ((holding.average_price || 0) * holding.quantity)
        };
      },
      { currentValue: 0, costBasis: 0 }
    );

    const earnedLost = currentValue - costBasis;
    const performance = costBasis > 0 ? earnedLost / costBasis : 0;

    return {
      currentValue,
      costBasis,
      earnedLost,
      isPositive: earnedLost >= 0,
      formattedPerformance: (Math.abs(performance) * 100).toFixed(2)
    };
  }, [portfolioData]);


  // Calculate total number of holdings
  const totalHoldings = holdings?.length || 0;
  const hasHoldings = totalHoldings > 0;
  
  // Format creation date
  const formattedDate = useMemo(() => {
    try {
      return format(new Date(created_at), 'MMM d, yyyy');
    } catch (e) {
      return '';
    }
  }, [created_at]);

  return (
    <Card className={`hover:shadow-lg transition-shadow group h-full flex flex-col ${className}`}>
      <Link to={`/portfolio/${id}`} className="block h-full">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{name}</CardTitle>
              {showOwner && user_name && user_id && (
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Link 
                    to={`/user/${user_id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 hover:underline"
                  >
                    {user_avatar_url ? (
                      <img 
                        src={user_avatar_url} 
                        alt={user_name}
                        className="h-4 w-4 rounded-full"
                      />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    <span>{user_name}</span>
                  </Link>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!isOwnPortfolio ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  onClick={handleFollowClick}
                  disabled={isFollowLoading || isProcessing}
                >
                  {isFollowing ? (
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  ) : (
                    <Heart className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              ) : (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{followersCount || 0}</span>
                </div>
              )}
              {is_public ? (
                <Eye className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
          {description && (
            <CardDescription className="line-clamp-2 mt-2">
              {description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {/* Portfolio Value and Today's Performance */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Portfolio Value</p>
                <p className="text-2xl font-semibold">
                  {isLoadingPrices ? (
                    <span className="inline-block h-8 w-24 bg-muted rounded animate-pulse"></span>
                  ) : (
                    formatCurrency(portfolioMetrics.currentValue)
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Today</p>
                <p className={`text-sm ${
                  isLoadingPrices ? '' : (portfolioData?.today_change_percent || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {isLoadingPrices ? (
                    <span className="inline-block h-4 w-24 bg-muted rounded animate-pulse"></span>
                  ) : (
                    `${(portfolioData?.today_change_percent || 0).toFixed(2)}% • ${formatCurrency(portfolioData?.today_change || 0)}`
                  )}
                </p>
              </div>
            </div>

            {/* Total Invested and Total Return */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Invested</p>
                <p className="text-sm">
                  {isLoadingPrices ? (
                    <span className="inline-block h-4 w-20 bg-muted rounded animate-pulse"></span>
                  ) : (
                    formatCurrency(portfolioMetrics.costBasis)
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Return</p>
                <p className={`text-sm ${
                  !isLoadingPrices && (portfolioMetrics.earnedLost >= 0 ? 'text-green-500' : 'text-red-500')
                }`}>
                  {isLoadingPrices ? (
                    <span className="inline-block h-4 w-24 bg-muted rounded animate-pulse"></span>
                  ) : (
                    `${portfolioMetrics.formattedPerformance}% • ${formatCurrency(portfolioMetrics.earnedLost)}`
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Holdings</span>
              {isLoadingPrices ? (
                <span className="inline-block h-4 w-12 bg-muted rounded animate-pulse"></span>
              ) : (
                <span>{totalHoldings} {totalHoldings === 1 ? 'asset' : 'assets'}</span>
              )}
            </div>
            
            {hasHoldings && (
            <div className="space-y-2">
              <div className="space-y-1">
                {holdings.slice(0, 3).map((holding, index) => (
                  <div key={`${holding.ticker}-${index}`} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {holding.ticker}
                    </span>
                    <span>{holding.quantity} shares</span>
                  </div>
                ))}
                {holdings.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{holdings.length - 3} more
                  </p>
                )}
              </div>
            </div>
          )}
          </div>
          
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Created {formattedDate}
            </p>
          </div>
          
          <div className="pt-2 flex items-center justify-end text-sm text-primary font-medium">
            View details <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

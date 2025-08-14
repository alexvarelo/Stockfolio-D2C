import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Clock, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface Activity {
  id: string;
  type: 'buy' | 'sell' | 'dividend';
  symbol: string;
  shares?: number;
  price: number;
  amount: number;
  date: string;
}

export interface RecentActivityProps {
  className?: string;
}

export const RecentActivity = ({ className }: RecentActivityProps) => {
  // In a real app, you would fetch this data
  const isLoading = false;
  const activities: Activity[] = [
    {
      id: '1',
      type: 'buy',
      symbol: 'AAPL',
      shares: 5,
      price: 175.25,
      amount: 876.25,
      date: '2023-06-15T10:30:00Z',
    },
    {
      id: '2',
      type: 'dividend',
      symbol: 'MSFT',
      amount: 42.5,
      price: 0,
      date: '2023-06-14T09:15:00Z',
    },
    {
      id: '3',
      type: 'sell',
      symbol: 'GOOGL',
      shares: 2,
      price: 125.75,
      amount: 251.5,
      date: '2023-06-13T14:20:00Z',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'sell':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'dividend':
        return <DollarSign className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Card className={cn(className)}>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className="mt-0.5">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <span className="font-medium">
                  {activity.type === 'buy' && `Bought ${activity.shares} ${activity.symbol}`}
                  {activity.type === 'sell' && `Sold ${activity.shares} ${activity.symbol}`}
                  {activity.type === 'dividend' && `Dividend from ${activity.symbol}`}
                </span>
                <span className={`text-sm font-medium ${activity.type === 'sell' ? 'text-red-500' : 'text-green-500'}`}>
                  {activity.type === 'sell' ? '-' : '+'}${activity.amount.toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDate(activity.date)}
                {activity.type !== 'dividend' && (
                  <span className="ml-2">@ ${activity.price.toFixed(2)}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

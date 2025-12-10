import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { TopPortfolio } from '@/api/portfolio/useTopPortfolios';
import { cn } from '@/lib/utils';

interface LeaderboardCardProps {
    portfolio: TopPortfolio;
    rank: number;
}

const getTrophyColor = (rank: number) => {
    switch (rank) {
        case 1:
            return 'from-yellow-400 via-yellow-500 to-yellow-600'; // Gold
        case 2:
            return 'from-gray-300 via-gray-400 to-gray-500'; // Silver
        case 3:
            return 'from-orange-300 via-orange-400 to-orange-500'; // Bronze
        default:
            return 'from-primary/20 to-primary/10';
    }
};

const getTrophyIcon = (rank: number) => {
    if (rank <= 3) {
        return <Trophy className="h-6 w-6" />;
    }
    return null;
};

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({ portfolio, rank }) => {
    const isTopThree = rank <= 3;
    const trophyColor = getTrophyColor(rank);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rank * 0.05, duration: 0.3 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="relative"
        >
            <Link to={`/portfolio/${portfolio.id}`}>
                <Card
                    className={cn(
                        'overflow-hidden transition-all duration-300 hover:shadow-xl',
                        isTopThree && 'border-2'
                    )}
                    style={
                        isTopThree
                            ? {
                                borderImage: `linear-gradient(135deg, ${rank === 1
                                    ? '#FFD700, #FFA500'
                                    : rank === 2
                                        ? '#C0C0C0, #A8A8A8'
                                        : '#CD7F32, #B8860B'
                                    }) 1`,
                            }
                            : {}
                    }
                >
                    {/* Gradient background for top 3 */}
                    {isTopThree && (
                        <div
                            className={cn(
                                'absolute inset-0 bg-gradient-to-br opacity-5',
                                trophyColor
                            )}
                        />
                    )}

                    <div className="relative p-6">
                        <div className="flex items-center gap-4">
                            {/* Rank Badge */}
                            <div
                                className={cn(
                                    'flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg shrink-0',
                                    isTopThree
                                        ? `bg-gradient-to-br ${trophyColor} text-white shadow-lg`
                                        : 'bg-muted text-muted-foreground'
                                )}
                            >
                                {isTopThree ? getTrophyIcon(rank) : rank}
                            </div>

                            {/* Portfolio Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-lg truncate">{portfolio.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <Avatar className="h-5 w-5">
                                        <AvatarImage src={portfolio.user.avatar_url || ''} />
                                        <AvatarFallback className="text-xs">
                                            {portfolio.user.full_name?.[0] || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm text-muted-foreground truncate">
                                        {portfolio.user.full_name || `@${portfolio.user.username}`}
                                    </span>
                                </div>
                            </div>

                            {/* Performance */}
                            <div className="text-right shrink-0">
                                <div
                                    className={cn(
                                        'flex items-center gap-1 text-lg font-bold',
                                        portfolio.total_return_percentage >= 0
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-red-600 dark:text-red-400'
                                    )}
                                >
                                    <TrendingUp className="h-5 w-5" />
                                    {portfolio.total_return_percentage >= 0 ? '+' : ''}
                                    {portfolio.total_return_percentage.toFixed(2)}%
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                    ${portfolio.total_value.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </Link>
        </motion.div>
    );
};

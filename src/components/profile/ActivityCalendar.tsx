import React, { useState, useMemo } from 'react';
import { 
  format, 
  startOfWeek, 
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  isToday as isTodayFns
} from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  PlusCircle, 
  ArrowUpDown,
  ListPlus
} from 'lucide-react';

// Define event types
export type EventType = 'post' | 'portfolio' | 'transaction' | 'watchlist';

export interface ActivityEvent {
  id: string;
  title: string;
  type: EventType;
  date: Date;
  description?: string;
  link?: string;
}

// Mock data - in a real app, this would come from an API
const mockEvents: ActivityEvent[] = [
  {
    id: '1',
    title: 'Created a new post',
    type: 'post',
    date: new Date(2025, 8, 10),
    description: 'Shared thoughts on market trends',
    link: '/posts/1'
  },
  {
    id: '2',
    title: 'Added AAPL to watchlist',
    type: 'watchlist',
    date: new Date(2025, 8, 12),
    description: 'Added to Technology Watchlist',
    link: '/watchlists/tech'
  },
  {
    id: '3',
    title: 'Created Growth Portfolio',
    type: 'portfolio',
    date: new Date(2025, 8, 15),
    description: 'Initial investment: $10,000',
    link: '/portfolios/growth'
  },
  {
    id: '4',
    title: 'Bought 10 shares of MSFT',
    type: 'transaction',
    date: new Date(2025, 8, 16),
    description: 'Price: $320.45 per share',
    link: '/transactions/4'
  },
];

const eventTypeStyles = {
  post: { 
    backgroundColor: '#3b82f6', 
    borderColor: '#2563eb',
    icon: FileText
  },
  portfolio: { 
    backgroundColor: '#10b981', 
    borderColor: '#059669',
    icon: PlusCircle
  },
  transaction: { 
    backgroundColor: '#8b5cf6', 
    borderColor: '#7c3aed',
    icon: ArrowUpDown
  },
  watchlist: { 
    backgroundColor: '#f59e0b', 
    borderColor: '#d97706',
    icon: ListPlus
  },
};

// Get all days in the current month view
const getDaysInMonth = (date: Date) => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const startDay = startOfWeek(start, { weekStartsOn: 1 }); // Monday
  const endDay = endOfWeek(end, { weekStartsOn: 1 }); // Monday
  
  const days = [];
  let day = startDay;
  
  while (day <= endDay) {
    days.push(day);
    day = addDays(day, 1);
  }
  
  return days;
};

export const ActivityCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const days = useMemo(() => getDaysInMonth(currentDate), [currentDate]);
  
  const weeks = useMemo(() => {
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  }, [days]);

  const isCurrentMonth = (day: Date) => isSameMonth(day, currentDate);
  
  const getEventsForDay = (day: Date) => {
    return mockEvents.filter(event => isSameDay(event.date, day));
  };

  const handleEventClick = (event: ActivityEvent) => {
    if (event.link) {
      window.location.href = event.link;
    }
  };

  return (
    <div className="w-full space-y-4">
      <CardTitle>Activity Calendar</CardTitle>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">
              {format(currentDate, 'MMMM yyyy')}
            </h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                className="h-8 text-xs"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      <CardContent className="p-4">
        <div className="mb-4">
          <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-muted-foreground mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {weeks.map((week, weekIndex) => (
              <React.Fragment key={weekIndex}>
                {week.map((day, dayIndex) => {
                  const dayEvents = getEventsForDay(day);
                  const isToday = isTodayFns(day);
                  const isCurrentMonthDay = isCurrentMonth(day);
                  
                  return (
                    <div 
                      key={dayIndex} 
                      className={`min-h-24 p-2 border rounded-md ${
                        isCurrentMonthDay ? 'bg-background' : 'bg-muted/20'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`text-sm font-medium ${
                          isToday
                            ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center'
                            : isCurrentMonthDay
                              ? 'text-foreground' 
                              : 'text-muted-foreground/50'
                        }`}>
                          {format(day, 'd')}
                        </span>
                        {isToday && (
                          <span className="text-xs text-primary">Today</span>
                        )}
                      </div>
                      <div className="mt-1 space-y-1 max-h-20 overflow-y-auto">
                        {dayEvents.map(event => (
                          <div 
                            key={event.id}
                            className="text-xs p-1 rounded truncate flex items-center gap-1.5"
                            style={{
                              backgroundColor: eventTypeStyles[event.type].backgroundColor,
                              borderLeft: `3px solid ${eventTypeStyles[event.type].borderColor}`,
                              color: 'white',
                            }}
                            onClick={() => handleEventClick(event)}
                          >
                            {React.createElement(eventTypeStyles[event.type].icon, {
                              className: 'h-3 w-3 flex-shrink-0',
                              'aria-hidden': 'true'
                            })}
                            <span className="truncate">{event.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityCalendar;

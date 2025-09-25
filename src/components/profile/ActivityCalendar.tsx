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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  PlusCircle, 
  ArrowUpDown,
  ListPlus,
  Loader2,
  Calendar,
  ExternalLink,
  X
} from 'lucide-react';
import { useActivityEvents, type EventType } from '@/hooks/useActivityEvents';

// Re-export types from useActivityEvents
export type { EventType } from '@/hooks/useActivityEvents';

export interface ActivityEvent {
  id: string;
  title: string;
  type: EventType;
  date: Date;
  description?: string;
  link?: string;
}


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

interface ActivityCalendarProps {
  userId: string;
}

export const ActivityCalendar: React.FC<ActivityCalendarProps> = ({ userId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<ActivityEvent | null>(null);
  const { data: events = [], isLoading } = useActivityEvents(userId);
  
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
    return events.filter(event => isSameDay(event.date, day));
  };

  const handleEventClick = (event: ActivityEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        {selectedEvent && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div 
                  className="p-2 rounded-lg"
                  style={{
                    backgroundColor: `${eventTypeStyles[selectedEvent.type].backgroundColor}15`,
                    color: eventTypeStyles[selectedEvent.type].borderColor,
                  }}
                >
                  {React.createElement(eventTypeStyles[selectedEvent.type].icon, { className: 'h-5 w-5' })}
                </div>
                <DialogTitle className="text-lg">{selectedEvent.title}</DialogTitle>
              </div>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{format(selectedEvent.date, 'PPP')}</span>
              </div>
              
              {selectedEvent.description && (
                <div className="text-sm">
                  <p className="font-medium mb-1">Details:</p>
                  <p className="text-muted-foreground">{selectedEvent.description}</p>
                </div>
              )}
              
              {selectedEvent.link && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4"
                  onClick={() => window.open(selectedEvent.link, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
      
      <Card className="h-full flex flex-col">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium">
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
      <CardContent className="p-2 flex-1">
        <div className="flex flex-col h-full">
          <div className="grid grid-cols-7 gap-0.5 text-center text-xs font-medium text-muted-foreground mb-1">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <div key={i} className="py-1">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5 flex-1">
            {weeks.map((week, weekIndex) => (
              <React.Fragment key={weekIndex}>
                {week.map((day, dayIndex) => {
                  const dayEvents = getEventsForDay(day);
                  const isToday = isTodayFns(day);
                  const isCurrentMonthDay = isCurrentMonth(day);
                  
                  return (
                    <div 
                      key={dayIndex} 
                      className={`flex flex-col border rounded-sm ${
                        isCurrentMonthDay ? 'bg-background' : 'bg-muted/20'
                      }`}
                    >
                      <div className="flex justify-between items-center p-1">
                        <span className={`text-xs font-medium w-5 h-5 flex items-center justify-center ${
                          isToday
                            ? 'bg-primary text-primary-foreground rounded-full'
                            : isCurrentMonthDay
                              ? 'text-foreground' 
                              : 'text-muted-foreground/50'
                        }`}>
                          {format(day, 'd')}
                        </span>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        {dayEvents.slice(0, 1).map(event => {
                          const Icon = eventTypeStyles[event.type].icon;
                          return (
                            <div 
                              key={event.id}
                              className="text-[10px] p-0.5 rounded-sm truncate flex items-center gap-1 cursor-pointer hover:opacity-90 transition-opacity"
                              style={{
                                backgroundColor: `${eventTypeStyles[event.type].backgroundColor}15`,
                                borderLeft: `2px solid ${eventTypeStyles[event.type].borderColor}`,
                              }}
                              onClick={(e) => handleEventClick(event, e)}
                            >
                              <Icon className="h-2.5 w-2.5 flex-shrink-0" />
                              <span className="truncate">{event.title}</span>
                            </div>
                          );
                        })}
                        {dayEvents.length > 1 && (
                          <div className="text-[10px] text-muted-foreground text-center">
                            +{dayEvents.length - 1} more
                          </div>
                        )}
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

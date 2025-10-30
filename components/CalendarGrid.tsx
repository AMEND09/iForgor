import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { CalendarEvent } from '@/types';
import { colors } from '@/utils/colors';
import { parseDateValue, toDateKey } from '@/utils/date';

interface CalendarGridProps {
  events: CalendarEvent[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

const { width } = Dimensions.get('window');
const MIN_DAY_WIDTH = 44; // minimum touchable width per day on small screens
const calculatedDayWidth = (width - 48) / 7; // 7 days with padding
const dayWidth = Math.max(MIN_DAY_WIDTH, calculatedDayWidth);

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  events,
  currentDate,
  onDateChange,
}) => {
  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return {
      days,
      monthName: firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      currentMonth: month,
    };
  }, [currentDate]);

  const eventsByDate = useMemo(() => {
    const grouped: { [key: string]: CalendarEvent[] } = {};
    events.forEach(event => {
      const parsed = parseDateValue(event.date);
      if (!parsed) return;
      const dateKey = toDateKey(parsed);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [events]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    onDateChange(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return toDateKey(date) === toDateKey(today);
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === monthData.currentMonth;
  };

  const getDayEvents = (date: Date) => {
    return eventsByDate[toDateKey(date)] || [];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return colors.error[500];
      case 'medium': return colors.warning[500];
      case 'low': return colors.accent[500];
      default: return colors.neutral[400];
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateMonth('prev')}
        >
          <ChevronLeft size={20} color={colors.neutral[600]} strokeWidth={2} />
        </TouchableOpacity>
        
        <Text style={styles.monthTitle}>{monthData.monthName}</Text>
        
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateMonth('next')}
        >
          <ChevronRight size={20} color={colors.neutral[600]} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekHeader}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <View key={day} style={[styles.dayHeader, { width: dayWidth }]}>
            <Text style={styles.dayHeaderText}>{day}</Text>
          </View>
        ))}
      </View>

      <ScrollView style={styles.calendarGrid} showsVerticalScrollIndicator={false}>
        <View style={styles.weeksContainer}>
          {Array.from({ length: 6 }, (_, weekIndex) => (
            <View key={weekIndex} style={styles.week}>
              {monthData.days.slice(weekIndex * 7, (weekIndex + 1) * 7).map((date, dayIndex) => {
                const dayEvents = getDayEvents(date);
                const isCurrentMonthDay = isCurrentMonth(date);
                const isTodayDate = isToday(date);
                
                return (
                  <View key={dayIndex} style={[styles.day, { width: dayWidth }]}>
                    <View style={[
                      styles.dayNumber,
                      isTodayDate && styles.todayNumber,
                      !isCurrentMonthDay && styles.otherMonthNumber,
                    ]}>
                      <Text style={[
                        styles.dayNumberText,
                        isTodayDate && styles.todayNumberText,
                        !isCurrentMonthDay && styles.otherMonthText,
                      ]}>
                        {date.getDate()}
                      </Text>
                    </View>
                    
                    <View style={styles.eventsContainer}>
                      {dayEvents.slice(0, 3).map(event => (
                        <View
                          key={event.id}
                          style={[
                            styles.eventDot,
                            { backgroundColor: getPriorityColor(event.priority) }
                          ]}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <Text style={styles.moreEvents}>+{dayEvents.length - 3}</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  navButton: {
  padding: 12,
  borderRadius: 10,
  backgroundColor: colors.neutral[100],
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  weekHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  dayHeader: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral[500],
  },
  calendarGrid: {
    flexGrow: 0,
  },
  weeksContainer: {
    paddingBottom: 16,
  },
  week: {
    flexDirection: 'row',
  },
  day: {
    minHeight: 72,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.neutral[100],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  dayNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  todayNumber: {
    backgroundColor: colors.primary[600],
  },
  otherMonthNumber: {
    opacity: 0.3,
  },
  dayNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral[700],
  },
  todayNumberText: {
    color: '#FFFFFF',
  },
  otherMonthText: {
    color: colors.neutral[400],
  },
  eventsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 16,
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  moreEvents: {
    fontSize: 8,
    color: colors.neutral[500],
    fontWeight: '600',
  },
});
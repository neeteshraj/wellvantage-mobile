import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
} from 'react-native';
import {COLORS} from '../../../constants/colors';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

interface AvailabilitySlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  sessionName: string;
  isRepeating: boolean;
}

export const AvailabilityTab: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState('11:30 AM');
  const [endTime, setEndTime] = useState('11:45 AM');
  const [repeatSessions, setRepeatSessions] = useState(true);
  const [sessionName, setSessionName] = useState('PT');
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days: (number | null)[] = [];

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );
    setSelectedDate(newDate);
  };

  const isSelectedDate = (day: number): boolean => {
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    );
  };

  const isToday = (day: number): boolean => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    );
  };

  const handleCreate = () => {
    const newSlot: AvailabilitySlot = {
      id: Date.now().toString(),
      date: selectedDate.toISOString().split('T')[0],
      startTime,
      endTime,
      sessionName,
      isRepeating: repeatSessions,
    };
    setAvailabilitySlots([...availabilitySlots, newSlot]);
  };

  const formatDisplayDate = (date: Date): string => {
    const day = date.getDate();
    const month = MONTHS[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const calendarDays = generateCalendarDays();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Set Availability</Text>

        {/* Date Display */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date*</Text>
          <TouchableOpacity style={styles.dateInput}>
            <Text style={styles.dateInputText}>
              {formatDisplayDate(selectedDate)}
            </Text>
            <Text style={styles.calendarIcon}>📅</Text>
          </TouchableOpacity>
        </View>

        {/* Time Inputs */}
        <View style={styles.timeRow}>
          <View style={styles.timeInputGroup}>
            <Text style={styles.label}>Start Time*</Text>
            <TextInput
              style={styles.timeInput}
              value={startTime}
              onChangeText={setStartTime}
            />
          </View>
          <View style={styles.timeInputGroup}>
            <Text style={styles.label}>End Time*</Text>
            <TextInput
              style={styles.timeInput}
              value={endTime}
              onChangeText={setEndTime}
            />
          </View>
        </View>

        {/* Repeat Sessions Toggle */}
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Repeat Sessions</Text>
          <Switch
            value={repeatSessions}
            onValueChange={setRepeatSessions}
            trackColor={{false: COLORS.gray[300], true: COLORS.primaryLight}}
            thumbColor={repeatSessions ? COLORS.primary : COLORS.gray[100]}
          />
        </View>

        {/* Calendar */}
        <View style={styles.calendar}>
          {/* Month Navigation */}
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={handlePrevMonth}>
              <Text style={styles.navArrow}>{'<'}</Text>
            </TouchableOpacity>
            <Text style={styles.monthYear}>
              {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>
            <TouchableOpacity onPress={handleNextMonth}>
              <Text style={styles.navArrow}>{'>'}</Text>
            </TouchableOpacity>
          </View>

          {/* Day Headers */}
          <View style={styles.dayHeaders}>
            {DAYS.map((day, index) => (
              <Text key={index} style={styles.dayHeader}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {calendarDays.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  day !== null && isSelectedDate(day) && styles.selectedDay,
                  day !== null && isToday(day) && !isSelectedDate(day) && styles.todayDay,
                ]}
                onPress={() => day !== null && handleDateSelect(day)}
                disabled={day === null}>
                <Text
                  style={[
                    styles.dayText,
                    day !== null && isSelectedDate(day) && styles.selectedDayText,
                    day !== null && isToday(day) && !isSelectedDate(day) && styles.todayDayText,
                  ]}>
                  {day !== null ? day : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Session Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Session Name*</Text>
          <TextInput
            style={styles.sessionInput}
            value={sessionName}
            onChangeText={setSessionName}
            placeholder="Enter session name"
          />
        </View>

        {/* Create Button */}
        <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.light.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.light.primary,
    marginBottom: 8,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  dateInputText: {
    fontSize: 14,
    color: COLORS.text.light.primary,
  },
  calendarIcon: {
    fontSize: 18,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  timeInputGroup: {
    flex: 1,
  },
  timeInput: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.light.primary,
  },
  calendar: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navArrow: {
    fontSize: 18,
    color: COLORS.text.light.secondary,
    padding: 8,
  },
  monthYear: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.light.primary,
  },
  dayHeaders: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  dayHeader: {
    width: 36,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.light.secondary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  selectedDay: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
  },
  todayDay: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 18,
  },
  dayText: {
    fontSize: 14,
    color: COLORS.text.light.primary,
  },
  selectedDayText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  todayDayText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  sessionInput: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

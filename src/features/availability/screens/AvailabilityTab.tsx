import React, {useState, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {Calendar, DateData} from 'react-native-calendars';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {COLORS} from '../../../constants/colors';
import {availabilityService} from '../../../services/availability';
import {useAuth} from '../../../context/AuthContext';

// Icons
import calendarIcon from '../../../assets/icons/calendar.png';

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

export const AvailabilityTab: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const {isAuthenticated} = useAuth();
  const [selectedDates, setSelectedDates] = useState<string[]>([today]);
  const [startTime, setStartTime] = useState<Date>(() => {
    const date = new Date();
    date.setHours(11, 30, 0, 0);
    return date;
  });
  const [endTime, setEndTime] = useState<Date>(() => {
    const date = new Date();
    date.setHours(11, 45, 0, 0);
    return date;
  });
  const [repeatSessions, setRepeatSessions] = useState(true);
  const [sessionName, setSessionName] = useState('PT');
  const [isLoading, setIsLoading] = useState(false);

  // Time picker state
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // Handle repeat sessions toggle change
  const handleRepeatSessionsChange = (value: boolean) => {
    setRepeatSessions(value);
    // When switching to single date mode, keep only the first selected date
    if (!value && selectedDates.length > 1) {
      setSelectedDates([selectedDates[0]]);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = MONTHS[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatTime = (date: Date): string => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  const handleDateSelect = (day: DateData) => {
    if (repeatSessions) {
      // Multi-select mode: toggle the date in the array
      setSelectedDates(prev => {
        if (prev.includes(day.dateString)) {
          // Remove if already selected (but keep at least one date)
          if (prev.length > 1) {
            return prev.filter(d => d !== day.dateString);
          }
          return prev;
        } else {
          // Add the date
          return [...prev, day.dateString].sort();
        }
      });
    } else {
      // Single-select mode: replace the date
      setSelectedDates([day.dateString]);
    }
  };

  const handleStartTimeChange = (
    _event: DateTimePickerEvent,
    date?: Date,
  ) => {
    if (Platform.OS === 'android') {
      setShowStartTimePicker(false);
    }
    if (date) {
      setStartTime(date);
    }
  };

  const handleEndTimeChange = (
    _event: DateTimePickerEvent,
    date?: Date,
  ) => {
    if (Platform.OS === 'android') {
      setShowEndTimePicker(false);
    }
    if (date) {
      setEndTime(date);
    }
  };

  // Format time to 24-hour format for API (HH:mm)
  const formatTimeForApi = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleCreate = useCallback(async () => {
    if (!isAuthenticated) {
      Alert.alert('Error', 'Please sign in to create availability');
      return;
    }

    if (selectedDates.length === 0) {
      Alert.alert('Error', 'Please select at least one date');
      return;
    }

    setIsLoading(true);
    try {
      const response = await availabilityService.createBatchAvailability({
        dates: selectedDates,
        startTime: formatTimeForApi(startTime),
        endTime: formatTimeForApi(endTime),
        sessionName,
      });

      Alert.alert(
        'Success',
        `Created ${response.availabilityBlocks.length} availability slot(s)`,
      );

      // Reset to single date (today) after successful creation
      setSelectedDates([today]);
    } catch (error) {
      console.error('Failed to create availability:', error);
      Alert.alert('Error', 'Failed to create availability. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, selectedDates, startTime, endTime, sessionName, today]);

  // Build markedDates object for all selected dates
  const markedDates = selectedDates.reduce((acc, date) => {
    acc[date] = {
      selected: true,
      selectedColor: COLORS.primary,
    };
    return acc;
  }, {} as Record<string, {selected: boolean; selectedColor: string}>);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
      overScrollMode="never">
      <View style={styles.content}>
        <Text style={styles.title}>Set Availability</Text>

        {/* Date Display */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date*</Text>
          <View style={styles.dateInput}>
            <Text style={styles.dateInputText}>
              {selectedDates.length === 1
                ? formatDate(selectedDates[0])
                : `${selectedDates.length} dates selected`}
            </Text>
            <Image
              source={calendarIcon}
              style={styles.calendarIconImg}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Time Inputs */}
        <View style={styles.timeRow}>
          <View style={styles.timeInputGroup}>
            <Text style={styles.label}>Start Time*</Text>
            <TouchableOpacity
              style={styles.timeInput}
              onPress={() => setShowStartTimePicker(true)}>
              <Text style={styles.timeInputText}>{formatTime(startTime)}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.timeInputGroup}>
            <Text style={styles.label}>End Time*</Text>
            <TouchableOpacity
              style={styles.timeInput}
              onPress={() => setShowEndTimePicker(true)}>
              <Text style={styles.timeInputText}>{formatTime(endTime)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Time Pickers */}
        {showStartTimePicker && (
          <DateTimePicker
            value={startTime}
            mode="time"
            is24Hour={false}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleStartTimeChange}
          />
        )}
        {showEndTimePicker && (
          <DateTimePicker
            value={endTime}
            mode="time"
            is24Hour={false}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleEndTimeChange}
          />
        )}

        {/* Repeat Sessions Toggle */}
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Repeat Sessions</Text>
          <Switch
            value={repeatSessions}
            onValueChange={handleRepeatSessionsChange}
            trackColor={{false: COLORS.gray[300], true: COLORS.primaryLight}}
            thumbColor={repeatSessions ? COLORS.primary : COLORS.gray[100]}
          />
        </View>

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <Calendar
            current={selectedDates[0]}
            onDayPress={handleDateSelect}
            markedDates={markedDates}
            minDate={today}
            theme={{
              backgroundColor: COLORS.white,
              calendarBackground: COLORS.white,
              textSectionTitleColor: COLORS.text.light.secondary,
              selectedDayBackgroundColor: COLORS.primary,
              selectedDayTextColor: COLORS.white,
              todayTextColor: COLORS.primary,
              dayTextColor: COLORS.text.light.primary,
              textDisabledColor: COLORS.gray[300],
              arrowColor: COLORS.text.light.secondary,
              monthTextColor: COLORS.text.light.primary,
              textDayFontFamily: 'Poppins-Regular',
              textMonthFontFamily: 'Poppins-SemiBold',
              textDayHeaderFontFamily: 'Poppins-Medium',
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 12,
            }}
            style={styles.calendar}
          />
        </View>

        {/* Session Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Session Name*</Text>
          <TextInput
            style={styles.sessionInput}
            value={sessionName}
            onChangeText={setSessionName}
            placeholder="Enter session name"
            placeholderTextColor={COLORS.text.light.secondary}
          />
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={[styles.createButton, isLoading && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.createButtonText}>Create</Text>
          )}
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
    paddingBottom: 32,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.text.light.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: COLORS.text.light.primary,
    marginBottom: 8,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  dateInputText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: COLORS.text.light.primary,
  },
  calendarIconImg: {
    width: 20,
    height: 20,
    tintColor: COLORS.text.light.secondary,
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
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  timeInputText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: COLORS.text.light.primary,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: COLORS.text.light.primary,
  },
  calendarContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  calendar: {
    borderRadius: 8,
  },
  sessionInput: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 14,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: COLORS.text.light.primary,
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
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.white,
  },
});

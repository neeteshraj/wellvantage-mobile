import React, {useState, useCallback, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import {Calendar, DateData} from 'react-native-calendars';
import {COLORS} from '../../../constants/colors';
import {Client, clientService} from '../../../services/client/clientService';
import {
  availabilityService,
  AvailabilityBlock,
} from '../../../services/availability/availabilityService';
import {useAuth} from '../../../context/AuthContext';

// Icons
import trashIcon from '../../../assets/icons/trash.png';

export const BookSlotsTab: React.FC = () => {
  const {user} = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [availableSlots, setAvailableSlots] = useState<AvailabilityBlock[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Fetch clients on mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoadingClients(true);
        const fetchedClients = await clientService.getClients();
        setClients(fetchedClients);
        if (fetchedClients.length > 0) {
          setSelectedClient(fetchedClients[0]);
        }
      } catch (error) {
        console.error('Failed to fetch clients:', error);
      } finally {
        setIsLoadingClients(false);
      }
    };

    fetchClients();
  }, []);

  // Fetch available slots for the selected date
  const fetchAvailableSlots = useCallback(
    async (date: string) => {
      if (!user?.id) return;

      setIsLoadingSlots(true);
      try {
        const slots = await availabilityService.getAvailability(user.id, date);
        setAvailableSlots(Array.isArray(slots) ? slots : []);
      } catch (error) {
        console.error('Failed to fetch availability:', error);
        setAvailableSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    },
    [user?.id],
  );

  // Fetch slots when date changes
  useEffect(() => {
    fetchAvailableSlots(selectedDate);
  }, [selectedDate, fetchAvailableSlots]);

  const handleDateSelect = useCallback((day: DateData) => {
    setSelectedDate(day.dateString);
  }, []);

  const handleBookSlot = useCallback((slotId: string) => {
    // Handle booking logic - for now just log
    console.log('Booking slot:', slotId);
  }, []);

  const handleDeleteSlot = useCallback((slotId: string) => {
    setAvailableSlots(prev => prev.filter(slot => slot.id !== slotId));
  }, []);

  const formatTime = (time: string): string => {
    // Convert 24h format (HH:mm) to 12h format (h:mm AM/PM)
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const formatExpiryDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getMarkedDates = useCallback(() => {
    const marked: Record<
      string,
      {selected?: boolean; selectedColor?: string; marked?: boolean; dotColor?: string}
    > = {};

    // Mark selected date
    if (selectedDate) {
      marked[selectedDate] = {
        selected: true,
        selectedColor: COLORS.primary,
      };
    }

    return marked;
  }, [selectedDate]);

  if (isLoadingClients) {
    return (
      <View style={styles.loadingFullScreen}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.title}>Book Client Slots</Text>
        {selectedClient ? (
          <Text style={styles.clientInfo}>
            {selectedClient.name} has {selectedClient.sessionsRemaining} sessions left to book
            by {formatExpiryDate(selectedClient.packageExpiryDate)}
          </Text>
        ) : (
          <Text style={styles.clientInfo}>No clients available</Text>
        )}
      </View>

      {/* Calendar Section */}
      <View style={styles.calendarContainer}>
        <Calendar
          onDayPress={handleDateSelect}
          markedDates={getMarkedDates()}
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
            dotColor: COLORS.primary,
            selectedDotColor: COLORS.white,
            arrowColor: COLORS.text.light.primary,
            monthTextColor: COLORS.text.light.primary,
            textDayFontFamily: 'Poppins-Regular',
            textMonthFontFamily: 'Poppins-SemiBold',
            textDayHeaderFontFamily: 'Poppins-Medium',
            textDayFontSize: 14,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 13,
          }}
        />
      </View>

      {/* Available Slots Section */}
      <View style={styles.slotsSection}>
        <Text style={styles.slotsTitle}>Available Slots:</Text>

        {isLoadingSlots ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={COLORS.primary} />
          </View>
        ) : availableSlots.length === 0 ? (
          <Text style={styles.noSlotsText}>No available slots for this date</Text>
        ) : (
          availableSlots.map(slot => (
            <View key={slot.id} style={styles.slotRow}>
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>
                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.openButton}
                onPress={() => handleBookSlot(slot.id)}>
                <Text style={styles.openButtonText}>Open</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteSlot(slot.id)}>
                <Image
                  source={trashIcon}
                  style={styles.trashIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingFullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  headerSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.text.light.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  clientInfo: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: COLORS.text.light.secondary,
    lineHeight: 20,
  },
  calendarContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  slotsSection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  slotsTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.text.light.primary,
    marginBottom: 16,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  noSlotsText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: COLORS.text.light.secondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeContainer: {
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
  },
  timeText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: COLORS.text.light.primary,
  },
  openButton: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginRight: 12,
  },
  openButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: COLORS.primary,
  },
  deleteButton: {
    padding: 8,
  },
  trashIcon: {
    width: 20,
    height: 20,
    tintColor: COLORS.error,
  },
});

import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Modal,
} from 'react-native';
import {COLORS} from '../../../constants/colors';

interface TimeSlot {
  id: string;
  time: string;
  isBooked: boolean;
  clientName?: string;
}

interface DaySlots {
  date: string;
  dayName: string;
  slots: TimeSlot[];
}

const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = 6; hour < 22; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      const displayTime = `${hour > 12 ? hour - 12 : hour}:${min.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
      slots.push({
        id: time,
        time: displayTime,
        isBooked: Math.random() > 0.7,
        clientName: Math.random() > 0.7 ? 'John Doe' : undefined,
      });
    }
  }
  return slots;
};

const MOCK_DAY_SLOTS: DaySlots[] = [
  {
    date: '2025-01-06',
    dayName: 'Monday',
    slots: generateTimeSlots(),
  },
  {
    date: '2025-01-07',
    dayName: 'Tuesday',
    slots: generateTimeSlots(),
  },
  {
    date: '2025-01-08',
    dayName: 'Wednesday',
    slots: generateTimeSlots(),
  },
];

export const BookSlotsTab: React.FC = () => {
  const [daySlots] = useState<DaySlots[]>(MOCK_DAY_SLOTS);
  const [selectedDay, setSelectedDay] = useState<DaySlots>(MOCK_DAY_SLOTS[0]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSlotPress = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setIsModalVisible(true);
  };

  const handleBookSlot = () => {
    // Handle booking logic
    setIsModalVisible(false);
  };

  const renderTimeSlot = ({item}: {item: TimeSlot}) => (
    <TouchableOpacity
      style={[styles.slotCard, item.isBooked && styles.bookedSlot]}
      onPress={() => handleSlotPress(item)}
      disabled={item.isBooked}>
      <Text style={[styles.slotTime, item.isBooked && styles.bookedSlotText]}>
        {item.time}
      </Text>
      {item.isBooked && item.clientName && (
        <Text style={styles.clientName}>{item.clientName}</Text>
      )}
      {!item.isBooked && (
        <Text style={styles.availableText}>Available</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Day Selector */}
      <View style={styles.daySelector}>
        {daySlots.map(day => (
          <TouchableOpacity
            key={day.date}
            style={[
              styles.dayTab,
              selectedDay.date === day.date && styles.selectedDayTab,
            ]}
            onPress={() => setSelectedDay(day)}>
            <Text
              style={[
                styles.dayTabText,
                selectedDay.date === day.date && styles.selectedDayTabText,
              ]}>
              {day.dayName.substring(0, 3)}
            </Text>
            <Text
              style={[
                styles.dayDate,
                selectedDay.date === day.date && styles.selectedDayDate,
              ]}>
              {day.date.split('-')[2]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Time Slots Grid */}
      <FlatList
        data={selectedDay.slots}
        renderItem={renderTimeSlot}
        keyExtractor={item => item.id}
        numColumns={3}
        contentContainerStyle={styles.slotsGrid}
        columnWrapperStyle={styles.slotsRow}
      />

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.availableDot]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.bookedDot]} />
          <Text style={styles.legendText}>Booked</Text>
        </View>
      </View>

      {/* Booking Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book Slot</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Selected Time</Text>
              <Text style={styles.modalValue}>{selectedSlot?.time}</Text>

              <Text style={styles.modalLabel}>Date</Text>
              <Text style={styles.modalValue}>
                {selectedDay.dayName}, {selectedDay.date}
              </Text>

              <TouchableOpacity
                style={styles.bookButton}
                onPress={handleBookSlot}>
                <Text style={styles.bookButtonText}>Confirm Booking</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  daySelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  dayTab: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  selectedDayTab: {
    backgroundColor: COLORS.primary,
  },
  dayTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.light.secondary,
  },
  selectedDayTabText: {
    color: COLORS.white,
  },
  dayDate: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.light.primary,
    marginTop: 4,
  },
  selectedDayDate: {
    color: COLORS.white,
  },
  slotsGrid: {
    padding: 16,
  },
  slotsRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  slotCard: {
    width: '31%',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  bookedSlot: {
    backgroundColor: COLORS.gray[200],
    borderColor: COLORS.gray[300],
  },
  slotTime: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  bookedSlotText: {
    color: COLORS.text.light.secondary,
  },
  clientName: {
    fontSize: 11,
    color: COLORS.text.light.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  availableText: {
    fontSize: 11,
    color: COLORS.success,
    marginTop: 4,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  availableDot: {
    backgroundColor: COLORS.primary,
  },
  bookedDot: {
    backgroundColor: COLORS.gray[300],
  },
  legendText: {
    fontSize: 12,
    color: COLORS.text.light.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  closeIcon: {
    fontSize: 18,
    color: COLORS.white,
  },
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 14,
    color: COLORS.text.light.secondary,
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.light.primary,
    marginBottom: 16,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

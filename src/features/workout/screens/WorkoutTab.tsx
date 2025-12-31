import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import {COLORS} from '../../../constants/colors';

interface WorkoutPlan {
  id: string;
  name: string;
  days: number;
}

interface Exercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
}

interface DayPlan {
  id: string;
  dayNumber: number;
  bodyPart: string;
  exercises: Exercise[];
}

const MOCK_WORKOUT_PLANS: WorkoutPlan[] = [
  {id: '1', name: "Beginner's Workout - 3 Days", days: 3},
  {id: '2', name: "Beginner's Full Body - 1 Day", days: 1},
];

export const WorkoutTab: React.FC = () => {
  const [workoutPlans, setWorkoutPlans] =
    useState<WorkoutPlan[]>(MOCK_WORKOUT_PLANS);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [workoutName, setWorkoutName] = useState('');
  const [selectedDay, setSelectedDay] = useState(1);
  const [bodyPart, setBodyPart] = useState('Chest');
  const [exercises, setExercises] = useState<Exercise[]>([
    {id: '1', name: 'Chest', sets: '', reps: '5-8'},
    {id: '2', name: 'Bench Press', sets: '8', reps: '3'},
    {id: '3', name: 'Bench Press', sets: '8', reps: '5'},
    {id: '4', name: 'Planks', sets: '3', reps: '30 secs'},
  ]);
  const [notes, setNotes] = useState('');

  const handleDeletePlan = (id: string) => {
    setWorkoutPlans(plans => plans.filter(plan => plan.id !== id));
  };

  const handleAddExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: '',
      sets: '',
      reps: '',
    };
    setExercises([...exercises, newExercise]);
  };

  const handleDeleteExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const handleSubmit = () => {
    if (workoutName.trim()) {
      const newPlan: WorkoutPlan = {
        id: Date.now().toString(),
        name: workoutName,
        days: selectedDay,
      };
      setWorkoutPlans([...workoutPlans, newPlan]);
      setIsModalVisible(false);
      setWorkoutName('');
      setExercises([]);
      setNotes('');
    }
  };

  const renderWorkoutPlan = ({item}: {item: WorkoutPlan}) => (
    <View style={styles.planItem}>
      <Text style={styles.planName}>{item.name}</Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeletePlan(item.id)}>
        <Text style={styles.deleteIcon}>🗑</Text>
      </TouchableOpacity>
    </View>
  );

  const renderExercise = ({item, index}: {item: Exercise; index: number}) => (
    <View style={styles.exerciseRow}>
      <Text style={styles.exerciseName}>{item.name || `Exercise ${index + 1}`}</Text>
      <View style={styles.exerciseInputs}>
        <TextInput
          style={styles.smallInput}
          value={item.sets}
          onChangeText={text => {
            const updated = [...exercises];
            updated[index].sets = text;
            setExercises(updated);
          }}
          placeholder="Sets"
          keyboardType="numeric"
        />
        <TextInput
          style={styles.smallInput}
          value={item.reps}
          onChangeText={text => {
            const updated = [...exercises];
            updated[index].reps = text;
            setExercises(updated);
          }}
          placeholder="Reps"
        />
        <TouchableOpacity
          style={styles.deleteExerciseButton}
          onPress={() => handleDeleteExercise(item.id)}>
          <Text style={styles.deleteIcon}>🗑</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Dropdown */}
      <TouchableOpacity style={styles.dropdown}>
        <Text style={styles.dropdownText}>Custom Workout Plans</Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>

      {/* Workout Plans List */}
      <FlatList
        data={workoutPlans}
        renderItem={renderWorkoutPlan}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setIsModalVisible(true)}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* Add Workout Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Workout Plan</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}>
                <Text style={styles.closeIcon}>←</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Workout Name Input */}
              <TextInput
                style={styles.workoutNameInput}
                placeholder="Beginner's Workout - 3 days"
                value={workoutName}
                onChangeText={setWorkoutName}
              />

              {/* Day Tabs */}
              <View style={styles.dayTabs}>
                <TouchableOpacity
                  style={[styles.dayTab, selectedDay === 1 && styles.activeDayTab]}>
                  <Text
                    style={[
                      styles.dayTabText,
                      selectedDay === 1 && styles.activeDayTabText,
                    ]}>
                    Day 1
                  </Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.bodyPartInput}
                  value={bodyPart}
                  onChangeText={setBodyPart}
                  placeholder="Body Part"
                />
              </View>

              {/* Add Day Button */}
              <TouchableOpacity style={styles.addDayButton}>
                <Text style={styles.addDayButtonText}>+</Text>
              </TouchableOpacity>

              {/* Exercises Header */}
              <View style={styles.exercisesHeader}>
                <Text style={styles.exercisesHeaderText}>Sets</Text>
                <Text style={styles.exercisesHeaderText}>Reps</Text>
              </View>

              {/* Exercises List */}
              <FlatList
                data={exercises}
                renderItem={renderExercise}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />

              {/* Add Exercise Button */}
              <TouchableOpacity
                style={styles.addExerciseButton}
                onPress={handleAddExercise}>
                <Text style={styles.addExerciseButtonText}>+</Text>
              </TouchableOpacity>

              {/* Notes */}
              <TextInput
                style={styles.notesInput}
                placeholder="Bench Press; www.benchpress.com&#10;Eat Oats"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
              />
              <Text style={styles.wordsRemaining}>45 words remaining</Text>

              {/* Submit Button */}
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </ScrollView>
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
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  dropdownText: {
    fontSize: 16,
    color: COLORS.text.light.primary,
  },
  dropdownArrow: {
    fontSize: 12,
    color: COLORS.text.light.secondary,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  planItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  planName: {
    fontSize: 14,
    color: COLORS.text.light.primary,
    flex: 1,
  },
  deleteButton: {
    padding: 8,
  },
  deleteIcon: {
    fontSize: 18,
    color: COLORS.error,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  addButtonText: {
    fontSize: 28,
    color: COLORS.white,
    lineHeight: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: 16,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  closeIcon: {
    fontSize: 20,
    color: COLORS.white,
  },
  modalScroll: {
    padding: 16,
  },
  workoutNameInput: {
    backgroundColor: COLORS.gray[100],
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
  },
  dayTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayTab: {
    backgroundColor: COLORS.gray[200],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  activeDayTab: {
    backgroundColor: COLORS.primary,
  },
  dayTabText: {
    fontSize: 14,
    color: COLORS.text.light.primary,
  },
  activeDayTabText: {
    color: COLORS.white,
  },
  bodyPartInput: {
    flex: 1,
    backgroundColor: COLORS.gray[100],
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  addDayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  addDayButtonText: {
    fontSize: 20,
    color: COLORS.white,
    lineHeight: 22,
  },
  exercisesHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 48,
    marginBottom: 8,
  },
  exercisesHeaderText: {
    fontSize: 12,
    color: COLORS.text.light.secondary,
    width: 60,
    textAlign: 'center',
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseName: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text.light.primary,
  },
  exerciseInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallInput: {
    width: 50,
    backgroundColor: COLORS.gray[100],
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    textAlign: 'center',
    marginHorizontal: 4,
  },
  deleteExerciseButton: {
    padding: 4,
    marginLeft: 4,
  },
  addExerciseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 16,
  },
  addExerciseButtonText: {
    fontSize: 20,
    color: COLORS.white,
    lineHeight: 22,
  },
  notesInput: {
    backgroundColor: COLORS.gray[100],
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  wordsRemaining: {
    fontSize: 12,
    color: COLORS.primary,
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

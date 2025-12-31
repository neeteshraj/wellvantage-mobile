import React, {useState, useCallback, useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  Easing,
} from 'react-native-reanimated';
import {COLORS} from '../../../constants/colors';
import {t} from '../../../i18n';
import {
  workoutService,
  WorkoutPlanListItem,
} from '../../../services/workout/workoutService';
import {useAuth} from '../../../context/AuthContext';

// Icons
import chevronDownIcon from '../../../assets/icons/chevron-down.png';
import trashIcon from '../../../assets/icons/trash.png';

interface Exercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
}

interface Day {
  id: string;
  dayNumber: number;
  bodyPart: string;
  exercises: Exercise[];
}


const SPRING_CONFIG = {
  damping: 20,
  stiffness: 300,
  mass: 0.5,
};

const TIMING_CONFIG = {
  duration: 300,
  easing: Easing.bezier(0.4, 0, 0.2, 1),
};

const ITEM_HEIGHT = 72;
const MAX_VISIBLE_ITEMS = 7;
const MAX_ACCORDION_HEIGHT = ITEM_HEIGHT * MAX_VISIBLE_ITEMS;
const MAX_NOTES_WORDS = 45;

const countWords = (text: string): number => {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
};

interface WorkoutTabProps {
  onFormVisibilityChange?: (isVisible: boolean) => void;
  onBackPress?: () => void;
  isFormVisible?: boolean;
}

export const WorkoutTab: React.FC<WorkoutTabProps> = ({
  onFormVisibilityChange,
  isFormVisible,
}) => {
  const {width: screenWidth} = useWindowDimensions();
  const {isAuthenticated} = useAuth();
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlanListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [workoutName, setWorkoutName] = useState('');
  const [days, setDays] = useState<Day[]>([]);
  const [notes, setNotes] = useState('');

  // Fetch workout plans on mount
  const fetchWorkoutPlans = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }
    try {
      setIsLoading(true);
      const response = await workoutService.getWorkoutPlans();
      setWorkoutPlans(response.workoutPlans);
    } catch (error) {
      console.error('Failed to fetch workout plans:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWorkoutPlans();
  }, [fetchWorkoutPlans]);

  // Animation values
  const progress = useSharedValue(0);
  const screenTransition = useSharedValue(0);

  const toggleAccordion = () => {
    const newState = !isAccordionOpen;
    setIsAccordionOpen(newState);
    progress.value = withSpring(newState ? 1 : 0, SPRING_CONFIG);
  };

  const openAddForm = useCallback(() => {
    setShowAddForm(true);
    screenTransition.value = withTiming(1, TIMING_CONFIG);
    onFormVisibilityChange?.(true);
  }, [screenTransition, onFormVisibilityChange]);

  const closeAddForm = useCallback(() => {
    screenTransition.value = withTiming(0, {
      ...TIMING_CONFIG,
      duration: 250,
    });
    onFormVisibilityChange?.(false);
    // Delay setting showAddForm to false until animation completes
    setTimeout(() => {
      setShowAddForm(false);
      // Reset form state
      setWorkoutName('');
      setDays([]);
      setNotes('');
    }, 250);
  }, [screenTransition, onFormVisibilityChange]);

  // Handle external back press (from header)
  const prevIsFormVisible = useRef(isFormVisible);
  useEffect(() => {
    // If isFormVisible changed from true to false externally, close the form
    if (prevIsFormVisible.current === true && isFormVisible === false && showAddForm) {
      closeAddForm();
    }
    prevIsFormVisible.current = isFormVisible;
  }, [isFormVisible, showAddForm, closeAddForm]);

  const animatedChevronStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      progress.value,
      [0, 1],
      [0, 180],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{rotate: `${rotation}deg`}],
    };
  });

  const animatedAccordionStyle = useAnimatedStyle(() => {
    const totalHeight = Math.min(
      workoutPlans.length * ITEM_HEIGHT,
      MAX_ACCORDION_HEIGHT,
    );
    const height = interpolate(
      progress.value,
      [0, 1],
      [0, totalHeight],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      progress.value,
      [0, 0.3, 1],
      [0, 0.5, 1],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      progress.value,
      [0, 1],
      [-10, 0],
      Extrapolation.CLAMP,
    );
    return {
      height,
      opacity,
      transform: [{translateY}],
    };
  });

  // Screen transition animations
  const animatedListStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      screenTransition.value,
      [0, 1],
      [0, -screenWidth],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      screenTransition.value,
      [0, 0.5, 1],
      [1, 0.5, 0],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{translateX}],
      opacity,
    };
  });

  const animatedFormStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      screenTransition.value,
      [0, 1],
      [screenWidth, 0],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      screenTransition.value,
      [0, 0.5, 1],
      [0, 0.5, 1],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{translateX}],
      opacity,
    };
  });

  const handleDeletePlan = async (id: string) => {
    try {
      await workoutService.deleteWorkoutPlan(id);
      const newPlans = workoutPlans.filter(plan => plan.id !== id);
      setWorkoutPlans(newPlans);
    } catch (error) {
      console.error('Failed to delete workout plan:', error);
      Alert.alert(t('common.error'), t('workout.deleteError'));
    }
  };

  const handleAddDay = () => {
    const newDay: Day = {
      id: Date.now().toString(),
      dayNumber: days.length + 1,
      bodyPart: '',
      exercises: [],
    };
    setDays([...days, newDay]);
  };

  const handleSubmit = async () => {
    if (!workoutName.trim()) {
      Alert.alert(t('common.error'), t('workout.workoutNameRequired'));
      return;
    }

    // Filter out days with empty body parts
    const validDays = days.filter(day => day.bodyPart.trim() !== '');

    if (validDays.length === 0) {
      Alert.alert(t('common.error'), t('workout.dayRequired'));
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await workoutService.createWorkoutPlan({
        name: workoutName.trim(),
        days: validDays.map((day, index) => ({
          dayNumber: index + 1,
          bodyPart: day.bodyPart.trim(),
          exercises: day.exercises
            .filter(ex => ex.name.trim() !== '')
            .map(ex => ({
              name: ex.name.trim(),
              sets: ex.sets.trim(),
              reps: ex.reps.trim(),
            })),
        })),
        notes: notes.trim(),
      });

      // Add the new plan to the list
      setWorkoutPlans(prev => [
        {
          id: response.id,
          name: response.name,
          totalDays: response.days.length,
          totalExercises: response.days.reduce(
            (acc, day) => acc + day.exercises.length,
            0,
          ),
          createdAt: response.createdAt,
        },
        ...prev,
      ]);

      closeAddForm();
    } catch (error) {
      console.error('Failed to create workout plan:', error);
      Alert.alert(t('common.error'), t('workout.createError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderWorkoutPlan = (item: WorkoutPlanListItem) => (
    <View key={item.id} style={styles.planItem}>
      <Text style={styles.planName}>{item.name}</Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeletePlan(item.id)}>
        <Image
          source={trashIcon}
          style={styles.trashIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* List View */}
      <Animated.View
        style={[styles.screenContainer, animatedListStyle]}
        pointerEvents={showAddForm ? 'none' : 'auto'}>
        <View style={styles.contentWrapper}>
          {/* Accordion Dropdown */}
          <TouchableOpacity style={styles.dropdown} onPress={toggleAccordion}>
            <Text style={styles.dropdownText}>{t('workout.customPlans')}</Text>
            <Animated.View style={animatedChevronStyle}>
              <Image
                source={chevronDownIcon}
                style={styles.chevronIcon}
                resizeMode="contain"
              />
            </Animated.View>
          </TouchableOpacity>

          {/* Accordion Content */}
          <Animated.View
            style={[styles.accordionContent, animatedAccordionStyle]}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={COLORS.primary} />
              </View>
            ) : (
              <ScrollView
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
                bounces={false}>
                {workoutPlans.map(renderWorkoutPlan)}
              </ScrollView>
            )}
          </Animated.View>

          {/* Add Button */}
          <TouchableOpacity style={styles.addButton} onPress={openAddForm}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Add Form View */}
      {showAddForm && (
        <Animated.View
          style={[styles.screenContainer, styles.formContainer, animatedFormStyle]}>
          <ScrollView
            style={styles.formScroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {/* Workout Name Input */}
            <TextInput
              style={styles.workoutNameInput}
              placeholder={t('workout.workoutNamePlaceholder')}
              placeholderTextColor={COLORS.text.light.secondary}
              value={workoutName}
              onChangeText={setWorkoutName}
            />

            {/* All Day Rows */}
            {days.map((day, dayIndex) => (
              <View key={day.id} style={styles.dayRowContainer}>
                {/* Day Row */}
                <View style={styles.dayRow}>
                  <View style={styles.dayTabActive}>
                    <Text style={styles.dayTabActiveText}>
                      {t('workout.day')} {day.dayNumber}
                    </Text>
                  </View>
                  <TextInput
                    style={styles.bodyPartInput}
                    value={day.bodyPart}
                    onChangeText={(text) => {
                      const updatedDays = [...days];
                      updatedDays[dayIndex].bodyPart = text;
                      setDays(updatedDays);
                    }}
                    placeholder={t('workout.bodyPartPlaceholder')}
                    placeholderTextColor={COLORS.text.light.secondary}
                  />
                  <TouchableOpacity
                    style={styles.deleteDayButton}
                    onPress={() => {
                      if (days.length > 1) {
                        const updatedDays = days.filter((_, index) => index !== dayIndex);
                        updatedDays.forEach((d, idx) => {
                          d.dayNumber = idx + 1;
                        });
                        setDays(updatedDays);
                      }
                    }}>
                    <Image
                      source={trashIcon}
                      style={styles.dayTrashIcon}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Add Day Button - below all day rows */}
            <TouchableOpacity style={styles.addDayButton} onPress={handleAddDay}>
              <Text style={styles.addDayButtonText}>+</Text>
            </TouchableOpacity>

            {/* Exercises Section - only shown after days are created */}
            {days.length > 0 && (
              <>
                {/* Exercises Header */}
                <View style={styles.exercisesHeader}>
                  <Text style={styles.exercisesHeaderText}>{t('workout.sets')}</Text>
                  <Text style={styles.exercisesHeaderText}>{t('workout.reps')}</Text>
                </View>

                {/* Exercises List - for the first day (or selected day) */}
                {days[0]?.exercises.map((exercise, exerciseIndex) => (
                  <View key={exercise.id} style={styles.exerciseRow}>
                    <TextInput
                      style={styles.exerciseNameInput}
                      value={exercise.name}
                      onChangeText={text => {
                        const updatedDays = [...days];
                        updatedDays[0].exercises[exerciseIndex].name = text;
                        setDays(updatedDays);
                      }}
                      placeholder={`${t('workout.exercise')} ${exerciseIndex + 1}`}
                      placeholderTextColor={COLORS.text.light.secondary}
                    />
                    <View style={styles.exerciseInputs}>
                      <TextInput
                        style={styles.smallInput}
                        value={exercise.sets}
                        onChangeText={text => {
                          const updatedDays = [...days];
                          updatedDays[0].exercises[exerciseIndex].sets = text;
                          setDays(updatedDays);
                        }}
                        placeholder={t('workout.sets')}
                        placeholderTextColor={COLORS.text.light.secondary}
                        keyboardType="numeric"
                      />
                      <TextInput
                        style={styles.smallInput}
                        value={exercise.reps}
                        onChangeText={text => {
                          const updatedDays = [...days];
                          updatedDays[0].exercises[exerciseIndex].reps = text;
                          setDays(updatedDays);
                        }}
                        placeholder={t('workout.reps')}
                        placeholderTextColor={COLORS.text.light.secondary}
                      />
                      <TouchableOpacity
                        style={styles.deleteExerciseButton}
                        onPress={() => {
                          const updatedDays = [...days];
                          updatedDays[0].exercises = updatedDays[0].exercises.filter(
                            ex => ex.id !== exercise.id
                          );
                          setDays(updatedDays);
                        }}>
                        <Image
                          source={trashIcon}
                          style={styles.smallTrashIcon}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                {/* Add Exercise Button */}
                <TouchableOpacity
                  style={styles.addExerciseButton}
                  onPress={() => {
                    const updatedDays = [...days];
                    updatedDays[0].exercises.push({
                      id: Date.now().toString(),
                      name: '',
                      sets: '',
                      reps: '',
                    });
                    setDays(updatedDays);
                  }}>
                  <Text style={styles.addExerciseButtonText}>+</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Notes */}
            <TextInput
              style={styles.notesInput}
              placeholder={t('workout.notesPlaceholder')}
              placeholderTextColor={COLORS.text.light.secondary}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
            />
            <Text style={styles.wordsRemaining}>
              {Math.max(0, MAX_NOTES_WORDS - countWords(notes))} {t('workout.wordsRemaining')}
            </Text>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.submitButtonText}>{t('common.submit')}</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  screenContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: COLORS.surface.light,
    padding: 16,
    borderRadius: 8,
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: COLORS.text.light.primary,
  },
  chevronIcon: {
    width: 20,
    height: 20,
    tintColor: COLORS.text.light.secondary,
  },
  accordionContent: {
    overflow: 'hidden',
    marginTop: 16,
    alignSelf: 'stretch',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  planItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  planName: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: COLORS.text.light.primary,
    flex: 1,
  },
  deleteButton: {
    padding: 8,
  },
  trashIcon: {
    width: 22,
    height: 22,
    tintColor: COLORS.error,
  },
  smallTrashIcon: {
    width: 18,
    height: 18,
    tintColor: COLORS.error,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
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
  formContainer: {
    backgroundColor: COLORS.gray[50],
  },
  formScroll: {
    flex: 1,
    padding: 16,
  },
  workoutNameInput: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 14,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: COLORS.text.light.primary,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  dayRowContainer: {
    marginBottom: 8,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayTabActive: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  dayTabActiveText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.white,
  },
  dayTabsScrollContainer: {
    marginBottom: 12,
  },
  dayTabsScroll: {
    flexDirection: 'row',
    gap: 8,
  },
  dayTabSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayTabSmallActive: {
    backgroundColor: COLORS.primary,
  },
  dayTabSmallText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: COLORS.text.light.primary,
  },
  dayTabSmallActiveText: {
    color: COLORS.white,
  },
  bodyPartInput: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: COLORS.text.light.primary,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    marginLeft: 8,
  },
  deleteDayButton: {
    padding: 4,
    marginLeft: 12,
  },
  dayTrashIcon: {
    width: 22,
    height: 22,
    tintColor: COLORS.error,
  },
  addDayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  addDayButtonText: {
    fontSize: 22,
    color: COLORS.white,
    lineHeight: 24,
  },
  exercisesHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 40,
    marginBottom: 12,
  },
  exercisesHeaderText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: COLORS.text.light.secondary,
    width: 58,
    textAlign: 'center',
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  exerciseName: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: COLORS.text.light.primary,
  },
  exerciseNameInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: COLORS.text.light.primary,
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  exerciseInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallInput: {
    width: 54,
    backgroundColor: COLORS.white,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: COLORS.text.light.primary,
    textAlign: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  deleteExerciseButton: {
    padding: 6,
    marginLeft: 4,
  },
  addExerciseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 20,
  },
  addExerciseButtonText: {
    fontSize: 22,
    color: COLORS.white,
    lineHeight: 24,
  },
  notesInput: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 14,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: COLORS.text.light.primary,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  wordsRemaining: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: COLORS.primary,
    textAlign: 'right',
    marginTop: 6,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.white,
  },
});

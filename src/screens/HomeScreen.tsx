import React, {useState, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Image,
  useWindowDimensions,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {COLORS} from '../constants/colors';
import {WorkoutTab} from '../features/workout/screens/WorkoutTab';
import {ClientTab} from '../features/client/screens/ClientTab';
import {AvailabilityTab} from '../features/availability/screens/AvailabilityTab';
import {BookSlotsTab} from '../features/bookslots/screens/BookSlotsTab';

// Icons
import menuIcon from '../assets/icons/menu.png';
import refreshIcon from '../assets/icons/refresh.png';
import arrowBackIcon from '../assets/icons/arrow-back-white.png';

type TabType = 'Workout' | 'Client' | 'Availability' | 'Book Slots';

const TABS: TabType[] = ['Workout', 'Client', 'Availability', 'Book Slots'];
const VISIBLE_TABS = 3;

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
  mass: 0.5,
};

const TIMING_CONFIG = {
  duration: 250,
  easing: Easing.bezier(0.4, 0, 0.2, 1),
};

export const HomeScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('Workout');
  const [isWorkoutFormVisible, setIsWorkoutFormVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const {width: screenWidth} = useWindowDimensions();

  const handleWorkoutFormVisibilityChange = useCallback((isVisible: boolean) => {
    setIsWorkoutFormVisible(isVisible);
  }, []);

  const getHeaderTitle = () => {
    if (activeTab === 'Workout' && isWorkoutFormVisible) {
      return 'Add Workout Plan';
    }
    return 'Workout Management';
  };

  // Calculate tab width to show exactly 3 tabs
  const tabWidth = (screenWidth - 32) / VISIBLE_TABS; // 32 = padding (16 * 2)
  const totalTabsWidth = tabWidth * TABS.length;
  const maxTranslateX = 0;
  const minTranslateX = -(totalTabsWidth - screenWidth + 32);

  // Shared values for animations
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);
  const activeIndex = useSharedValue(0);
  const indicatorX = useSharedValue(0);

  const handleTabChange = useCallback((tab: TabType, index: number) => {
    setActiveTab(tab);
    activeIndex.value = index;

    // Animate the indicator to the new position
    indicatorX.value = withSpring(index * tabWidth, SPRING_CONFIG);

    // Auto-scroll to make the tab visible if needed
    const tabPosition = index * tabWidth;
    const currentScroll = -translateX.value;
    const visibleEnd = currentScroll + screenWidth - 32;

    if (tabPosition < currentScroll) {
      // Tab is to the left of visible area
      translateX.value = withTiming(-tabPosition, TIMING_CONFIG);
    } else if (tabPosition + tabWidth > visibleEnd) {
      // Tab is to the right of visible area
      const newScroll = tabPosition + tabWidth - (screenWidth - 32);
      translateX.value = withTiming(
        Math.max(minTranslateX, -newScroll),
        TIMING_CONFIG,
      );
    }
  }, [tabWidth, screenWidth, minTranslateX, translateX, indicatorX, activeIndex]);

  const handleBackPress = useCallback(() => {
    if (activeTab === 'Availability') {
      // Go back to first tab (Workout)
      handleTabChange('Workout', 0);
    } else if (isWorkoutFormVisible) {
      setIsWorkoutFormVisible(false);
    }
  }, [isWorkoutFormVisible, activeTab, handleTabChange]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
    })
    .onUpdate(event => {
      const newValue = startX.value + event.translationX;
      // Add rubber band effect at boundaries
      if (newValue > maxTranslateX) {
        translateX.value = maxTranslateX + (newValue - maxTranslateX) * 0.3;
      } else if (newValue < minTranslateX) {
        translateX.value = minTranslateX + (newValue - minTranslateX) * 0.3;
      } else {
        translateX.value = newValue;
      }
    })
    .onEnd(event => {
      const velocity = event.velocityX;
      const projectedX = translateX.value + velocity * 0.15;
      const clampedX = Math.max(minTranslateX, Math.min(maxTranslateX, projectedX));

      translateX.value = withSpring(clampedX, {
        ...SPRING_CONFIG,
        velocity,
      });
    });

  const animatedTabsStyle = useAnimatedStyle(() => ({
    transform: [{translateX: translateX.value}],
  }));

  // Animated indicator style
  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{translateX: indicatorX.value + translateX.value}],
    width: tabWidth,
  }));

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Workout':
        return (
          <WorkoutTab
            onFormVisibilityChange={handleWorkoutFormVisibilityChange}
            isFormVisible={isWorkoutFormVisible}
          />
        );
      case 'Client':
        return <ClientTab />;
      case 'Availability':
        return <AvailabilityTab />;
      case 'Book Slots':
        return <BookSlotsTab />;
      default:
        return <WorkoutTab />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      {/* Header - extends to top edge with safe area padding */}
      <View style={[styles.headerWrapper, {paddingTop: insets.top}]}>
        <View style={styles.header}>
          {activeTab === 'Availability' ? (
            <TouchableOpacity style={styles.menuButton} onPress={handleBackPress}>
              <Image
                source={arrowBackIcon}
                style={styles.menuIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.menuButton}>
              <Image
                source={menuIcon}
                style={styles.menuIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}

          <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>

          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.refreshButton}>
              <Image
                source={refreshIcon}
                style={styles.refreshIconStyle}
                resizeMode="contain"
              />
            </TouchableOpacity>
            {activeTab !== 'Availability' && (
              <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
                <Image
                  source={arrowBackIcon}
                  style={styles.backIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Tab Navigation - Swipable with sliding indicator */}
      <View style={styles.tabContainer}>
        <GestureDetector gesture={panGesture}>
          <View style={styles.tabWrapper}>
            <Animated.View style={[styles.tabsRow, animatedTabsStyle]}>
              {TABS.map((tab, index) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tab, {width: tabWidth}]}
                  onPress={() => handleTabChange(tab, index)}
                  activeOpacity={0.7}>
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === tab && styles.activeTabText,
                    ]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </Animated.View>

            {/* Animated sliding indicator */}
            <Animated.View style={[styles.indicator, animatedIndicatorStyle]} />
          </View>
        </GestureDetector>
      </View>

      {/* Tab Content */}
      <SafeAreaView style={styles.content} edges={['bottom']}>
        {renderTabContent()}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.light,
  },
  headerWrapper: {
    backgroundColor: COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.white,
  },
  refreshIconStyle: {
    width: 20,
    height: 20,
    tintColor: COLORS.white,
  },
  headerTitle: {
    fontSize: 21,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.white,
    flex: 1,
    textAlign: 'center',
    lineHeight: 35,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  refreshButton: {
    padding: 4,
  },
  backButton: {
    padding: 4,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.white,
  },
  tabContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    overflow: 'hidden',
    paddingHorizontal: 16,
  },
  tabWrapper: {
    position: 'relative',
  },
  tabsRow: {
    flexDirection: 'row',
  },
  tab: {
    paddingTop: 14,
    paddingBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: COLORS.text.light.dark,
  },
  activeTabText: {
    color: COLORS.primary,
    fontFamily: 'Poppins-SemiBold',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 3,
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
  },
});

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
  runOnJS,
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

export const HomeScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('Workout');
  const insets = useSafeAreaInsets();
  const {width: screenWidth} = useWindowDimensions();

  // Calculate tab width to show exactly 3 tabs
  const tabWidth = (screenWidth - 32) / VISIBLE_TABS; // 32 = padding (16 * 2)
  const totalTabsWidth = tabWidth * TABS.length;
  const maxTranslateX = 0;
  const minTranslateX = -(totalTabsWidth - screenWidth + 32);

  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
    })
    .onUpdate(event => {
      const newValue = startX.value + event.translationX;
      translateX.value = Math.max(minTranslateX, Math.min(maxTranslateX, newValue));
    })
    .onEnd(event => {
      // Add momentum with spring animation
      const velocity = event.velocityX;
      const projectedX = translateX.value + velocity * 0.1;
      const clampedX = Math.max(minTranslateX, Math.min(maxTranslateX, projectedX));
      translateX.value = withSpring(clampedX, {
        velocity,
        damping: 20,
        stiffness: 150,
      });
    });

  const animatedTabsStyle = useAnimatedStyle(() => ({
    transform: [{translateX: translateX.value}],
  }));

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Workout':
        return <WorkoutTab />;
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
          <TouchableOpacity style={styles.menuButton}>
            <Image
              source={menuIcon}
              style={styles.menuIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Workout Management</Text>

          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.refreshButton}>
              <Image
                source={refreshIcon}
                style={styles.refreshIconStyle}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButton}>
              <Image
                source={arrowBackIcon}
                style={styles.backIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Tab Navigation - Swipable */}
      <View style={styles.tabContainer}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.tabsRow, animatedTabsStyle]}>
            {TABS.map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, {width: tabWidth}, activeTab === tab && styles.activeTab]}
                onPress={() => runOnJS(handleTabChange)(tab)}>
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
  tabsRow: {
    flexDirection: 'row',
  },
  tab: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: COLORS.text.light.secondary,
  },
  activeTabText: {
    color: COLORS.primary,
    fontFamily: 'Poppins-SemiBold',
  },
  content: {
    flex: 1,
  },
});

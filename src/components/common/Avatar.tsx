import React, {useState} from 'react';
import {View, Text, Image, StyleSheet, ViewStyle} from 'react-native';
import {COLORS} from '../../constants/colors';

interface AvatarProps {
  uri?: string | null;
  name?: string | null;
  size?: number;
  style?: ViewStyle;
}

const AVATAR_COLORS = [
  '#F44336', // Red
  '#E91E63', // Pink
  '#9C27B0', // Purple
  '#673AB7', // Deep Purple
  '#3F51B5', // Indigo
  '#2196F3', // Blue
  '#00BCD4', // Cyan
  '#009688', // Teal
  '#4CAF50', // Green
  '#FF9800', // Orange
  '#FF5722', // Deep Orange
];

const getColorFromName = (name: string): string => {
  const charCode = name.charCodeAt(0) || 0;
  return AVATAR_COLORS[charCode % AVATAR_COLORS.length];
};

const getInitials = (name?: string | null): string => {
  if (!name) return 'U';

  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return 'U';

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name,
  size = 40,
  style,
}) => {
  const [imageError, setImageError] = useState(false);

  const initials = getInitials(name);
  const backgroundColor = getColorFromName(name || 'U');

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const textSize = size * 0.4;

  // Show initials if no URI, empty URI, or image failed to load
  const showInitials = !uri || imageError;

  if (showInitials) {
    return (
      <View style={[styles.container, containerStyle, {backgroundColor}, style]}>
        <Text style={[styles.initials, {fontSize: textSize}]}>{initials}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle, style]}>
      <Image
        source={{uri}}
        style={[styles.image, containerStyle]}
        onError={() => setImageError(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    color: COLORS.white,
    fontWeight: '600',
  },
});

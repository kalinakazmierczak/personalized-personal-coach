import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import TodayScreen from '../screens/home/TodayScreen';
import HistoryScreen from '../screens/history/HistoryScreen';
import CoachScreen from '../screens/coach/CoachScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { TabParamList } from '../types';
import { COLORS, FONT_SIZES } from '../constants';

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'barbell';
          if (route.name === 'Today') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Coach') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={22} color={color} />;
        },
        tabBarActiveTintColor: COLORS.text,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
          borderTopWidth: 0.5,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: FONT_SIZES.xs,
          fontWeight: '400',
          letterSpacing: 1,
          textTransform: 'uppercase',
        },
        headerStyle: {
          backgroundColor: COLORS.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          fontWeight: '300',
          color: COLORS.text,
          fontSize: FONT_SIZES.lg,
          letterSpacing: 1,
        },
      })}
    >
      <Tab.Screen name="Today" component={TodayScreen} options={{ title: 'log' }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: 'history' }} />
      <Tab.Screen name="Coach" component={CoachScreen} options={{ title: 'coach', headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'profile' }} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
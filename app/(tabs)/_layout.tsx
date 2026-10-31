import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Tabs } from 'expo-router/js-tabs';

import { fonts, useColors } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: 'index', title: 'गृहपृष्ठ', icon: 'home-outline' },
  { name: 'practice', title: 'अभ्यास', icon: 'book-outline' },
  { name: 'tests', title: 'मोडेल टेस्ट', icon: 'timer-outline' },
  { name: 'news', title: 'समसामयिक', icon: 'newspaper-outline' },
  { name: 'profile', title: 'प्रोफाइल', icon: 'person-outline' },
];

export default function TabsLayout() {
  const colors = useColors();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontFamily: fonts.regular },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, size }) => (
              <Ionicons
                name={tab.icon}
                color={focused ? colors.primary : colors.textMuted}
                size={size}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

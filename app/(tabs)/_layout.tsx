import { Home, ListChecks, Users } from 'lucide-react-native';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'hsl(152, 55%, 42%)',
        tabBarInactiveTintColor: 'hsl(150, 10%, 55%)',
        tabBarStyle: {
          borderTopColor: 'hsl(150, 15%, 85%)',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Home color={focused ? 'hsl(152, 55%, 42%)' : color} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="chores"
        options={{
          title: 'Chores',
          tabBarIcon: ({ color, focused }) => (
            <ListChecks color={focused ? 'hsl(152, 55%, 42%)' : color} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="flatmates"
        options={{
          title: 'Flatmates',
          tabBarIcon: ({ color, focused }) => (
            <Users color={focused ? 'hsl(152, 55%, 42%)' : color} size={22} />
          ),
        }}
      />
    </Tabs>
  );
}

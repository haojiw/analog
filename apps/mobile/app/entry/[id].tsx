import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function EntryModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text>Entry {id}</Text>
    </View>
  );
}

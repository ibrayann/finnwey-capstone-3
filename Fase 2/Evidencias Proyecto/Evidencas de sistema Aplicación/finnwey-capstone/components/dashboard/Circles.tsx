import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native'
import { useTheme } from '@/features/shared/hooks/useTheme'

interface Circle {
  id: string
  name: string
  members: {
    id: string
    avatar: string
  }[]
}

export default function Circles() {
  const { isDarkMode } = useTheme()
  const circles: Circle[] = [
    {
      id: '1',
      name: 'Family',
      members: [
        { id: '1', avatar: 'https://i.pravatar.cc/150?img=1' },
        { id: '2', avatar: 'https://i.pravatar.cc/150?img=2' },
        { id: '3', avatar: 'https://i.pravatar.cc/150?img=3' },
        { id: '4', avatar: 'https://i.pravatar.cc/150?img=4' },
        { id: '5', avatar: 'https://i.pravatar.cc/150?img=5' },
        { id: '6', avatar: 'https://i.pravatar.cc/150?img=6' },
      ],
    },
    {
      id: '2',
      name: '2025 Trip to Bali',
      members: [
        { id: '1', avatar: 'https://i.pravatar.cc/150?img=7' },
        { id: '2', avatar: 'https://i.pravatar.cc/150?img=8' },
        { id: '3', avatar: 'https://i.pravatar.cc/150?img=9' },
        { id: '4', avatar: 'https://i.pravatar.cc/150?img=10' },
      ],
    },
    {
      id: '3',
      name: 'Workmates',
      members: [
        { id: '1', avatar: 'https://i.pravatar.cc/150?img=11' },
        { id: '2', avatar: 'https://i.pravatar.cc/150?img=12' },
      ],
    },
  ]

  const renderCircle = (circle: Circle) => (
    <TouchableOpacity key={circle.id} className={`w-40 h-40 rounded-3xl p-4 mr-4 relative ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
      <View className="flex-wrap flex-row gap-2 justify-center items-center h-full">
        {circle.members.slice(0, 4).map((member) => (
          <Image key={member.id} source={{ uri: member.avatar }} className="w-14 h-14 rounded-full" />
        ))}
      </View>
      {circle.members.length > 4 && (
        <View className={`absolute top-12 right-1 w-12 h-12 rounded-full items-center justify-center ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}>
          <Text className={`font-semibold text-lg text-center align-middle ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>+{circle.members.length - 4}</Text>
        </View>
      )}
    </TouchableOpacity>
  )

  return (
    <View className="mt-6">
      <View className="flex-row items-center justify-between mb-4 px-5">
        <Text className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Grupos</Text>
        <TouchableOpacity>
          <Text className={isDarkMode ? 'text-green-400' : 'text-[#4CAF50]'}>Ver todos</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
        {circles.map(renderCircle)}
      </ScrollView>
    </View>
  )
}

import { View } from 'react-native'
import SubscriptionPlan from './components/SubscriptionPlan'

export default function SubscriptionScreen() {
  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <SubscriptionPlan />
    </View>
  )
}

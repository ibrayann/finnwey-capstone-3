import React from 'react'
import { View, Image } from 'react-native'

export const CardStackPNG = () => {
  return (
    <View style={{ height: 220, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
      <Image
        source={require('../../assets/registro.png')}
        style={{
          width: '85%',
          height: '100%',
          resizeMode: 'contain',
        }}
      />
    </View>
  )
}


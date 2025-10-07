import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

type CardProps = {
  id: string
  lastFourDigits: string
  amount: string
  name: string
  expiryDate: string
  cardType: 'visa' | 'mastercard'
}

type CardStackProps = {
  cards: CardProps[]
}

export const CardStack = ({ cards }: CardStackProps) => {
  return (
    <View style={styles.container}>
      {cards.map((card, index) => (
        <View
          key={card.id}
          style={[
            styles.card,
            {
              top: index * 15,
              zIndex: cards.length - index,
              transform: [{ rotate: `${index * -2}deg` }],
            },
          ]}
        >
          <View style={styles.cardTop}>
            <Text style={styles.cardAmount}>${card.amount}</Text>
            <Text style={styles.cardType}>{card.cardType.toUpperCase()}</Text>
          </View>
          <View style={styles.cardBottom}>
            <Text style={styles.cardName}>{card.name}</Text>
            <Text style={styles.cardNumber}>**** **** **** {card.lastFourDigits}</Text>
            <Text style={styles.cardExpiry}>{card.expiryDate}</Text>
          </View>
        </View>
      ))}
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    height: 220,
    width: '100%',
    position: 'relative',
    alignItems: 'center',
  },
  card: {
    position: 'absolute',
    width: '85%',
    height: 180,
    backgroundColor: '#16a34a',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    justifyContent: 'space-between',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardAmount: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardType: {
    color: 'white',
    fontSize: 14,
  },
  cardBottom: {
    marginTop: 20,
  },
  cardName: {
    color: 'white',
    fontSize: 16,
    marginBottom: 5,
  },
  cardNumber: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 5,
  },
  cardExpiry: {
    color: 'white',
    fontSize: 12,
    opacity: 0.6,
  },
})

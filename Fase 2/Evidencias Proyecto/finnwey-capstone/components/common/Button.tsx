import React, { ReactNode } from 'react'
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native'
import { twMerge } from 'tailwind-merge'

interface ButtonProps extends TouchableOpacityProps {
  title: string
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'outline'
  icon?: ReactNode
}

export const Button = ({ title, loading = false, variant = 'primary', className, disabled, icon, ...props }: ButtonProps) => {
  const baseStyles = 'flex-row justify-center items-center px-4 py-3 rounded-xl'
  const variantStyles = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    outline: 'border border-primary',
  }
  const textStyles = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: 'text-primary',
  }

  return (
    <TouchableOpacity className={twMerge(baseStyles, variantStyles[variant], disabled && 'opacity-50', className)} disabled={disabled || loading} {...props}>
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#000' : '#fff'} />
      ) : (
        <>
          {icon}
          <Text className={`font-medium ${textStyles[variant]} ${icon ? 'ml-2' : ''}`}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  )
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CityService } from '../services/city.service'
import { City, CityFilters } from '@/types/city'

// Query keys
export const cityKeys = {
  all: ['cities'] as const,
  lists: () => [...cityKeys.all, 'list'] as const,
  list: (filters?: CityFilters) => [...cityKeys.lists(), filters] as const,
  details: () => [...cityKeys.all, 'detail'] as const,
  detail: (id: string) => [...cityKeys.details(), id] as const,
  byRegion: (regionId: string) => [...cityKeys.all, 'byRegion', regionId] as const,
  hasCities: () => [...cityKeys.all, 'hasCities'] as const,
}

/**
 * Hook para obtener todas las ciudades
 */
export function useCities(filters?: CityFilters) {
  return useQuery({
    queryKey: cityKeys.list(filters),
    queryFn: () => CityService.getCities(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}

/**
 * Hook para obtener una ciudad por ID
 */
export function useCity(id: string) {
  return useQuery({
    queryKey: cityKeys.detail(id),
    queryFn: () => CityService.getCityById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook para obtener ciudades por región
 */
export function useCitiesByRegion(regionId: string) {
  console.log('useCitiesByRegion hook - regionId:', regionId)

  return useQuery({
    queryKey: cityKeys.byRegion(regionId),
    queryFn: () => CityService.getCitiesByRegion(regionId),
    enabled: !!regionId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook para verificar si existen ciudades en la base de datos
 */
export function useHasCities() {
  return useQuery({
    queryKey: cityKeys.hasCities(),
    queryFn: () => CityService.hasCities(),
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
  })
}

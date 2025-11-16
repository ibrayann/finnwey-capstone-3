import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { RegionService } from '@/features/shared/services/region.service'
import { Region, CreateRegionInput, UpdateRegionInput, RegionFilters } from '@/types/region'

// Query keys
export const regionKeys = {
  all: ['regions'] as const,
  lists: () => [...regionKeys.all, 'list'] as const,
  list: (filters?: RegionFilters) => [...regionKeys.lists(), filters] as const,
  details: () => [...regionKeys.all, 'detail'] as const,
  detail: (id: string) => [...regionKeys.details(), id] as const,
  byCountry: (countryId: string) => [...regionKeys.all, 'byCountry', countryId] as const,
  hasRegions: () => [...regionKeys.all, 'hasRegions'] as const,
}

/**
 * Hook para obtener todas las regiones
 */
export function useRegions(filters?: RegionFilters) {
  return useQuery({
    queryKey: regionKeys.list(filters),
    queryFn: () => RegionService.getRegions(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}

/**
 * Hook para obtener una región por ID
 */
export function useRegion(id: string) {
  return useQuery({
    queryKey: regionKeys.detail(id),
    queryFn: () => RegionService.getRegionById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook para obtener regiones por país
 */
export function useRegionsByCountry(countryId: string) {
  console.log('useRegionsByCountry hook - countryId:', countryId)

  return useQuery({
    queryKey: regionKeys.byCountry(countryId),
    queryFn: () => RegionService.getRegionsByCountry(countryId),
    enabled: !!countryId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook para verificar si existen regiones en la base de datos
 */
export function useHasRegions() {
  return useQuery({
    queryKey: regionKeys.hasRegions(),
    queryFn: () => RegionService.hasRegions(),
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
  })
}

/**
 * Hook para crear una región
 */

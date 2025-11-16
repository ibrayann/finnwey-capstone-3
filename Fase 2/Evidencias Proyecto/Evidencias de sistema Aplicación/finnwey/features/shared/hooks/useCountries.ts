import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CountryService } from '../services/country.service'
import { Country, CreateCountryInput, UpdateCountryInput, CountryFilters, CountryWithFlag, COUNTRY_ADDITIONAL_INFO } from '@/types/country'

// Query keys
export const countryKeys = {
  all: ['countries'] as const,
  lists: () => [...countryKeys.all, 'list'] as const,
  list: (filters?: CountryFilters) => [...countryKeys.lists(), filters] as const,
  details: () => [...countryKeys.all, 'detail'] as const,
  detail: (id: string) => [...countryKeys.details(), id] as const,
  byCode: (code: string) => [...countryKeys.all, 'byCode', code] as const,
  hasCountries: () => [...countryKeys.all, 'hasCountries'] as const,
}

/**
 * Hook para obtener todos los países
 */
export function useCountries(filters?: CountryFilters) {
  return useQuery({
    queryKey: countryKeys.list(filters),
    queryFn: () => CountryService.getCountries(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}

/**
 * Hook para obtener un país por ID
 */
export function useCountry(id: string) {
  return useQuery({
    queryKey: countryKeys.detail(id),
    queryFn: () => CountryService.getCountryById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook para obtener un país por código
 */
export function useCountryByCode(code: string) {
  return useQuery({
    queryKey: countryKeys.byCode(code),
    queryFn: () => CountryService.getCountryByCode(code),
    enabled: !!code,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook para verificar si existen países en la base de datos
 */
export function useHasCountries() {
  return useQuery({
    queryKey: countryKeys.hasCountries(),
    queryFn: () => CountryService.hasCountries(),
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
  })
}

/**
 * Hook para crear un país
 */
export function useCreateCountry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateCountryInput) => CountryService.createCountry(input),
    onSuccess: () => {
      // Invalidar todas las queries de países
      queryClient.invalidateQueries({ queryKey: countryKeys.all })
    },
  })
}

/**
 * Hook para actualizar un país
 */
export function useUpdateCountry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCountryInput }) => CountryService.updateCountry(id, input),
    onSuccess: (data) => {
      // Invalidar queries específicas
      queryClient.invalidateQueries({ queryKey: countryKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: countryKeys.byCode(data.code) })
      queryClient.invalidateQueries({ queryKey: countryKeys.lists() })
    },
  })
}

/**
 * Hook para eliminar un país
 */
export function useDeleteCountry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => CountryService.deleteCountry(id),
    onSuccess: () => {
      // Invalidar todas las queries de países
      queryClient.invalidateQueries({ queryKey: countryKeys.all })
    },
  })
}

/**
 * Hook para insertar múltiples países (datos iniciales)
 */
export function useInsertMultipleCountries() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (countries: CreateCountryInput[]) => CountryService.insertMultipleCountries(countries),
    onSuccess: () => {
      // Invalidar todas las queries de países
      queryClient.invalidateQueries({ queryKey: countryKeys.all })
    },
  })
}

/**
 * Hook personalizado para países con información adicional (banderas, códigos de teléfono)
 * Combina datos de Supabase con datos estáticos
 */
export function useCountriesWithFlags(filters?: CountryFilters) {
  const { data: countries, ...rest } = useCountries(filters)

  // Mapear países de Supabase con información adicional
  const countriesWithFlags: CountryWithFlag[] | undefined = countries?.map((country) => {
    // Buscar información adicional en el mapa estático
    const additionalInfo = COUNTRY_ADDITIONAL_INFO[country.code]

    return {
      ...country,
      flag: additionalInfo?.flag || '🏳️',
      phoneCode: additionalInfo?.phoneCode || '',
    }
  })

  return {
    data: countriesWithFlags,
    ...rest,
  }
}

export interface Country {
  id: string
  name: string
  code: string
  currency_code: string
  created_at: string
}

export interface CountryWithFlag extends Country {
  flag: string
  phoneCode: string
}

export interface CreateCountryInput {
  name: string
  code: string
  currency_code: string
}

export interface UpdateCountryInput {
  name?: string
  code?: string
  currency_code?: string
}

export interface CountryFilters {
  search?: string
  currency_code?: string
}

// Mapa de información adicional para países (banderas y códigos de teléfono)
// Esta información no se almacena en Supabase, se combina en el frontend
export const COUNTRY_ADDITIONAL_INFO: Record<string, { flag: string; phoneCode: string }> = {
  MY: { flag: '🇲🇾', phoneCode: '+60' },
  IT: { flag: '🇮🇹', phoneCode: '+39' },
  BN: { flag: '🇧🇳', phoneCode: '+673' },
  SG: { flag: '🇸🇬', phoneCode: '+65' },
  CL: { flag: '🇨🇱', phoneCode: '+56' },
  ES: { flag: '🇪🇸', phoneCode: '+34' },
  MX: { flag: '🇲🇽', phoneCode: '+52' },
  AR: { flag: '🇦🇷', phoneCode: '+54' },
  CO: { flag: '🇨🇴', phoneCode: '+57' },
  PE: { flag: '🇵🇪', phoneCode: '+51' },
  US: { flag: '🇺🇸', phoneCode: '+1' },
  CA: { flag: '🇨🇦', phoneCode: '+1' },
  BR: { flag: '🇧🇷', phoneCode: '+55' },
  FR: { flag: '🇫🇷', phoneCode: '+33' },
  DE: { flag: '🇩🇪', phoneCode: '+49' },
  GB: { flag: '🇬🇧', phoneCode: '+44' },
  AU: { flag: '🇦🇺', phoneCode: '+61' },
  JP: { flag: '🇯🇵', phoneCode: '+81' },
  KR: { flag: '🇰🇷', phoneCode: '+82' },
  CN: { flag: '🇨🇳', phoneCode: '+86' },
} as const

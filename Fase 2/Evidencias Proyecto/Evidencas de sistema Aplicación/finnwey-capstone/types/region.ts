export interface Region {
  id: string
  country_id: string
  name: string
  created_at: string
}

export interface CreateRegionInput {
  country_id: string
  name: string
}

export interface UpdateRegionInput {
  country_id?: string
  name?: string
}

export interface RegionFilters {
  search?: string
  country_id?: string
}




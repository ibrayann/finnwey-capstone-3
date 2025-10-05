export interface City {
  id: string
  region_id: string
  name: string
  created_at: string
}

export interface CityFilters {
  search?: string
  region_id?: string
}




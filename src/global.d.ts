declare global {
  interface Window {
    google: typeof google
  }
}

declare namespace google.maps {
  class DistanceMatrixService {
    getDistanceMatrix(
      request: google.maps.DistanceMatrixRequest,
      callback: (
        response: google.maps.DistanceMatrixResponse | null,
        status: google.maps.DistanceMatrixStatus,
      ) => void,
    ): void
  }

  interface DistanceMatrixRequest {
    origins: google.maps.LatLng[] | google.maps.LatLngLiteral[] | string[]
    destinations: google.maps.LatLng[] | google.maps.LatLngLiteral[] | string[]
    travelMode: google.maps.TravelMode
    unitSystem?: google.maps.UnitSystem
  }

  interface DistanceMatrixResponse {
    rows: google.maps.DistanceMatrixResponseRow[]
  }

  interface DistanceMatrixResponseRow {
    elements: google.maps.DistanceMatrixResponseElement[]
  }

  interface DistanceMatrixResponseElement {
    distance: google.maps.Distance
    duration: google.maps.Duration
    status: string
  }

  interface Distance {
    text: string
    value: number
  }

  interface Duration {
    text: string
    value: number
  }

  enum TravelMode {
    DRIVING = 'DRIVING',
    WALKING = 'WALKING',
    BICYCLING = 'BICYCLING',
    TRANSIT = 'TRANSIT',
  }

  enum UnitSystem {
    METRIC = 0,
    IMPERIAL = 1,
  }

  type DistanceMatrixStatus = string
}

export {}

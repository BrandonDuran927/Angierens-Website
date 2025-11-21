export const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.google && window.google.maps) {
      console.log('Google Maps already loaded')
      resolve()
      return
    }

    // Check if script is already in document
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com"]',
    )
    if (existingScript) {
      console.log('Google Maps script already in document, waiting...')
      existingScript.addEventListener('load', () => resolve())
      existingScript.addEventListener('error', reject)
      return
    }

    console.log('Loading Google Maps script...')
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true

    script.addEventListener('load', () => {
      console.log('Google Maps script loaded successfully')
      resolve()
    })

    script.addEventListener('error', (e) => {
      console.error('Failed to load Google Maps script', e)
      reject(new Error('Failed to load Google Maps'))
    })

    document.head.appendChild(script)
  })
}

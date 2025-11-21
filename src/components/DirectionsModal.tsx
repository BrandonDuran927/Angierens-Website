import { useEffect, useRef, useState } from 'react';
import { loadGoogleMapsScript } from '@/utils/loadGoogleMaps';
import { X } from 'lucide-react';

interface DirectionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    origin: { lat: number; lng: number };
    destination: { lat: number; lng: number };
}

export function DirectionsModal({ isOpen, onClose, origin, destination }: DirectionsModalProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

    useEffect(() => {
        if (!isOpen || !mapRef.current) return;

        const initializeMap = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

                console.log('API Key exists:', !!apiKey);

                if (!apiKey) {
                    throw new Error('Google Maps API key not found. Please check your .env file.');
                }

                // Load Google Maps script
                await loadGoogleMapsScript(apiKey);

                // Wait a bit to ensure everything is ready
                await new Promise(resolve => setTimeout(resolve, 500));

                if (!window.google || !window.google.maps) {
                    throw new Error('Google Maps failed to initialize');
                }

                console.log('Creating map instance...');

                // Create map
                const map = new google.maps.Map(mapRef.current!, {
                    center: origin,
                    zoom: 12,
                    mapTypeControl: true,
                    streetViewControl: false,
                    fullscreenControl: true,
                });

                mapInstanceRef.current = map;

                console.log('Map created successfully');

                // Create directions service and renderer
                const directionsService = new google.maps.DirectionsService();
                const directionsRenderer = new google.maps.DirectionsRenderer({
                    map: map,
                    suppressMarkers: false,
                    polylineOptions: {
                        strokeColor: '#4285F4',
                        strokeWeight: 5,
                    },
                });

                directionsRendererRef.current = directionsRenderer;

                console.log('Requesting directions from:', origin, 'to:', destination);

                // Request directions
                directionsService.route(
                    {
                        origin: new google.maps.LatLng(origin.lat, origin.lng),
                        destination: new google.maps.LatLng(destination.lat, destination.lng),
                        travelMode: google.maps.TravelMode.DRIVING,
                        provideRouteAlternatives: true,
                    },
                    (result, status) => {
                        console.log('Directions response status:', status);

                        if (status === google.maps.DirectionsStatus.OK && result) {
                            console.log('Directions received successfully');
                            console.log('Number of routes:', result.routes.length);

                            directionsRenderer.setDirections(result);

                            // Log route details
                            if (result.routes[0]) {
                                const route = result.routes[0];
                                const leg = route.legs[0];
                                console.log('Distance:', leg.distance?.text);
                                console.log('Duration:', leg.duration?.text);
                            }
                        } else {
                            console.error('Directions request failed with status:', status);
                            setError(`Failed to get directions: ${status}`);
                        }

                        setIsLoading(false);
                    }
                );

            } catch (err) {
                console.error('Error initializing map:', err);
                setError(err instanceof Error ? err.message : 'Failed to load map');
                setIsLoading(false);
            }
        };

        initializeMap();

        // Cleanup
        return () => {
            if (directionsRendererRef.current) {
                directionsRendererRef.current.setMap(null);
            }
            mapInstanceRef.current = null;
        };
    }, [isOpen, origin, destination]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-semibold">Directions</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Map Container */}
                <div className="flex-1 p-4 min-h-[500px]">
                    {error ? (
                        <div className="w-full h-full flex items-center justify-center bg-red-50 rounded-lg border border-red-200">
                            <div className="text-center p-6">
                                <p className="text-red-600 font-semibold mb-2">Error Loading Map</p>
                                <p className="text-red-500 text-sm mb-4">{error}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    Reload Page
                                </button>
                            </div>
                        </div>
                    ) : isLoading ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading map...</p>
                                <p className="text-gray-500 text-sm mt-2">Please wait...</p>
                            </div>
                        </div>
                    ) : (
                        <div ref={mapRef} className="w-full h-full rounded-lg border" />
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                        <p>From: {origin.lat.toFixed(4)}, {origin.lng.toFixed(4)}</p>
                        <p>To: {destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
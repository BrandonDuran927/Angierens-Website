import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import axios from 'axios'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// CORS configuration
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)

app.use(express.json())

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// Directions endpoint
app.get('/api/directions', async (req: Request, res: Response) => {
  try {
    const { origin, destination } = req.query

    // Validate parameters
    if (!origin || !destination) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'Both origin and destination are required',
      })
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      console.error('GOOGLE_MAPS_API_KEY not set in environment variables')
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'API key not configured',
      })
    }

    console.log('Fetching directions:', { origin, destination })

    // Call Google Maps Directions API
    const googleUrl = `https://maps.googleapis.com/maps/api/directions/json`
    const response = await axios.get(googleUrl, {
      params: {
        origin,
        destination,
        mode: 'driving',
        alternatives: true,
        key: apiKey,
      },
    })

    console.log('Google Maps response status:', response.data.status)

    // Return the data
    res.json(response.data)
  } catch (error: any) {
    console.error('Error fetching directions:', error.message)
    res.status(500).json({
      error: 'Failed to fetch directions',
      message: error.message,
    })
  }
})

// Geocoding endpoint - Convert address to coordinates
app.get('/api/geocode', async (req: Request, res: Response) => {
  try {
    const { address } = req.query

    // Validate parameters
    if (!address) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'Address is required',
      })
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      console.error('GOOGLE_MAPS_API_KEY not set in environment variables')
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'API key not configured',
      })
    }

    console.log('Geocoding address:', address)

    // Call Google Maps Geocoding API
    const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json`
    const response = await axios.get(googleUrl, {
      params: {
        address,
        key: apiKey,
      },
    })

    console.log('Geocoding response status:', response.data.status)

    // Return the data
    res.json(response.data)
  } catch (error: any) {
    console.error('Error geocoding address:', error.message)
    res.status(500).json({
      error: 'Failed to geocode address',
      message: error.message,
    })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📍 Directions API: http://localhost:${PORT}/api/directions`)
  console.log(`📍 Geocoding API: http://localhost:${PORT}/api/geocode`)
})

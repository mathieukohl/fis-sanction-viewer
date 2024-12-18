import express from 'express'
import axios from 'axios'
import cors from 'cors' // Import CORS

const app = express()
const PORT = 5001

// Enable CORS for all origins
app.use(cors())

// API Proxy Route
/*
app.get('/api/sanctions/:discipline/:season', async (req, res) => {
  const { discipline, season } = req.params
  const API_URL = `https://api.fis-ski.com/sanctions/${discipline}/${season}`

  try {
    const response = await axios.get(API_URL)

    // Sort by competition date and limit to 20 records
    const sortedSanctions = response.data
      .sort((a, b) => new Date(b.competitionSummary.date) - new Date(a.competitionSummary.date))
      .slice(0, 20)

    res.json(sortedSanctions)
  } catch (error) {
    console.error('Error fetching sanctions:', error.message)
    res.status(500).json({ error: 'Failed to fetch data from FIS API' })
  }
})*/

app.get('/api/sanctions', async (req, res) => {
  const API_URLS = [
    'https://api.fis-ski.com/sanctions/SB/2024', // Snowboard
    'https://api.fis-ski.com/sanctions/FS/2024', // Freestyle Skiing
    'https://api.fis-ski.com/sanctions/CC/2024', // Cross-Country
    'https://api.fis-ski.com/sanctions/NK/2024', // Nordic Combined
  ]

  try {
    // Fetch all disciplines' data
    const promises = API_URLS.map((url) => axios.get(url))
    const responses = await Promise.all(promises)

    // Combine all data into a single array
    let sanctions = responses.flatMap((response) => response.data)

    // Filter only athletes
    sanctions = sanctions.filter((row) => row.function === 'athlete')

    // Sort by competition date (descending) and limit to 20 records
    sanctions = sanctions
      .sort((a, b) => new Date(b.competitionSummary.date) - new Date(a.competitionSummary.date))
      .slice(0, 20)

    res.json(sanctions)
  } catch (error) {
    console.error('Error fetching sanctions:', error.message)
    res.status(500).json({ error: 'Failed to fetch data from FIS API' })
  }
})

// Start the server
app.listen(PORT, () => {
  console.log(`Backend proxy running at http://localhost:${PORT}`)
})

import express from 'express'
import axios from 'axios'
import cors from 'cors' // Import CORS

const app = express()
const PORT = 5001

// Enable CORS for all origins
app.use(cors())

app.get('/api/sanctions', async (req, res) => {
  const { season, discipline, athleteName } = req.query

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
    let sanctions = responses
      .filter((response) => response.status === 200)
      .flatMap((response) => response.data)

    // Handle rate limit gracefully
    const rateLimitExceeded = responses.some((response) => response.status === 429)
    if (rateLimitExceeded) {
      res
        .status(429)
        .json({ error: 'Rate limit exceeded. Please wait before making more requests.' })
      return
    }

    // Filter only athletes
    sanctions = sanctions.filter((row) => row.function === 'athlete')

    if (discipline) {
      sanctions = sanctions.filter((row) => row.competitionSummary.disciplineCode === discipline)
    }

    if (season) {
      sanctions = sanctions.filter(
        (row) => row.competitionSummary.seasonCode === parseInt(season, 10),
      )
    }

    if (athleteName) {
      sanctions = sanctions.filter((row) =>
        `${row.firstName} ${row.lastName}`.toLowerCase().includes(athleteName.toLowerCase()),
      )
    }

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

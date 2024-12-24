import express from 'express'
import axios from 'axios'
import cors from 'cors' // Import CORS

const app = express()
const PORT = 5001

// Enable CORS for all origins
app.use(cors())

app.get('/api/sanctions', async (req, res) => {
  const { season, discipline, athleteName } = req.query

  // Default to all disciplines if none is provided
  const disciplines = discipline ? discipline.split(',') : ['SB', 'FS', 'CC', 'NK']

  try {
    // Build the requests based on the disciplines and season
    const requests = disciplines.map((disciplineCode) => {
      const url = season
        ? `https://api.fis-ski.com/sanctions/${disciplineCode}/${season}`
        : `https://api.fis-ski.com/sanctions/${disciplineCode}`
      return axios.get(url)
    })

    // Fetch all sanctions concurrently
    const responses = await Promise.allSettled(requests)

    // Log rate limit information
    responses.forEach((response, index) => {
      if (response.status === 'fulfilled') {
        const headers = response.value.headers
        console.log(
          `API ${disciplines[index]}: Limit=${headers['x-ratelimit-limit']}, Remaining=${headers['x-ratelimit-remaining']}`,
        )
      }
    })

    // Combine data from successful responses
    let sanctions = responses
      .filter((response) => response.status === 'fulfilled' && response.value.status === 200)
      .flatMap((response) => response.value.data)

    // Handle rate limit gracefully
    const rateLimitExceeded = responses.some(
      (response) =>
        response.status === 'rejected' ||
        (response.status === 'fulfilled' && response.value.status === 429),
    )
    if (rateLimitExceeded) {
      res
        .status(429)
        .json({ error: 'Rate limit exceeded. Please wait before making more requests.' })
      return
    }

    // Filter only athletes
    sanctions = sanctions.filter((row) => row.function === 'athlete')

    if (athleteName) {
      sanctions = sanctions.filter(
        (row) =>
          row.firstName.toLowerCase().startsWith(athleteName.toLowerCase()) ||
          row.lastName.toLowerCase().startsWith(athleteName.toLowerCase()),
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

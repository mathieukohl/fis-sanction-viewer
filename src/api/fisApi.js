import axios from 'axios'

const BASE_URL = 'http://localhost:5001/api'

export const fetchSanctions = async (disciplineCode, seasonCode) => {
  try {
    const response = await axios.get(`${BASE_URL}/sanctions/${disciplineCode}/${seasonCode}`)
    return response.data
  } catch (error) {
    console.error('Error fetching sanctions:', error.message)
    throw error
  }
}

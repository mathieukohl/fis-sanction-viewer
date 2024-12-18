import axios from 'axios'

const BASE_URL = 'https://api.fis-ski.com'

export const fetchSanctions = async (disciplineCode, seasonCode) => {
  try {
    const response = await axios.get(`${BASE_URL}/sanctions/${disciplineCode}/${seasonCode}`)
    return response.data
  } catch (error) {
    console.error('Error fetching sanctions:', error)
    return []
  }
}

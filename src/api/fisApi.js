import axios from 'axios'

export const fetchSanctions = async (params = {}) => {
  try {
    // Function to fetch sanctions data from the backend API
    const response = await axios.get('http://localhost:5001/api/sanctions', { params })
    console.log(response)
    return response.data
  } catch (error) {
    console.error('Error fetching sanctions:', error.message)
    throw error
  }
}

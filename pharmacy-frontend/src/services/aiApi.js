import axios from 'axios'

const aiApi = axios.create({
  baseURL: 'http://localhost:8000',
})

export default aiApi

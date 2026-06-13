import axios from "axios"
import { toast } from "sonner"

const DUMMY_TOKEN = "devpulse-demo-token-123"

export const apiClient = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
})

// Request interceptor: attach a dummy Bearer token to every request.
apiClient.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${DUMMY_TOKEN}`
  return config
})

// Response interceptor: surface global failures as toasts, then re-throw.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Ignore requests the app itself canceled (e.g. React Query aborting an
    // in-flight fetch on unmount) — these are not real failures.
    if (axios.isCancel(error) || error?.code === "ERR_CANCELED") {
      return Promise.reject(error)
    }

    const status = error?.response?.status as number | undefined
    let message: string
    if (status === 401) {
      message = "Session expired. Please sign in again."
    } else if (status && status >= 500) {
      message = "Server error. Please try again later."
    } else if (!error?.response) {
      message = "Network error. Check your connection."
    } else {
      message = `Request failed (${status}).`
    }
    toast.error(message)
    return Promise.reject(error)
  }
)

import { createAsyncThunk } from "@reduxjs/toolkit"
import api from "@/lib/api"
import { fetchLabelsStart, fetchLabelsSuccess, fetchLabelsFailure } from "../slices/labelsSlice"
import type { AppDispatch } from "../store"

interface FetchLabelsParams {
  page?: number
}

export const fetchLabels = createAsyncThunk(
  "labels/fetchAll",
  async (params: FetchLabelsParams = {}, { rejectWithValue }) => {
    try {
      const { page = 1 } = params
      const baseUrl = "/mail/labels/"
      const paramsObj = new URLSearchParams()
      paramsObj.append('page', page.toString())

      const url = `${baseUrl}?${paramsObj.toString()}`
      const response = await api.get(url)
      // Expect paginated response with results
      if (response.data && response.data.results) {
        return {
          results: response.data.results,
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
          currentPage: page,
          totalPages: Math.ceil(response.data.count / 10),
        }
      }
      return { results: [], count: 0, next: null, previous: null }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch labels")
    }
  },
)

export const handleFetchLabels = (params: FetchLabelsParams = {}) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(fetchLabelsStart())
      const resultAction = await dispatch(fetchLabels(params))
      if (fetchLabels.fulfilled.match(resultAction)) {
        dispatch(fetchLabelsSuccess(resultAction.payload))
        return resultAction.payload
      } else {
        dispatch(fetchLabelsFailure(resultAction.payload as string))
        return false
      }
    } catch (error: any) {
      const msg = error?.message || "Failed to fetch labels"
      dispatch(fetchLabelsFailure(msg))
      return false
    }
  }
}

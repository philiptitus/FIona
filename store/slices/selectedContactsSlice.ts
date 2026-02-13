import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface SelectedContactsState {
  emaillist: number[]
  company: number[]
}

const initialState: SelectedContactsState = {
  emaillist: [],
  company: [],
}

const selectedContactsSlice = createSlice({
  name: "selectedContacts",
  initialState,
  reducers: {
    toggleContact(state, action: PayloadAction<{ id: number; type: "emaillist" | "company" }>) {
      const { id, type } = action.payload
      const index = state[type].indexOf(id)
      if (index > -1) {
        state[type].splice(index, 1)
      } else {
        state[type].push(id)
      }
    },
    selectMultiple(state, action: PayloadAction<{ ids: number[]; type: "emaillist" | "company" }>) {
      const { ids, type } = action.payload
      state[type] = [...new Set([...state[type], ...ids])]
    },
    deselectMultiple(state, action: PayloadAction<{ ids: number[]; type: "emaillist" | "company" }>) {
      const { ids, type } = action.payload
      state[type] = state[type].filter(id => !ids.includes(id))
    },
    clearSelection(state, action: PayloadAction<"emaillist" | "company">) {
      state[action.payload] = []
    },
    clearAllSelections(state) {
      state.emaillist = []
      state.company = []
    },
  },
})

export const {
  toggleContact,
  selectMultiple,
  deselectMultiple,
  clearSelection,
  clearAllSelections,
} = selectedContactsSlice.actions

export default selectedContactsSlice.reducer

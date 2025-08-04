import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  createContactList,
  fetchContactLists,
  fetchContactListDetails,
  updateContactList,
  deleteContactList,
  addEmailsToContactList,
  removeEmailsFromContactList,
} from '../actions/contactListActions';

export interface Email {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  organization_name: string;
  created_at: string;
  updated_at: string;
}

export interface ContactList {
  id: number;
  name: string;
  description: string | null;
  email_count: number;
  emails: Email[];
  created_at: string;
  updated_at: string;
  user: number;
}

interface ContactListState {
  lists: ContactList[];
  currentList: ContactList | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ContactListState = {
  lists: [],
  currentList: null,
  isLoading: false,
  error: null,
};

const contactListSlice = createSlice({
  name: 'contactLists',
  initialState,
  reducers: {
    clearCurrentList: (state) => {
      state.currentList = null;
    },
    resetContactListState: () => initialState,
  },
  extraReducers: (builder) => {
    // Create Contact List
    builder.addCase(createContactList.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createContactList.fulfilled, (state, action: PayloadAction<ContactList>) => {
      state.isLoading = false;
      state.lists.unshift(action.payload);
      state.currentList = action.payload;
    });
    builder.addCase(createContactList.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch Contact Lists
    builder.addCase(fetchContactLists.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchContactLists.fulfilled, (state, action: PayloadAction<ContactList[]>) => {
      state.isLoading = false;
      state.lists = action.payload;
    });
    builder.addCase(fetchContactLists.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch Contact List Details
    builder.addCase(fetchContactListDetails.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchContactListDetails.fulfilled, (state, action: PayloadAction<ContactList>) => {
      state.isLoading = false;
      state.currentList = action.payload;
      // Update the list in the lists array if it exists
      const index = state.lists.findIndex(list => list.id === action.payload.id);
      if (index !== -1) {
        state.lists[index] = action.payload;
      }
    });
    builder.addCase(fetchContactListDetails.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update Contact List
    builder.addCase(updateContactList.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateContactList.fulfilled, (state, action: PayloadAction<ContactList>) => {
      state.isLoading = false;
      state.lists = state.lists.map(list => 
        list.id === action.payload.id ? action.payload : list
      );
      if (state.currentList?.id === action.payload.id) {
        state.currentList = action.payload;
      }
    });
    builder.addCase(updateContactList.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Delete Contact List
    builder.addCase(deleteContactList.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteContactList.fulfilled, (state, action: PayloadAction<number>) => {
      state.isLoading = false;
      state.lists = state.lists.filter(list => list.id !== action.payload);
      if (state.currentList?.id === action.payload) {
        state.currentList = null;
      }
    });
    builder.addCase(deleteContactList.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Add Emails to Contact List
    builder.addCase(addEmailsToContactList.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(addEmailsToContactList.fulfilled, (state, action) => {
      state.isLoading = false;
      const { listId, data } = action.payload;
      
      // Update the current list if it's the one being modified
      if (state.currentList?.id === listId) {
        const existingEmailIds = new Set(state.currentList.emails.map(e => e.id));
        const newEmails = data.emails.filter((email: Email) => !existingEmailIds.has(email.id));
        state.currentList.emails = [...state.currentList.emails, ...newEmails];
        state.currentList.email_count = state.currentList.emails.length;
      }
      // Update the list in the lists array if it exists
      const listIndex = state.lists.findIndex(list => list.id === listId);
      if (listIndex !== -1) {
        const list = { ...state.lists[listIndex] };
        const existingEmailIds = new Set(list.emails.map(e => e.id));
        const newEmails = data.emails.filter((email: Email) => !existingEmailIds.has(email.id));
        list.emails = [...list.emails, ...newEmails];
        list.email_count = list.emails.length;
        state.lists[listIndex] = list;
      }
    });
    builder.addCase(addEmailsToContactList.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Remove Emails from Contact List
    builder.addCase(removeEmailsFromContactList.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(removeEmailsFromContactList.fulfilled, (state, action) => {
      state.isLoading = false;
      const { listId, emailIds } = action.payload;
      
      // Update the current list if it's the one being modified
      if (state.currentList?.id === listId) {
        state.currentList.emails = state.currentList.emails.filter(
          email => !emailIds.includes(email.id)
        );
        state.currentList.email_count = state.currentList.emails.length;
      }
      
      // Update the list in the lists array if it exists
      const listIndex = state.lists.findIndex(list => list.id === listId);
      if (listIndex !== -1) {
        const list = { ...state.lists[listIndex] };
        list.emails = list.emails.filter(email => !emailIds.includes(email.id));
        list.email_count = list.emails.length;
        state.lists[listIndex] = list;
      }
    });
    builder.addCase(removeEmailsFromContactList.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearCurrentList, resetContactListState } = contactListSlice.actions;
export default contactListSlice.reducer;

import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';
import { resetContactListState as resetSliceState } from '../slices/contactListSlice';

// Action type constants for consistency
const ActionTypes = {
  FETCH_CONTACT_LISTS: 'contactLists/fetchContactLists',
  FETCH_CONTACT_LIST_DETAILS: 'contactLists/fetchContactListDetails',
  CREATE_CONTACT_LIST: 'contactLists/createContactList',
  UPDATE_CONTACT_LIST: 'contactLists/updateContactList',
  DELETE_CONTACT_LIST: 'contactLists/deleteContactList',
  ADD_EMAILS_TO_CONTACT_LIST: 'contactLists/addEmailsToContactList',
  REMOVE_EMAILS_FROM_CONTACT_LIST: 'contactLists/removeEmailsFromContactList',
};

// Create a new contact list
export const createContactList = createAsyncThunk(
  'contactLists/create',
  async ({ name, description = '' }: { name: string; description?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/mail/contact-lists/', { name, description });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create contact list');
    }
  }
);

// Get all contact lists for the current user
export const fetchContactLists = createAsyncThunk(
  'contactLists/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/mail/contact-lists/all/');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch contact lists');
    }
  }
);

// Get details of a specific contact list
export const fetchContactListDetails = createAsyncThunk(
  'contactLists/fetchDetails',
  async (listId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/mail/contact-lists/${listId}/`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch contact list details');
    }
  }
);

// Delete a contact list
export const deleteContactList = createAsyncThunk(
  'contactLists/delete',
  async (listId: number, { rejectWithValue }) => {
    try {
      await api.delete(`/mail/contact-lists/${listId}/delete/`);
      return listId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete contact list');
    }
  }
);

// Add emails to a contact list
export const addEmailsToContactList = createAsyncThunk(
  'contactLists/addEmails',
  async (
    { listId, emailIds }: { listId: number; emailIds: number | number[] },
    { rejectWithValue }
  ) => {
    try {
      const emailIdsArray = Array.isArray(emailIds) ? emailIds : [emailIds];
      const response = await api.post(`/mail/contact-lists/${listId}/add-emails/`, {
        email_ids: emailIdsArray,
      });
      return { listId, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to add emails to contact list');
    }
  }
);

// Remove emails from a contact list
export const removeEmailsFromContactList = createAsyncThunk(
  'contactLists/removeEmails',
  async (
    { listId, emailIds }: { listId: number; emailIds: number | number[] },
    { rejectWithValue }
  ) => {
    try {
      const emailIdsArray = Array.isArray(emailIds) ? emailIds : [emailIds];
      const response = await api.post(`/mail/contact-lists/${listId}/remove-emails/`, {
        email_ids: emailIdsArray,
      });
      return { listId, emailIds: emailIdsArray, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to remove emails from contact list');
    }
  }
);

// Update contact list
export const updateContactList = createAsyncThunk(
  'contactLists/update',
  async (
    { listId, data }: { listId: number; data: { name: string; description?: string } },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/mail/contact-lists/${listId}/update/`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update contact list');
    }
  }
);

// Reset contact list state
export const resetContactListState = () => (dispatch: any) => {
  dispatch(resetSliceState());
};

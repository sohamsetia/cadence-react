/* =========================================================
   NOTES SLICE (Redux Toolkit)
   Same pattern as tasksSlice: thunks write through CadenceDB
   (localStorage), then notesLoaded() puts the fresh list in
   the store.
   ========================================================= */

import { createSlice } from "@reduxjs/toolkit";
import CadenceDB from "../lib/storage";

const initialState = {
  userId: null,
  items: []
};

const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    notesLoaded(state, action) {
      state.userId = action.payload.userId;
      state.items = action.payload.items;
    },
    notesCleared() {
      return initialState;
    }
  }
});

export const { notesLoaded, notesCleared } = notesSlice.actions;
export default notesSlice.reducer;

/* ---------------- thunks ---------------- */

function sync(dispatch, userId) {
  dispatch(notesLoaded({ userId, items: CadenceDB.getNotes(userId) }));
}

export const loadNotes = userId => dispatch => {
  sync(dispatch, userId);
};

export const addNote = payload => (dispatch, getState) => {
  const { userId } = getState().notes;
  CadenceDB.addNote(userId, payload);
  sync(dispatch, userId);
};

export const updateNote = (noteId, updates) => (dispatch, getState) => {
  const { userId } = getState().notes;
  CadenceDB.updateNote(userId, noteId, updates);
  sync(dispatch, userId);
};

export const deleteNote = noteId => (dispatch, getState) => {
  const { userId } = getState().notes;
  CadenceDB.deleteNote(userId, noteId);
  sync(dispatch, userId);
};

/* ---------------- selectors ---------------- */

export const selectNotes = state => state.notes.items;
export const selectNotesUserId = state => state.notes.userId;

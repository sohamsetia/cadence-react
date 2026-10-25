/* =========================================================
   TASKS SLICE (Redux Toolkit)
   The signed-in user's tasks live in the Redux store, so every
   page and widget reads the same list and re-renders when it
   changes. CadenceDB (localStorage) is still the source of
   truth: each thunk writes through CadenceDB, then puts the
   fresh list back in the store with tasksLoaded().
   ========================================================= */

import { createSelector, createSlice } from "@reduxjs/toolkit";
import CadenceDB from "../lib/storage";

const initialState = {
  userId: null, // whose tasks are loaded (null = none yet)
  items: []
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    tasksLoaded(state, action) {
      state.userId = action.payload.userId;
      state.items = action.payload.items;
    },
    tasksCleared() {
      return initialState;
    }
  }
});

export const { tasksLoaded, tasksCleared } = tasksSlice.actions;
export default tasksSlice.reducer;

/* ---------------- thunks (write to localStorage, then sync the store) ---------------- */

function sync(dispatch, userId) {
  dispatch(tasksLoaded({ userId, items: CadenceDB.getTasks(userId) }));
}

/** Load a user's tasks, seeding the demo set on first visit. */
export const loadTasks = userId => dispatch => {
  CadenceDB.seedDemoTasksIfNeeded(userId);
  sync(dispatch, userId);
};

export const addTask = payload => (dispatch, getState) => {
  const { userId } = getState().tasks;
  const task = CadenceDB.addTask(userId, payload);
  sync(dispatch, userId);
  return task;
};

export const updateTask = (taskId, updates) => (dispatch, getState) => {
  const { userId } = getState().tasks;
  const task = CadenceDB.updateTask(userId, taskId, updates);
  sync(dispatch, userId);
  return task;
};

export const deleteTask = taskId => (dispatch, getState) => {
  const { userId } = getState().tasks;
  CadenceDB.deleteTask(userId, taskId);
  sync(dispatch, userId);
};

/** Returns the updated task so the caller can pick the right toast. */
export const toggleTaskComplete = taskId => (dispatch, getState) => {
  const { userId } = getState().tasks;
  const task = CadenceDB.toggleComplete(userId, taskId);
  sync(dispatch, userId);
  return task;
};

/* ---------------- selectors ---------------- */

export const selectTasks = state => state.tasks.items;
export const selectTasksUserId = state => state.tasks.userId;

/** Same numbers as CadenceDB.getStats(), computed from the store (memoized). */
export const selectTaskStats = createSelector([selectTasks], tasks => {
  const today = CadenceDB.todayKey();
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === "completed").length;
  const dueToday = tasks.filter(t => t.dueDate === today && t.status !== "completed").length;
  return {
    total,
    completed,
    pending: total - completed,
    dueToday,
    completionPercentage: total === 0 ? 0 : Math.round((completed / total) * 100)
  };
});

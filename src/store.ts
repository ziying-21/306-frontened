import { configureStore } from "@reduxjs/toolkit";
import deleteListSliceReducer from "./components/task_manage/deleteList";

const store = configureStore({
  reducer: {
    deleteList: deleteListSliceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;

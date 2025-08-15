import { configureStore } from "@reduxjs/toolkit";
import classesReducer from "../reducer/classes";


export const store = configureStore({
  reducer: {
    classes: classesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import { RootState } from "@/store";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface DeleteListState {
  value: string[];
}

const initialState: DeleteListState = {
  value: [],
};

export const deleteListSlice = createSlice({
  name: "deleteList",
  initialState,
  reducers: {
    add: (state, action: PayloadAction<string>) => {
      state.value.push(action.payload);
    },
    clear: (state) => {
      state.value = [];
    },
  },
});

export const { add, clear } = deleteListSlice.actions;
export const selectDeleteList = (state: RootState) => state.deleteList.value;
export default deleteListSlice.reducer;

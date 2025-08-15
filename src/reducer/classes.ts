// src/redux/slices/classesSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Tipe data untuk satu class
export interface ClassItem {
  id: number;
  name: string;
  // tambahkan field lain sesuai API
}

// Tipe state di Redux
interface ClassesState {
  data: ClassItem[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: ClassesState = {
  data: [],
  loading: false,
  error: null,
};

// Thunk untuk fetch data classes
export const fetchClasses = createAsyncThunk<
  ClassItem[],
  void,
  { rejectValue: string }
>("classes/fetchClasses", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(
      "https://masjidkubackend4-production.up.railway.app/api/a/classes"
    );

    if (!response.ok) {
      return rejectWithValue("Gagal mengambil data classes");
    }

    const data: ClassItem[] = await response.json();
    return data;
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

const classesSlice = createSlice({
  name: "classes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClasses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchClasses.fulfilled,
        (state, action: PayloadAction<ClassItem[]>) => {
          state.loading = false;
          state.data = action.payload;
        }
      )
      .addCase(fetchClasses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Terjadi kesalahan";
      });
  },
});

export default classesSlice.reducer;

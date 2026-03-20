
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getLocalStorageItem ,requestApi } from "../Service/MeetingService";

// const url = new URL(window.location.href);
const userInfo = getLocalStorageItem("user_info") || {};
console.log("userinof", userInfo);

const tenant_id = userInfo?.default_tenant_id;



export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const payload = {
        filter: [],
        page: { size: 100, page_number: 1 },
        size: 5,
        sort: "dsc",
      };

      const response = await requestApi(
        "POST",
        `${tenant_id}/users/`,
        payload,
        "accountService"
      );
      const usersData = response?.data?.data;
      return usersData;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Error");
    }
  }
);

interface UserState {
  usersData: any[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  usersData: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.usersData = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const userReducer = userSlice.reducer;
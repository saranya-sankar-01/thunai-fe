import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getLocalStorageItem ,requestApi } from "@/services/authService";
// ========== Interfaces ==========

export interface EventMeet {
  [key: string]: any;
}

export interface EventMeetResponse {
  page: {
    page_size: number;
    page_number: number;
  };
  events: EventMeet[];
}
// const url = new URL(window.location.href);
const userInfo = getLocalStorageItem("user_info") || {};
const tenant_id = userInfo?.default_tenant_id;
// ========== Fetch Event Meet ==========


export const fetchEventMeet = createAsyncThunk<EventMeetResponse>(
  "eventMeet/fetchEventMeet",
  async ()=>{
    const payload = { no_of_days: 20, page_number: 1, page_size: 20 };
    
    const response = await requestApi(
    "post",
    `${tenant_id}/get/events`,
    payload,
    "CalendarService"
);

if(response.status=== "error"){
    throw new Error(response.message || "Token expired");
}
   return response.data;

}
);

const initialState: {
  eventMeetData: EventMeetResponse | null;
  Eventloading: boolean;
  error: string | null;
} = {
  eventMeetData: null,
  Eventloading: false,
  error: null,
};



const eventMeetSlice = createSlice({
    name: "eventMeet",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(fetchEventMeet.pending, (state) => {
            state.Eventloading  = true;
            state.error = null;
        })
        .addCase(fetchEventMeet.fulfilled, (state, action) => {
            state.Eventloading  = false;
            state.eventMeetData = action.payload;
        })
        .addCase(fetchEventMeet.rejected, (state, action) => {
            state.Eventloading  = false;
            state.error = action.error.message || "Failed to fetch event meet data";
        });
    }
})


export const EventMeetReducer = eventMeetSlice.reducer;

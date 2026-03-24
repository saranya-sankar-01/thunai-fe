import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {getLocalStorageItem, requestApi } from "@/services/authService";

// ========== Interfaces ==========
export interface Schedule {
  [key: string]: any;
}

export interface Agent {
  [key: string]: any;
  sales_data: any[];
  total?: number;
  credits?: number;
}

export interface MeetingState {
  agents: Agent;
  loading: boolean;
  error: string | null;
}


const initialState: MeetingState = {
  agents: { sales_data: [], total: 0, credits: 0 },
  loading: false,
  error: null,
};


// const url = new URL(window.location.href);
const userInfo = getLocalStorageItem("user_info") || {};
const tenant_id = userInfo?.default_tenant_id;
const user_id = userInfo?.profile?.user_id;

console.log("userInfo==>",userInfo);

// ========== Fetch Meeting Agent ==========
export const fetchMeetingAgent = createAsyncThunk<Agent, number, any>(
  "meeting/fetchMeetingAgent",
  async (pageNumber = 1) => {
    const payload = {
      filter: [
        {
            key_name: "added_type",
            key_value: [
              "user",
              "periodic_sync",
              "recording",
              "ai-bot",
              "research",
              "meet-record",
              "teams-record",
              "zoom-record",
              "webex-record",
            ],
            operator: "in",
          },
      ],
      page: { size: 10, page_number: pageNumber },
      sort: "desc",
      sortby: "created",
    };

    const response = await requestApi(
      "POST",
      `${tenant_id}/callagent/filter/`,
      payload,
      "authService"
    );

    // console.log("response", response);
    if(response.status=== "error"){
      throw new Error(response.message || "Token expired");
    }

    const data = response.data|| {};  
    // console.log("Fetched agents data1:", data.total);

    return {
      sales_data: data.sales_data || [],
      total: data.total ?? 0,
      credits: data.credits ?? 0,
    };
  }
);

// ========== Fetch My Meeting ==========
export const FetchMyMeet = createAsyncThunk(
  "myMeeting/FetchMyMeet",
  async (pageNumber: any = 1, { rejectWithValue }: any) => {
    try {
      const payload = {
        filter: [
          {
            key_name: "added_type",
            key_value: [
              "user",
              "periodic_sync",
              "recording",
              "ai-bot",
              "research",
              "meet-record",
              "teams-record",
              "zoom-record",
              "webex-record",
            ],
            operator: "in",
          },
          {
            key_name: "user_id",
            key_value: user_id,
            operator: "==",
          },
        ],
        page: {
          size: 10,
          page_number: pageNumber,
        },
        sort: "desc",
        sortby: "created",
      };

      const response = await requestApi(
        "POST",
        `${tenant_id}/callagent/filter/`,
        payload,
        "authService"
      );

      const data = response?.data;
      // console.log("my meet API response:", data);

      return  data || {};
    } catch (error) {
      return rejectWithValue("Error fetching my meetings");
    }
  }
);

// ========== Fetch Shared Meeting ==========
export const FetchSharedMeet = createAsyncThunk(
  "SharedMeet/FetchSharedMeet",
  async (pageNumber: any = 1, { rejectWithValue }: any) => {
    try {
      const payload = {
        filter: [
          {
            key_name: "added_type",
            key_value: [
              "user",
              "periodic_sync",
              "recording",
              "ai-bot",
              "research",
              "meet-record",
              "teams-record",
              "zoom-record",
              "webex-record",
            ],
            operator: "in"
          },
          {
            key_name: "user_id",
            key_value: user_id,
            operator: "!="
          }
        ],
        page: {
          size: 10,
          page_number: pageNumber
        },
        sort: "desc",
        sortby: "created"
      };

      const response = await requestApi(
        "POST",
        `${tenant_id}/callagent/filter/`,
        payload,
        "authService"
      );
      const data = response?.data;
      // console.log("Shared meet111", data);

      return data || {};
    } catch (error) {
      return rejectWithValue("Error fetching Shared meeting");
    }
  }
);

// ========== Slices ==========

// Meeting Agent Slice
const MeetSlice = createSlice({
  name: "meeting",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMeetingAgent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMeetingAgent.fulfilled, (state, action) => {
        state.loading = false;
        state.agents = action.payload;
      })
      .addCase(fetchMeetingAgent.rejected, (state, action) => {
        state.loading = false;
        // state.error = action.error.message ?? "Failed to fetch meeting agents";
        state.error = action.error.message || "Token expired";
      });
  },
});

// My Meeting Slice
const MyMeetSlice = createSlice({
  name: "myMeeting",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(FetchMyMeet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(FetchMyMeet.fulfilled, (state, action) => {
        state.loading = false;
        state.agents = {
  sales_data: action.payload.sales_data || [],
  total: action.payload.total || 0,
  credits: action.payload.credits || 0
};

      })
      .addCase(FetchMyMeet.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch my meetings";
      });
  },
});

// Shared Meeting Slice
const SharedMeetSlice = createSlice({
  name: "SharedMeet",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(FetchSharedMeet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(FetchSharedMeet.fulfilled, (state, action) => {
        state.loading = false;
        state.agents = action.payload;
      })
      .addCase(FetchSharedMeet.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch shared meetings";
      });
  },
});

export const AllMeetReducer = MeetSlice.reducer;
export const MyMeetReducer = MyMeetSlice.reducer;
export const SharedMeetReducer = SharedMeetSlice.reducer;
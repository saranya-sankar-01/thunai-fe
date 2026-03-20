import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {getLocalStorageItem, requestApi } from "../Service/MeetingService";

// const url = new URL(window.location.href);
const userInfo = getLocalStorageItem("user_info") || {};
const tenant_id = userInfo?.default_tenant_id;


// ====================== ASYNC THUNKS ======================

// Fetch Score Data
export const fetchScoreData = createAsyncThunk(
  "ScoreData/fetchScoreData",
  async () => {
    try {
      const response = await requestApi(
        "GET",
        `${tenant_id}/call/scoring/`,
        null,
        "authService"
      );
      return response || [];
    } catch (error) {
      console.error("Error fetching score data:", error);
      throw error;
    }
  }
);

// Fetch Category Data
export const fetchCategory = createAsyncThunk(
  "Category/fetchCategory",
  async () => {
    try {
      const response = await requestApi(
        "GET",
        `${tenant_id}/category/`,
        null,
        "authService"
      );
      return response || [];
    } catch (error) {
      console.error("Error fetching category data:", error);
      throw error;
    }
  }
);

export const FetchAllScore= createAsyncThunk(
  "AllScoreData/FetchAllScore",
  async ()=>{
    try{
      const response =await requestApi(
        "GET",
        `${tenant_id}/call/scoring/?type=all`,
        null,
        'authService'
      );
      return response || [];
    } catch (error) {
      console.error("Error fetching all score data:", error);
      throw error;
    }
  }
);

export const FetchMappingApi = createAsyncThunk(
  "MappingData/FetchMappingApi",
  async ()=>{
    try{
      const response = await requestApi(
        "GET",
        `${tenant_id}/field/mappings/`,
        null,
        "authService"
      );
      return response || [];
    }catch(error){
      console.error("Error fetching mapping data:", error);
      throw error;
    }
  }
)

export const FetchParameter = createAsyncThunk(
  "ParameterData/FetchParameter",
  async (_, { rejectWithValue }) => {
    const payload = {
      filter: [],
      page: { size: 10, page_number: 1 },
      size: 10,
      sort: "asc",
      sortby: "created",
    };

    try {
      const response = await requestApi(
        "POST",
        "/get/call/scoring/parameters/",
        payload,
        "authService"
      );
      return response || [];
    } catch (error: any) {
      console.error("Error in FetchParameter API:", error);
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch parameter data"
      );
    }
  }
);



// ====================== SLICE 1: SCORE ======================
const scoreSlice = createSlice({
  name: "Score",
  initialState: {
    scoreDetails: [] as any[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchScoreData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScoreData.fulfilled, (state, action) => {
        state.loading = false;
        state.scoreDetails = action.payload;
      })
      .addCase(fetchScoreData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch score data";
      });
  },
});


// ====================== SLICE 2: CATEGORY ======================
const categorySlice = createSlice({
  name: "Category",
  initialState: {
    categoryList: [] as any[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categoryList = action.payload;
      })
      .addCase(fetchCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch category data";
      });
  },
});

const AllScoreSlice= createSlice({
  name:"AllScore",
  initialState:{
    AllScoreDetails: [] as any[],
    loading:false,
    error:null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(FetchAllScore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(FetchAllScore.fulfilled, (state, action) => {
        state.loading = false;
        state.AllScoreDetails = action.payload;
      })
      .addCase(FetchAllScore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch all score data";
      });
  },
});

const MappingSlice =createSlice({
  name:"Mapping",
  initialState:{
    MappingDetails: [] as any[],
    loading:false,
    error:null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(FetchMappingApi.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(FetchMappingApi.fulfilled, (state, action) => {
        state.loading = false;
        state.MappingDetails = action.payload;
      })
      .addCase(FetchMappingApi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch mapping data";
      });
  },
});

const ParameterSlice = createSlice({
  name: "Parameter",
  initialState: {
    ParameterDetails: [] as any[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(FetchParameter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(FetchParameter.fulfilled, (state, action) => {
        state.loading = false;
        state.ParameterDetails = action.payload;
      })
      .addCase(FetchParameter.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Failed to fetch Parameter data";
      });
  },
});


// ====================== EXPORTS ======================
export const scoreReducer = scoreSlice.reducer;
export const categoryReducer = categorySlice.reducer;
export const AllScoreReducer= AllScoreSlice.reducer;
export const MappingReducer= MappingSlice.reducer;
export const ParameterReducer= ParameterSlice.reducer;

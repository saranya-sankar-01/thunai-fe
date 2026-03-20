import { configureStore } from "@reduxjs/toolkit";
import {AllMeetReducer ,MyMeetReducer,SharedMeetReducer} from "../features/MeetSlice";
import { userReducer } from "../features/userSlice";

import { scoreReducer, categoryReducer ,AllScoreReducer, MappingReducer,ParameterReducer } from "../features/CallAnalysiSlice";
import { EventMeetReducer } from "../features/EventMeetSlice";

export const store = configureStore({
  reducer: {
    users: AllMeetReducer,
    score: scoreReducer,
    allScore: AllScoreReducer,
    category: categoryReducer,
    mapping: MappingReducer,
    Parameter: ParameterReducer,
    myMeet:MyMeetReducer,
    sharedMeeting:SharedMeetReducer,
    allUser:userReducer,
    eventMeet:EventMeetReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch
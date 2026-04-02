import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  articleDepth: "complete",
  currentStage: "idle",
  duplicateMatch: null,
  equipmentName: "",
  error: null,
  loading: false,
  locale: "en",
  preview: null,
  progress: 0,
  resultPostId: null,
  selectedProviderConfigId: null,
  targetAudience: [],
  warnings: [],
};

const generatorSlice = createSlice({
  name: "generator",
  initialState,
  reducers: {
    resetGeneratorState() {
      return initialState;
    },
    setGeneratorState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
});

export const { resetGeneratorState, setGeneratorState } = generatorSlice.actions;

export default generatorSlice.reducer;

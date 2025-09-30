import { createSlice } from '@reduxjs/toolkit';

const blockchainSlice = createSlice({
  name: 'blockchain',
  initialState: {
    touristID: null,
    name: null,
    network: null, // 'ETHEREUM' instead of 'HYPERLEDGER'
    isVerified: false,
    activities: [],
    isLoading: false,
    error: null
  },
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setTouristID: (state, action) => {
      state.touristID = action.payload.id;
      state.name = action.payload.name;
      state.network = action.payload.network || 'ETHEREUM';
      state.isVerified = true;
    },
    addActivity: (state, action) => {
      state.activities.push(action.payload);
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const { 
  setLoading, 
  setTouristID, 
  addActivity, 
  setError, 
  clearError 
} = blockchainSlice.actions;

export default blockchainSlice.reducer;
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api";

// Sistem verilerini getirmek için async thunk
export const fetchSystemData = createAsyncThunk(
    'system/fetchSystemData',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/api/req/sys');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Sistem verileri yüklenirken hata oluştu.');
        }
    }
);

const systemSlice = createSlice({
    name: "system",
    initialState: {
        userList: [],
        pozList: [],
        clusterList: [],
        fieldTypeList: [],
        localStockList: [],
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null
    },
    reducers: {
        setSystemData: (state, action) => {
            const { userList, pozList, clusterList, fieldTypeList, localStockList } = action.payload;
            state.userList = userList;
            state.pozList = pozList;
            state.clusterList = clusterList;
            state.fieldTypeList = fieldTypeList;
            state.localStockList = localStockList;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSystemData.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchSystemData.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const { userList, pozList, clusterList, fieldTypeList, localStockList } = action.payload;
                state.userList = userList;
                state.pozList = pozList;
                state.clusterList = clusterList;
                state.fieldTypeList = fieldTypeList;
                state.localStockList = localStockList;
            })
            .addCase(fetchSystemData.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    }
});

export const { setSystemData } = systemSlice.actions;
export default systemSlice.reducer; 
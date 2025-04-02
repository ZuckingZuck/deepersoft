import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api";

// Sistem verilerini getirmek için async thunk
export const fetchSystemData = createAsyncThunk(
    'system/fetchSystemData',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/api/req/sys');
            console.log('Sistem verileri:', response.data);
            return response.data;
        } catch (error) {
            console.error('Sistem verileri alınırken hata:', error);
            return rejectWithValue(error.response?.data || 'Sistem verileri yüklenirken hata oluştu.');
        }
    }
);

// Poz listesini getir
export const fetchPozList = createAsyncThunk(
    'system/fetchPozList',
    async () => {
        const response = await api.get('/api/poz');
        return response.data;
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
                state.error = null;
            })
            .addCase(fetchSystemData.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.error = null;
                
                // Gelen veriyi state'e ekle
                if (action.payload) {
                    state.userList = action.payload.userList || [];
                    state.pozList = action.payload.pozList || [];
                    state.clusterList = action.payload.clusterList || [];
                    state.fieldTypeList = action.payload.fieldTypeList || [];
                    state.localStockList = action.payload.localStockList || [];
                }
                
                console.log('Redux state güncellendi:', {
                    userList: state.userList,
                    pozList: state.pozList,
                    clusterList: state.clusterList,
                    fieldTypeList: state.fieldTypeList,
                    localStockList: state.localStockList
                });
            })
            .addCase(fetchSystemData.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
                console.error('Sistem verileri yüklenirken hata:', action.payload);
            })
            .addCase(fetchPozList.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchPozList.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.pozList = action.payload;
            })
            .addCase(fetchPozList.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    }
});

export const { setSystemData } = systemSlice.actions;
export default systemSlice.reducer; 
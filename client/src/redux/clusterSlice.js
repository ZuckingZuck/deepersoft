import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api";

// Tüm öbekleri getirmek için async thunk
export const fetchAllClusters = createAsyncThunk(
    'cluster/fetchAllClusters',
    async (_, { rejectWithValue }) => {
        try {
            console.log('Öbekleri yüklemeye çalışıyor...');
            const response = await api.get('/api/definitions/cluster');
            console.log('Öbek verisi yüklendi:', response.data);
            
            if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
                return rejectWithValue('API yanıt verdi fakat öbek verisi bulunamadı.');
            }
            
            return response.data;
        } catch (error) {
            console.error('Öbek yükleme hatası:', error);
            return rejectWithValue(error.response?.data?.message || 'Öbekler yüklenirken bir hata oluştu. API bağlantısını kontrol edin.');
        }
    }
);

// Öbek verilerini işlemek için yardımcı fonksiyon
const processClusterData = (clusters) => {
    // Benzersiz şehirleri çıkar
    const uniqueCities = [...new Set(clusters.map(cluster => cluster.city))];
    
    // Şehirlere göre öbekleri grupla
    const clustersByCity = {};
    uniqueCities.forEach(city => {
        clustersByCity[city] = clusters.filter(cluster => cluster.city === city);
    });
    
    return { uniqueCities, clustersByCity };
};

const clusterSlice = createSlice({
    name: "cluster",
    initialState: {
        allClusters: [],
        cities: [],
        clustersByCity: {},
        selectedCity: null,
        selectedCluster: null,
        clusterStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null
    },
    reducers: {
        setSelectedCity: (state, action) => {
            state.selectedCity = action.payload;
        },
        setSelectedCluster: (state, action) => {
            // Öbek ID'sine göre seçilen öbeği bul
            const clusterId = action.payload;
            state.selectedCluster = state.allClusters.find(cluster => cluster._id === clusterId) || null;
        },
        resetSelectedCluster: (state) => {
            state.selectedCluster = null;
        },
        resetSelectedCity: (state) => {
            state.selectedCity = null;
        },
        clearClusterError: (state) => {
            state.error = null;
            state.clusterStatus = 'idle';
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllClusters.pending, (state) => {
                state.clusterStatus = 'loading';
                state.error = null;
            })
            .addCase(fetchAllClusters.fulfilled, (state, action) => {
                state.clusterStatus = 'succeeded';
                state.error = null;
                state.allClusters = action.payload;
                const { uniqueCities, clustersByCity } = processClusterData(action.payload);
                state.cities = uniqueCities;
                state.clustersByCity = clustersByCity;
            })
            .addCase(fetchAllClusters.rejected, (state, action) => {
                state.clusterStatus = 'failed';
                state.error = action.payload || 'Öbek verileri yüklenemedi. API bağlantısını kontrol edin.';
            });
    }
});

export const { 
    setSelectedCity, 
    setSelectedCluster, 
    resetSelectedCluster, 
    resetSelectedCity, 
    clearClusterError 
} = clusterSlice.actions;

export default clusterSlice.reducer; 
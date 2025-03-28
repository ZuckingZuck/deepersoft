import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api";

// Tüm kullanıcıları getirmek için async thunk
export const fetchAllUsers = createAsyncThunk(
    'user/fetchAllUsers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/api/auth/users');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Kullanıcılar yüklenirken hata oluştu.');
        }
    }
);

// Örnek statik kullanıcılar (API bağlantısı olmadığında)
const staticUsers = [
    { _id: '1', fullName: 'Ahmet Yılmaz', userType: 'Supervisor' },
    { _id: '2', fullName: 'Mehmet Demir', userType: 'Supervisor' },
    { _id: '3', fullName: 'Ayşe Kaya', userType: 'Taşeron' },
    { _id: '4', fullName: 'Fatma Şahin', userType: 'Taşeron' },
    { _id: '5', fullName: 'Ali Öztürk', userType: 'Taşeron' }
];

const userSlice = createSlice({
    name: "user",
    initialState: {
        user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null,
        allUsers: [],
        supervisors: [],
        contractors: [],
        userStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null
    },
    reducers: {
        userLogin: (state, action) => {
            state.user = action.payload;
        },
        userLogout: (state) => {
            localStorage.removeItem("user");
            state.user = null;
        },
        setAllUsers: (state, action) => {
            state.allUsers = action.payload;
            state.supervisors = action.payload.filter(user => user.userType === "Supervisor");
            state.contractors = action.payload.filter(user => user.userType === "Taşeron");
        },
        setStaticUsers: (state) => {
            state.allUsers = staticUsers;
            state.supervisors = staticUsers.filter(user => user.userType === "Supervisor");
            state.contractors = staticUsers.filter(user => user.userType === "Taşeron");
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllUsers.pending, (state) => {
                state.userStatus = 'loading';
            })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.userStatus = 'succeeded';
                if (Array.isArray(action.payload) && action.payload.length > 0) {
                    state.allUsers = action.payload;
                    state.supervisors = action.payload.filter(user => user.userType === "Supervisor");
                    state.contractors = action.payload.filter(user => user.userType === "Taşeron");
                } else {
                    // API'den veri gelmezse statik verileri kullan
                    state.allUsers = staticUsers;
                    state.supervisors = staticUsers.filter(user => user.userType === "Supervisor");
                    state.contractors = staticUsers.filter(user => user.userType === "Taşeron");
                }
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.userStatus = 'failed';
                state.error = action.payload;
                // Hata durumunda statik verileri kullan
                state.allUsers = staticUsers;
                state.supervisors = staticUsers.filter(user => user.userType === "Supervisor");
                state.contractors = staticUsers.filter(user => user.userType === "Taşeron");
            });
    }
});



export const { userLogin, userLogout, setAllUsers, setStaticUsers } = userSlice.actions;
export default userSlice.reducer;
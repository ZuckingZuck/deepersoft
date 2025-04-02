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

// Kullanıcı listesini getir
export const fetchUserList = createAsyncThunk(
    'user/fetchUserList',
    async () => {
        const response = await api.get('/api/user/list');
        return response.data;
    }
);

const initialState = {
    user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null,
    userList: [],
    allUsers: [],
    supervisors: [],
    contractors: [],
    status: 'idle',
    error: null
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        userLogin: (state, action) => {
            state.user = action.payload;
            localStorage.setItem("user", JSON.stringify(action.payload));
        },
        userLogout: (state) => {
            localStorage.removeItem("user");
            state.user = null;
        },
        setUser: (state, action) => {
            state.user = action.payload;
        },
        clearUser: (state) => {
            state.user = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllUsers.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.allUsers = action.payload;
                state.supervisors = action.payload.filter(user => user.userType === "Supervisor");
                state.contractors = action.payload.filter(user => user.userType === "Taşeron");
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(fetchUserList.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchUserList.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.userList = action.payload;
            })
            .addCase(fetchUserList.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    }
});

export const { userLogin, userLogout, setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
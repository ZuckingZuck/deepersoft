import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null,
    },
    reducers: {
        userLogin: (state, action) => {
            state.user = action.payload;
        },
        userLogout: (state, action) => {
            localStorage.removeItem("user");
            state.user = null;
        }
    }
})



export const { userLogin, userLogout } = userSlice.actions
export default userSlice.reducer
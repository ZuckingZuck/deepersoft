import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import clusterSlice from "./clusterSlice";
import systemSlice from "./systemSlice";

export default configureStore({
    reducer: {
        user: userSlice,
        cluster: clusterSlice,
        system: systemSlice
    }
})
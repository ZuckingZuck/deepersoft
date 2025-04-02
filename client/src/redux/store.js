import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import clusterSlice from "./clusterSlice";
import systemSlice from "./systemSlice";
import projectSlice from "./projectSlice";

export default configureStore({
    reducer: {
        user: userSlice,
        cluster: clusterSlice,
        system: systemSlice,
        project: projectSlice
    }
})
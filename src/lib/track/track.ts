import {post} from "../api";

export const track = async ({jobID, actionName, error}: {jobID?: string, actionName: string, error?: string}) => 
    post("/track", {
        job_id: jobID ?? null,
        name: actionName,
        error: error ?? null
    })

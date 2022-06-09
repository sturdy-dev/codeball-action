import {post} from "../api";

export const track = async({jobID, actionName}:{jobID?: string, actionName: string}) => 
    post("/track", {
        job_id: jobID,
        name: actionName,
    })

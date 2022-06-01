import {post} from "../api";

export const track = async(jobID: string | undefined, actionName: string) => {
    return post("/track", {
        job_id: jobID,
        name: actionName,
    })
}
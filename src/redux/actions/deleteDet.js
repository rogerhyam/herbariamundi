import ActionTypes from "./actionTypes";

export function deleteDet(detId,specimenDbId) {
    return dispatch => {

        dispatch(deleteDetBegin(detId, specimenDbId));

        const requestOptions = {
            method: "POST",
            body: JSON.stringify({ detId, specimenDbId}),
            headers: {
                Accept: "application/json"
            }
        };

        return fetch("/dets.php?verb=delete", requestOptions)
            .then(handleErrors)
            .then(res => res.json())
            .then(json => {
                // this is already json so no casting necessary ?
                dispatch(deleteDetSuccess(json));
                return json;
            })
            .catch(error => dispatch(deleteDetFailure(error)));
    };
}

export const deleteDetBegin = (detId, specimenDbId) => ({
    type: ActionTypes.DELETE_DET_BEGIN,
    detId,
    specimenDbId
});

export const deleteDetSuccess = fullResponse => ({
    type: ActionTypes.DELETE_DET_SUCCESS,
    fullResponse
});

export const deleteDetFailure = error => ({
    type: ActionTypes.DELETE_DET_FAILURE,
    payload: { error }
});

function handleErrors(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

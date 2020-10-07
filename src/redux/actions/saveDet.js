import ActionTypes from "./actionTypes";

export function saveDet(wfoId, specimenId, specimenDbId, wfoItem) {
    return dispatch => {
        dispatch(saveDetBegin(wfoId, specimenId, specimenDbId, wfoItem));

        const requestOptions = {
            method: "POST",
            body: JSON.stringify({ wfoId, specimenId, specimenDbId, wfoItem}),
            headers: {
                Accept: "application/json"
            }
        };

        return fetch("/dets.php?verb=save", requestOptions)
            .then(handleErrors)
            .then(res => res.json())
            .then(json => {
                dispatch(saveDetSuccess(json));
                return json;
            })
            .catch(error => dispatch(saveDetFailure(error)));
    };
}

export const saveDetBegin = (wfoId, specimenId, specimenDbId, wfoItem) => ({
    type: ActionTypes.SAVE_DET_BEGIN,
    wfoId,
    specimenId,
    specimenDbId,
    wfoItem
});

export const saveDetSuccess = fullResponse => ({
    type: ActionTypes.SAVE_DET_SUCCESS,
    fullResponse
});

export const saveDetFailure = error => ({
    type: ActionTypes.SAVE_DET_FAILURE,
    payload: { error }
});

function handleErrors(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

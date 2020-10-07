import ActionTypes from "./actionTypes";

export function fetchDets(specimenId, specimenDbId) {
    return dispatch => {

        dispatch(fetchDetsBegin(specimenId, specimenDbId));

        const requestOptions = {
            method: "POST",
            body: JSON.stringify({specimenId, specimenDbId }),
            headers: {
                Accept: "application/json"
            }
        };

        return fetch("/dets.php?verb=fetch", requestOptions)
            .then(handleErrors)
            .then(res => res.json())
            .then(json => {
                // this is already json so no casting necessary ?
                dispatch(fetchDetsSuccess(json));
                return json;
            })
            .catch(error => dispatch(fetchDetsFailure(error)));
    };
}

export const fetchDetsBegin = (specimenId, specimenDbId) => ({
    type: ActionTypes.FETCH_DETS_BEGIN,
    specimenId,
    specimenDbId
});

export const fetchDetsSuccess = fullResponse => ({
    type: ActionTypes.FETCH_DETS_SUCCESS,
    fullResponse
});

export const fetchDetsFailure = error => ({
    type: ActionTypes.FETCH_DETS_FAILURE,
    payload: { error }
});

function handleErrors(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

import ActionTypes from "./actionTypes";

export function fetchTags(specimenId, specimenDbId) {
    return dispatch => {

        dispatch(fetchTagsBegin(specimenId, specimenDbId));

        const requestOptions = {
            method: "POST",
            body: JSON.stringify({ specimenId, specimenDbId }),
            headers: {
                Accept: "application/json"
            }
        };

        return fetch("/tags.php?verb=fetch", requestOptions)
            .then(handleErrors)
            .then(res => res.json())
            .then(json => {
                // this is already json so no casting necessary ?
                dispatch(fetchTagsSuccess(json));
                return json;
            })
            .catch(error => dispatch(fetchTagsFailure(error)));
    };
}

export const fetchTagsBegin = (specimenId, specimenDbId) => ({
    type: ActionTypes.FETCH_TAGS_BEGIN,
    specimenId,
    specimenDbId
});

export const fetchTagsSuccess = fullResponse => ({
    type: ActionTypes.FETCH_TAGS_SUCCESS,
    fullResponse
});

export const fetchTagsFailure = error => ({
    type: ActionTypes.FETCH_TAGS_FAILURE,
    payload: { error }
});

function handleErrors(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

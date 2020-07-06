import ActionTypes from "./actionTypes";

export function saveTag(tagText, specimenId, specimenDbId) {
    return dispatch => {
        dispatch(saveTagBegin(tagText, specimenId, specimenDbId));

        const requestOptions = {
            method: "POST",
            body: JSON.stringify({ tagText, specimenId, specimenDbId }),
            headers: {
                Accept: "application/json"
            }
        };

        return fetch("/tags.php?verb=save", requestOptions)
            .then(handleErrors)
            .then(res => res.json())
            .then(json => {
                // this is already json so no casting necessary ?
                dispatch(saveTagSuccess(json));
                return json;
            })
            .catch(error => dispatch(saveTagFailure(error)));
    };
}

export const saveTagBegin = (tagText, specimenId, specimenDbId) => ({
    type: ActionTypes.SAVE_TAG_BEGIN,
    tagText,
    specimenId,
    specimenDbId
});

export const saveTagSuccess = fullResponse => ({
    type: ActionTypes.SAVE_TAG_SUCCESS,
    fullResponse
});

export const saveTagFailure = error => ({
    type: ActionTypes.SAVE_TAG_FAILURE,
    payload: { error }
});

function handleErrors(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

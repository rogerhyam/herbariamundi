import ActionTypes from "./actionTypes";

export function saveTag(tagText, specimenId) {
    return dispatch => {
        dispatch(saveTagBegin(tagText, specimenId));

        const requestOptions = {
            method: "POST",
            body: JSON.stringify({ tagText, specimenId }),
            headers: {
                Accept: "application/json"
            }
        };

        return fetch("/tags.php", requestOptions)
            .then(handleErrors)
            .then(res => res.json())
            .then(json => {
                let fullResponse = JSON.parse(json);
                dispatch(saveTagSuccess(fullResponse));
                return json;
            })
            .catch(error => dispatch(saveTagFailure(error)));
    };
}

export const saveTagBegin = (tagText, specimenId) => ({
    type: ActionTypes.SAVE_TAG_BEGIN,
    tagText,
    specimenId
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

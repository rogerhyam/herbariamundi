import ActionTypes from "./actionTypes";

export const searchFacetChange = (facetName, facetValue) => ({
    type: ActionTypes.SEARCH_FACET_CHANGE,
    facetName,
    facetValue
});




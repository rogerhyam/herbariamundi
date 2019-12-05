import ActionTypes from "../actions/ActionTypes";

const fetchSpecimensReducer = (state = {}, action) => {
  switch (action.type) {
    case ActionTypes.FETCH_SPECIMENS_BEGIN:
      return {
        ...state,
        loading: true,
        error: null
      };
    case ActionTypes.FETCH_SPECIMENS_SUCCESS:
      return {
        ...state,
        loading: false,
        items: action.payload.products
      };
    case ActionTypes.FETCH_SPECIMENS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        items: []
      };
    default:
      return state;
  }
};

export default fetchSpecimensReducer;

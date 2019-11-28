import {
  FETCH_SPECIMENS_BEGIN,
  FETCH_SPECIMENS_SUCCESS,
  FETCH_SPECIMENS_FAILURE
} from "../actions/actionTypes";

const fetchSpecimensReducer = (state = {}, action) => {
  switch (action.type) {
    case FETCH_SPECIMENS_BEGIN:
      return {
        ...state,
        loading: true,
        error: null
      };
    case FETCH_SPECIMENS_SUCCESS:
      return {
        ...state,
        loading: false,
        items: action.payload.products
      };
    case FETCH_SPECIMENS_FAILURE:
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

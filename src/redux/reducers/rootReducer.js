import { combineReducers } from "redux";
import fetchSpecimensReducer from "./fetchSpecimensReducer";

export default combineReducers({
  specimens: fetchSpecimensReducer
});

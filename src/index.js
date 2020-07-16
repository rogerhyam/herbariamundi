import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import HerbariaMundi from "./components/HerbariaMundi";
import { Provider } from "react-redux";
import store from "./redux/store";

Window.prototype.realAddEventListener =
  HTMLAnchorElement.prototype.addEventListener;

ReactDOM.render(
  <Provider store={store}>
    <HerbariaMundi />
  </Provider>
  , document.getElementById("root"));

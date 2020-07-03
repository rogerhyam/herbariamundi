import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import HerbariaMundi from "./components/HerbariaMundi";

Window.prototype.realAddEventListener =
  HTMLAnchorElement.prototype.addEventListener;

ReactDOM.render(<HerbariaMundi />, document.getElementById("root"));

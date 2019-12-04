import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import HerbariaMundi from "./components/HerbariaMundi";

Window.prototype.realAddEventListener =
  HTMLAnchorElement.prototype.addEventListener;

Window.prototype.addEventListener = function(a, b, c) {
  if (a === "dragstart" || a === "dragover") {
    console.log("Prevented " + a + " listener on window");
    console.log(b);
  } else {
    this.realAddEventListener(a, b, c);
  }
};

ReactDOM.render(<HerbariaMundi />, document.getElementById("root"));

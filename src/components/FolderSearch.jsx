import React from "react";
import { connect } from "react-redux";
import MyHerbariumPart from "./MyHerbariumPart";
import { setFocus, FocusTargetTypes } from "../redux/actions/setFocusAction";

class FolderSearch extends MyHerbariumPart {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <li>
        <button
          type="button"
          style={this.buttonStyle}
          onClick={() => this.props.setFocus(FocusTargetTypes.SEARCH, null)}
        >
          <span role="img" aria-label="Search">
            🔎
          </span>{" "}
          Discover
        </button>
      </li>
    );
  }
}
export default connect(null, { setFocus })(FolderSearch);
//export default CabinetSearch;

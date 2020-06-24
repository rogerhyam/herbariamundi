import React from "react";
import { connect } from "react-redux";
import Cabinet from "./Cabinet";
import { setFocus, FocusTargetTypes } from "../redux/actions/setFocusAction";

class CabinetMundi extends Cabinet {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.props.setFocus(FocusTargetTypes.SEARCH, null);
  }

  render() {
    return (
      <li style={{ marginBottom: "0.5rem" }}>
        <button
          type="button"
          style={this.buttonStyle}
          onClick={() => this.props.setFocus(FocusTargetTypes.SEARCH, null)}
        >
          <span role="img" aria-label="Globe">
            🌍
          </span>{" "}
          {this.props.title}
        </button>
      </li>
    );
  }
}

export default connect(null, { setFocus })(CabinetMundi)
//export default CabinetMundi;

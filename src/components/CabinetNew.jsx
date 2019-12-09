import React, { Component } from "react";
import Cabinet from "./Cabinet";
import { connect } from "react-redux";
import { newCabinet } from "../redux/actions/cabinetActions";

class CabinetNew extends Cabinet {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <li>
        <button
          type="button"
          style={{
            ...this.buttonStyle,
            fontSize: "80%",
            fontStyle: "italic",
            color: "gray"
          }}
          onClick={e => this.props.newCabinet()}
        >
          <span role="img" aria-label="New">
            ✨
          </span>
          Add Cabinet
        </button>
      </li>
    );
  }
}

export default connect(null, { newCabinet })(CabinetNew);
//export default CabinetNew;

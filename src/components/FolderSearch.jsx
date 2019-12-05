import React from "react";
import { connect } from "react-redux";
import Folder from "./Folder";
import { fetchSpecimens } from "../redux/actions/fetchSpecimensActions";

class FolderSearch extends Folder {
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
          onClick={this.props.fetchSpecimens}
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
export default connect(null, { fetchSpecimens })(FolderSearch);
//export default CabinetSearch;

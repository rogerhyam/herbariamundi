import React, { Component } from "react";
import CabinetTemp from "./CabinetTemp";
import CabinetDynamic from "./CabinetDynamic";
import FolderSearch from "./FolderSearch";
import FolderWaste from "./FolderWaste";
import FolderWorkbench from "./FolderWorkbench";
import CabinetTools from "./CabinetTools";

import Folder from "./Folder";

class MyHerbarium extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  cabinetListStyle = {
    listStyleType: "none",
    margin: "1rem",
    padding: 0
  };
  render() {
    return (
      <ul style={this.cabinetListStyle}>
        <CabinetTools title="Tools">
          <FolderSearch />
          <FolderWorkbench />
          <FolderWaste />
        </CabinetTools>

        <CabinetTemp title="Temporary">
          <Folder title="2019-11-10" />
          <Folder title="2019-10-22" />
          <Folder title="2019-09-09" />
        </CabinetTemp>
        <CabinetDynamic title="Cabinate 2">
          <Folder title="Folder 1" />
          <Folder title="Folder 2" />
          <Folder title="Folder 3" />
        </CabinetDynamic>
        <CabinetDynamic title="Cabinate 1">
          <Folder title="Folder 1" />
          <Folder title="Folder 2" />
          <Folder title="Folder 3" />
        </CabinetDynamic>
      </ul>
    );
  }
}

export default MyHerbarium;

import React, { Component } from "react";
import CabinetTemp from "./CabinetTemp";
import CabinetDynamic from "./CabinetDynamic";
import Folder from "./Folder";

class MyHerbarium extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <ul>
        <CabinetTemp title="Temp Specimens">
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

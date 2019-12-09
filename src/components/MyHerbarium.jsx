import React, { Component, Fragment } from "react";
import CabinetTemp from "./CabinetTemp";
import CabinetDynamic from "./CabinetDynamic";
import FolderSearch from "./FolderSearch";
import FolderWaste from "./FolderWaste";
import FolderWorkbench from "./FolderWorkbench";
import FolderEdit from "./FolderEdit";
import CabinetTools from "./CabinetTools";
import { connect } from "react-redux";
import { fetchMyHerbarium } from "../redux/actions/fetchMyHerbariumActions";

import Folder from "./Folder";
import CabinetNew from "./CabinetNew";

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

  componentDidMount() {
    this.props.fetchMyHerbarium();
  }

  render() {
    return (
      <Fragment>
        <ul style={this.cabinetListStyle}>
          <CabinetTools title="Tools">
            <FolderSearch />
            <FolderWorkbench />
            <FolderEdit />
            <FolderWaste />
          </CabinetTools>
          <CabinetTemp title="Temporary">
            <Folder title="2019-11-10" />
            <Folder title="2019-10-22" />
            <Folder title="2019-09-09" />
          </CabinetTemp>
          {this.getDynamicCabinets()}
          <CabinetNew />
        </ul>
      </Fragment>
    );
  }

  getDynamicCabinets() {
    const { cabinets } = this.props;
    return cabinets.map(cab => (
      <CabinetDynamic title={cab.title} id={cab.id}>
        <Folder title="Folder 1" />
        <Folder title="Folder 2" />
        <Folder title="Folder 3" />
      </CabinetDynamic>
    ));
  }
}

const mapStateToProps = state => {
  const { cabinets } = state;
  const cabs = [];
  cabinets.cabinetIds.map(id => {
    cabs.push(cabinets.byId[id]);
    return id;
  });
  return { cabinets: cabs };
};
export default connect(mapStateToProps, { fetchMyHerbarium })(MyHerbarium);
// export default MyHerbarium;

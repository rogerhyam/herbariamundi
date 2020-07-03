import React, { Component, Fragment } from "react";
import CabinetDynamic from "./CabinetDynamic";
import FolderSearch from "./FolderSearch";
import FolderWaste from "./FolderWaste";
import FolderWorkbench from "./FolderWorkbench";
import FolderEdit from "./FolderEdit";
import CabinetMundi from "./CabinetMundi";
import CabinetSavedSearches from "./CabinetSavedSearches";
import { connect } from "react-redux";
import { fetchMyHerbarium } from "../redux/actions/fetchMyHerbariumActions";
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

  /*
            <CabinetTools title="Tools" key="tools">
            <FolderSearch />
            <FolderWorkbench />
            <FolderEdit />
            <FolderWaste />
          </CabinetTools>
          <CabinetSavedSearches title="Saved Searches" key="savedSearches" />

  */

  render() {
    return (
      <Fragment>
        <ul style={this.cabinetListStyle}>
          <CabinetMundi title="All Specimens" key="allSpecimens" />
          <FolderWorkbench />
          {this.getDynamicCabinets()}
          <CabinetNew key="newcab" />
        </ul>
      </Fragment>
    );
  }

  getDynamicCabinets() {
    const { cabinets } = this.props;
    return cabinets.map((cab, index, allCabinets) => (
      <CabinetDynamic
        title={cab.title}
        description={cab.desciption}
        id={cab.id}
        key={cab.id}
        isFirst={index == 0 ? true : false}
        isLast={index >= allCabinets.length - 1 ? true : false}
      />
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

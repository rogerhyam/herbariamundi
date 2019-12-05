import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { fetchSpecimens } from "../redux/actions/fetchSpecimensActions";
import Container from "react-bootstrap/Container";
import SpecimenCard from "./SpecimenCard";

class SpecimenBrowser extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <Fragment>
        <Container fluid={true}>
          {this.props.specimens.map(sp => (
            <SpecimenCard specimen={sp} key={sp.cetaf_id} mini={false} />
          ))}
        </Container>
      </Fragment>
    );
  }
}

//export default TextList;
const mapStateToProps = state => {
  const specimens = [];
  state.specimens.browser.specimenIds.map(id => {
    specimens.push(state.specimens.byId[id]);
    return id;
  });
  return { specimens };
};

// wrap the big boy in a connector
export default connect(mapStateToProps, { fetchSpecimens })(SpecimenBrowser);

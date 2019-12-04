import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { fetchSpecimens } from "../redux/actions/fetchSpecimensActions";
import Button from "react-bootstrap/Button";
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
        <p>
          <Button onClick={() => this.props.fetchSpecimens()}>Refresh</Button>
        </p>
        <Container fluid={true}>
          {this.props.items.map(sp => (
            <SpecimenCard specimen={sp} key={sp.cetaf_id} />
          ))}
        </Container>
      </Fragment>
    );
  }
}

//export default TextList;
const mapStateToProps = state => {
  // should appear as an array in the properties.
  if ("specimens" in state && "items" in state.specimens) {
    return { items: state.specimens.items };
  } else {
    // items not defined so give them an empty one
    return { items: [] };
  }
};

// wrap the big boy in a connector
export default connect(mapStateToProps, { fetchSpecimens })(SpecimenBrowser);

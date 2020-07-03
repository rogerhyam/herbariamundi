import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { fetchSpecimens } from "../redux/actions/fetchSpecimensActions";
import Container from "react-bootstrap/Container";
import SpecimenCard from "./SpecimenCard";
import SpecimenCardModal from "./SpecimenCardModal";

class SpecimenBrowser extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <Fragment>
        {this.renderSpecimenCards()}
      </Fragment>
    );
  }

  renderSpecimenCards() {
    const { specimens, loading } = this.props;

    if (loading) {
      return <Fragment>Loading ... </Fragment>;
    }

    if (specimens.length == 0) {
      return (
        <Fragment>No specimens to show.</Fragment>
      );
    }

    return (
      <>
        <Container fluid="xl" style={{ padding: "0" }}>
          {specimens.map(sp => (
            <SpecimenCard
              specimen={sp}
              key={sp.id}
              mini={false}
            />
          ))}
        </Container>
        <SpecimenCardModal />
      </>
    );
  }
}
//export default TextList;
const mapStateToProps = state => {
  const { browser } = state.specimens;
  const { loading } = browser;
  // expand the specimen ids into specimens
  const specimens = [];
  browser.specimenIds.map(id => {
    specimens.push(state.specimens.byId[id]);
    return id;
  });

  return { specimens, loading };
};
export default connect(mapStateToProps, { fetchSpecimens })(SpecimenBrowser);

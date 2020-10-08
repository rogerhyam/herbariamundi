import React, { Component } from "react";
import { connect } from "react-redux";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import SpecimenBrowser from "./SpecimenBrowser";
import SearchForm from "./SearchForm";
import SearchFormPager from "./SearchFormPager";


class Specimens extends Component {
    constructor(props) {
      super(props);
      this.state = {};
    }

    render() {
        return (
          <Container fluid={true} style={{ marginTop: "1em", marginBottom: "1em" }}>
            <Row>
              <Col>
                <SearchForm />
              </Col>
            </Row>
            <Row>
              <Col>
                <SpecimenBrowser />
              </Col>
            </Row>
            <Row>
              <Col style={{ textAlign: "center" }}>
                <SearchFormPager />
              </Col>
            </Row>
          </Container>
        );
    }


}
const mapStateToProps = state => {
    return {
       
    };
};
export default connect(mapStateToProps, {})(Specimens);
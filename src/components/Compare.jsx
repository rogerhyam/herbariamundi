import React, { Component } from "react";
import { connect } from "react-redux";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ComparePanel from "./ComparePanel";
import Container from "react-bootstrap/Container";

class Compare extends Component {
    constructor(props) {
      super(props);
      this.state = {};
    }

    render() {
        return (
            <Row noGutters={true} fluid={true} className="h-100">
                <Col style={{borderRight: "solid 1px gray", marginRight: "0.5em"}}>
                    <ComparePanel name="left" specimenIds={this.props.searchSpecimenIds}>
                        Specimens loaded from last search on specimens tab.
                    </ComparePanel>
                </Col>
                <Col style={{borderLeft: "solid 1px gray", marginLeft: "0.5em"}}>
                    <ComparePanel name="right" specimenIds={this.props.compareSpecimenIds} >
                        Specimens loaded by pressing "compare" button on specimens tab.
                    </ComparePanel>
                </Col>
            </Row>
        );
    }


}
const mapStateToProps = state => {
    return {
        searchSpecimenIds: state.specimens.browser.specimenIds,
        compareSpecimenIds: state.specimens.compare.specimenIds
    };
};
export default connect(mapStateToProps, {})(Compare);
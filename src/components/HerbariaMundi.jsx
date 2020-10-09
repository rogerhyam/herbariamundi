import React, { Component } from "react";
import { connect } from "react-redux";
import "bootstrap/dist/css/bootstrap.min.css";
import Nav from "react-bootstrap/Nav";
import Tab from "react-bootstrap/Tab";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import About from "./About";
import Account from "./Account";
import Compare from "./Compare";
import Specimens from "./Specimens";
import { updateAuthenticationStatus } from "../redux/actions/updateAuthenticationStatus"

/**
 * Root component for the application
 */
class HerbariaMundi extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.props.updateAuthenticationStatus();
  }

  render() {
    return (

<Tab.Container  defaultActiveKey="specimens">
<div id="tab-wrapper" style={{height: '100%', display: "flex", flexDirection: "column", padding: "0px" }}>
<Row noGutters={true}>
  <Col>
    <Nav variant="tabs">
      <Nav.Item>
        <Nav.Link eventKey="specimens" >Specimens</Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="compare">Compare</Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="about">About</Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="account">Account</Nav.Link>
      </Nav.Item>
    </Nav>
  </Col>
</Row>
<Row style={{flexGrow: 1}} noGutters={true}>
  <Col>
    <Tab.Content className="h-100">
      <Tab.Pane eventKey="specimens">
        <Specimens />
      </Tab.Pane>
      <Tab.Pane eventKey="compare" className="h-100">
        <Compare />
      </Tab.Pane>
      <Tab.Pane eventKey="about">
        <About />
      </Tab.Pane>
      <Tab.Pane eventKey="account">
        <Account />
      </Tab.Pane>
    </Tab.Content>
  </Col>
</Row>
</div>
</Tab.Container>


    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user
  };
};
export default connect(mapStateToProps, { updateAuthenticationStatus })(HerbariaMundi);

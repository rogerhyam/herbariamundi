import React, { Component } from "react";
import Navbar from "react-bootstrap/NavBar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import SpecimenBrowser from "./SpecimenBrowser";
import { Provider } from "react-redux";
import store from "../redux/store";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import MyHerbarium from "./MyHerbarium";
import Workbench from "./Workbench";
import SearchForm from "./SearchForm";
import CabinetEditForm from "./CabinetEditForm";
import FolderEditForm from "./FolderEditForm";

/**
 * Root component for the application
 */
class HerbariaMundi extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <Provider store={store}>
        <Navbar bg="dark" variant="dark" expand="lg">
          <Navbar.Brand href="#home">Herbaria Mundi</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link href="#home">Home</Nav.Link>
              <Nav.Link href="#link">Link</Nav.Link>
              <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                <NavDropdown.Item href="#action/3.2">
                  Another action
                </NavDropdown.Item>
                <NavDropdown.Item href="#action/3.3">
                  Something
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="#action/3.4">
                  Separated link
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
            <Form inline>
              <Button variant="outline-success">Login with ORCID</Button>
            </Form>
          </Navbar.Collapse>
        </Navbar>
        <Tabs defaultActiveKey="specimens" id="mainTabs">
          <Tab eventKey="specimens" title="Specimens">
            <Container fluid={true} style={{ padding: 0 }}>
              <Row noGutters={true}>
                <Col md={2}>
                  <p> </p>
                  <MyHerbarium />
                </Col>
                <Col style={{ padding: "1em" }}>
                  <CabinetEditForm />
                  <FolderEditForm />
                  <SearchForm />
                  <SpecimenBrowser />
                </Col>
              </Row>
            </Container>
          </Tab>
          <Tab eventKey="workbench" title="Workbench" id="Workbench01">
            <Workbench />
          </Tab>
          <Tab eventKey="compare" title="Compare">
            Compare two specimens side by side
          </Tab>
          <Tab eventKey="upload" title="Upload">
            This is where you can create new virtual specimens.
          </Tab>
        </Tabs>
      </Provider>
    );
  }
}

export default HerbariaMundi;

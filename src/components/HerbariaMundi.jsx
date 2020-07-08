import React, { Component } from "react";
import Navbar from "react-bootstrap/NavBar";
import Nav from "react-bootstrap/Nav";
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
import Workbench from "./Workbench";
import SearchForm from "./SearchForm";
import SearchFormPager from "./SearchFormPager";

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
        { /*
        <Navbar bg="dark" variant="dark" expand="lg">
          <Navbar.Brand href="#home">Herbaria Mundi</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto"></Nav>
            <Form inline>
              <Button
                variant="outline-success"
                onClick={e =>
                  alert(
                    "Authentication will be implemented in next update.   etc will then be stored permanently."
                  )
                }
              >
                Login with ORCID
              </Button>
            </Form>
          </Navbar.Collapse>
        </Navbar>
              */}
        <Tabs defaultActiveKey="specimens" id="mainTabs">
          <Tab eventKey="specimens" title="Herbaria Mundi">
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
          </Tab>
          {/*}
          <Tab eventKey="workbench" title="Workbench" id="Workbench01">
            <Workbench />
          </Tab>
            {*/}
          <Tab eventKey="about" title="About">
            <Container style={{ paddingTop: "2em" }}>
              <h2>About</h2>
              <p>
                This is a proof of concept application to facilitate online
                identification by matching of forest plot voucher specimens with
                reference specimens in the world's herbaria.
              </p>

              <h3>Video Overview</h3>
              <center>
                <iframe
                  width="560"
                  height="315"
                  src="https://www.youtube.com/embed/_4DuNBVsWW8"
                  frameBorder="0"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </center>
              <p>&nbsp;</p>

              <h3>Support</h3>
              <p>
                Initial development work was carried out as part of a project
                funded by the British Council and Newton Fund. It is now being
                added to as part of Synthesys+. It is very much work in
                progress! Contact{" "}
                <a href="mailto:rhyam@rbge.org.uk">Roger Hyam</a> with any
                comments.
              </p>

              <h3>About the British Council</h3>
              <p>
                <a href="https://www.britishcouncil.org/">
                  <img
                    src="images/British_Council.png"
                    alt="British Council Logo"
                    style={{ float: "right", width: "15rem" }}
                  />
                </a>
                The British Council is the UK’s international organisation for
                cultural relations and educational opportunities. We were
                founded in 1934 and incorporated by Royal Charter in 1940.
              </p>
              <p>
                For more information visit:{" "}
                <a href="https://www.britishcouncil.org/">
                  www.britishcouncil.org
                </a>
              </p>

              <h3>About the Newton Fund</h3>
              <p>
                <a href="https://www.newtonfund.ac.uk">
                  <img
                    src="images/Newton-Fund-Master-rgb-small.JPG"
                    alt="Newton Fund Logo"
                    style={{ float: "right", width: "15rem" }}
                  />
                </a>
                The Newton Fund is now a £735 million fund which, through
                science and innovation partnerships, promotes the economic
                development and social welfare of partnering countries. It aims
                to strengthen science and innovation capacity and unlock further
                funding through which the UK and partner countries will build
                strong, sustainable and systemic relationships. It is delivered
                through 7 UK delivery partners in collaboration with the partner
                countries. Activities are in three broad activities:{" "}
              </p>
              <div>
                <ul>
                  <li>
                    <strong>People:</strong> increasing capacity for science and
                    innovation in partner countries.
                  </li>
                  <li>
                    <strong>Research:</strong> collaborations on development
                    topics.
                  </li>
                  <li>
                    <strong>Translation:</strong> creating collaborative
                    solutions to development challenges and strengthening
                    innovation systems.
                  </li>
                </ul>
                <p>
                  For more information visit:{" "}
                  <a href="https://www.newtonfund.ac.uk">
                    www.newtonfund.ac.uk
                  </a>{" "}
                  and follow via Twitter:{" "}
                  <a href="https://twitter.com/NewtonFund">@NewtonFund</a>
                </p>
              </div>
            </Container>
          </Tab>
          <Tab eventKey="account" title="Your Account">
            <Container style={{ paddingTop: "2em" }}>
              <p>Access to Herbaria Mundi is only available researchers who have an ORCID.</p>
              <p>Please log in using your ORCID.</p>
              <p>This is so we can track usage of specimens and report back to herbaria.</p>
            </Container>
          </Tab>
        </Tabs>
      </Provider >
    );
  }
}

export default HerbariaMundi;

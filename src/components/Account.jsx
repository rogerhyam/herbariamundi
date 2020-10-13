import React, { Component } from "react";
import { connect } from "react-redux";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import OrcidCard from "./OrcidCard";
import AccountMyData from "./AccountMyData";


class Account extends Component {
    constructor(props) {
      super(props);
      this.state = {};
    }

    render() {

        return (
          <Container style={{ paddingTop: "1em" }}>
            <OrcidCard />
            <AccountMyData />
            <Card style={{ marginTop: "1em" }}>
              <Card.Header>Privacy and Safeguarding</Card.Header>
              <Card.Body>
                <Card.Text>
                  Herbaria Mundi strives to promote open science whilst respecting individuals privacy and safety.
                  We have adopted the following principles.
                        <ul>
                    <li>We treat everyone with equal respect.</li>
                    <li>We store as little personal information as possible.
                                Currently this is only your ORCID iD and your name as it is exposed by ORCID.</li>
                    <li>All your contributions are associated with your ORCID iD and name and visible to everyone who has signed in as well as contributing institutions and in published data.</li>
                    <li>We share usage statistics with institutions that may include your ORCID iD.</li>
                    <li>If you <a href="mailto:rhyam@rbge.org.uk">email us</a> we will remove all the data linked to your ORCID iD that we store on our systems.</li>
                    <li>Everyone is entitled to participate in a safe and enjoyable environment. If you have any concerns please <a href="mailto:rhyam@rbge.org.uk">email us</a>.</li>
                    <li>In extremis we reserve the right to remove data and or people from the system at our own discretion.</li>
                  </ul>
                </Card.Text>
              </Card.Body>
            </Card>
          </Container>
        );
    }


}
const mapStateToProps = state => {
  return {
    user: state.user
  };
};
export default connect(mapStateToProps, {})(Account);
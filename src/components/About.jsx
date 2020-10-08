import React, { Component } from "react";
import { connect } from "react-redux";
import Container from "react-bootstrap/Container";


class About extends Component {
    constructor(props) {
      super(props);
      this.state = {};
    }

    render() {
        return (
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
        );
    }


}
const mapStateToProps = state => {
    return {
       
    };
};
export default connect(mapStateToProps, {})(About);
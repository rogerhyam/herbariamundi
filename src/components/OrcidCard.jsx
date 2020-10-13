import React, { Component } from "react";
import { connect } from "react-redux";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { logout } from "../redux/actions/log_out"

class OrcidCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            orcidButtonOn: false,
            orcidButtonStyle: this.orcidButtonStyle
        };
    }

    orcidButtonStyle = {
        border: "1px solid #D3D3D3",
        padding: "0.3em",
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "1px 1px 3px #999",
        cursor: "pointer",
        color: "#999",
        fontWeight: "bold",
        fontSize: "0.8em",
        lineHeight: "24px",
        verticalAlign: "middle"
    }

    orcidButtonHoverStyle = {
        border: "1px solid #338caf",
        color: "#338caf"
    }

    orcidButtonImageStyle = {
        display: "block",
        margin: "0 .5em 0 0",
        padding: "0",
        float: "left"
    }

    orcidLinkImageStyle = {
        margin: "0.1em .5em 0.1em 0.1em",
        padding: "0"
    }

    orcidButtonToggle = e => {
        if (this.state.orcidButtonOn) {
            this.setState({
                orcidButtonOn: false,
                orcidButtonStyle: this.orcidButtonStyle
            });
        } else {
            this.setState({
                orcidButtonOn: true,
                orcidButtonStyle: { ...this.orcidButtonStyle, ...this.orcidButtonHoverStyle }
            });
        }

    }

    login = e => {
        var oauthWindow = window.open(
            this.props.user.orcid_login_uri,
            "_blank",
            "toolbar=no, scrollbars=yes, width=500, height=600, top=100, left=500"
        );
    }

    logout = e => {
        this.props.logout();
    }

    render() {
        return this.props.user.logged_in ? this.getSignOutCard() : this.getSignInCard();
    }

    getSignOutCard() {
        return (
            <Card>
                <Card.Header> <img
                    style={this.orcidButtonImageStyle}
                    id="orcid-id-icon"
                    src="https://orcid.org/sites/default/files/images/orcid_24x24.png"
                    width="24" height="24" alt="ORCID iD icon"
                /> Authenticated</Card.Header>
                <Card.Body>
                    <Card.Title>{this.props.user.user_name}</Card.Title>
                    <Card.Text>
                        <p>
                            <span
                                style={{ ...this.state.orcidButtonStyle, padding: '0.5em' }}
                                onMouseOver={this.orcidButtonToggle}
                                onMouseOut={this.orcidButtonToggle}>
                                <a
                                    style={{ color: '#338caf' }}
                                    href={'https://orcid.org/' + this.props.user.orcid}>
                                    <img
                                        style={this.orcidLinkImageStyle}
                                        id="orcid-id-icon"
                                        src="https://orcid.org/sites/default/files/images/orcid_24x24.png"
                                        width="24" height="24" alt="ORCID iD icon"
                                    />
                        https://orcid.org/{this.props.user.orcid}</a>
                            </span>
                        </p>
                        <p>You are signed in with the ORCID iD above. If this isn't you please sign out now.</p>
                        <p>To access the specimens click on 'Herbaria Mundi' on the top left.</p>
                        <p><Button onClick={this.logout} variant="secondary" >Sign Out</Button></p>
                    </Card.Text>
                </Card.Body>
            </Card>
        );
    }

    getSignInCard() {

        return (
            <Card>
                <Card.Header> <img
                    style={this.orcidButtonImageStyle}
                    id="orcid-id-icon"
                    src="https://orcid.org/sites/default/files/images/orcid_24x24.png"
                    width="24" height="24" alt="ORCID iD icon"
                /> Authentication</Card.Header>
                <Card.Body>
                    <Card.Title>ORCID Sign In Required</Card.Title>
                    <Card.Text>
                        <p>
                            Access to Herbaria Mundi requires an ORCID sign in.
                            This is so we can:
                    </p>
                        <ul>
                            <li>Give credit for contributions from users.</li>
                            <li>Report on usage to contributing institutions.</li>
                            <li>Manage mischief.</li>
                        </ul>
                        <p>
                            Please sign in using this button.
                    </p>
                        <p>
                            <Button
                                style={this.state.orcidButtonStyle}
                                onMouseOver={this.orcidButtonToggle}
                                onMouseOut={this.orcidButtonToggle}
                                id="connect-orcid-button"
                                onClick={this.login}>
                                <img
                                    style={this.orcidButtonImageStyle}
                                    id="orcid-id-icon"
                                    src="https://orcid.org/sites/default/files/images/orcid_24x24.png"
                                    width="24" height="24" alt="ORCID iD icon"
                                />
                                Register or Connect your ORCID iD
                        </Button>
                        </p>
                    The button also enables the creation of a free ORCID iD if you don't have one already.
                    </Card.Text>

                </Card.Body>
                {/*
            <Card.Footer className="text-muted">2 days ago</Card.Footer>
            */}
            </Card>
        );


    }

}

const mapStateToProps = state => {
    return { user: state.user };
};
export default connect(mapStateToProps, { logout })(OrcidCard);




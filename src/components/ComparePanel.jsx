import React, { Component } from "react";
import { connect } from "react-redux";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

class ComparePanel extends Component {
    constructor(props) {
      super(props);
      this.state = {
        currentSpecimenIndex: 0,
        currentSpecimen: null
      };
    }

    buttonStyle = {

        marginRight: "0.5em"

    }

    getCurrentSpecimen = () =>{
        
        // if we don't have any we return nul
        if(this.props.specimenIds.length == 0) return null;
        let specimenId = this.props.specimenIds[this.state.currentSpecimenIndex];
        return this.props.specimensById[specimenId];

    }

    getSpecimenProviderLogo = () =>{

        let specimen = this.getCurrentSpecimen();

        if(specimen == null){
            return "";
        }else{
            return (
                <a href={specimen.provider_homepage_uri_s} target="_new">
                <img
                  src={specimen.provider_logo_path_s}
                  style={{ maxHeight: "50px" }}
                />
                </a>
                );
        }
    }

    getSpecimenTitleText = () =>{

        let specimen = this.getCurrentSpecimen();

        if(specimen == null){
            return "No specimens selected";
        }else{

            let title = specimen.hasOwnProperty("scientific_name_ss")
                ? specimen.scientific_name_ss + ":"
                : "Specimen:";
            
            title += specimen.hasOwnProperty("collector_ss")
            ? " " + specimen.collector_ss
            : "";

            title += specimen.hasOwnProperty("collector_number_ss")
            ? " " + specimen.collector_number_ss
            : "";

            return title;

        }
    }

    hasPrevious = () =>{
        if(this.state.currentSpecimenIndex > 0 && this.props.specimenIds.length > 0){
            return true;
        }else{
            return false;
        }
    }

    hasNext = () =>{
        if (this.props.specimenIds.length > this.state.currentSpecimenIndex -1) return true;
    }

    nextSpecimen = () =>{
        let i = this.state.currentSpecimenIndex;
        i++;
        this.setState({currentSpecimenIndex: i});
    }

    previousSpecimen = () =>{
        let i = this.state.currentSpecimenIndex;
        i--;
        this.setState({currentSpecimenIndex: i});
    }

    render() {
        return (
            <div style={{ 
                display: "flex",
                flexDirection: "column",
                flexWrap: "nowrap",
                alignItems: "stretch",
                height: "100%",
                margin: "0px"
                }}
                >
                {/* header */}
                <div style={{display: "flex", borderBottom: "solid gray 1px", alignItems: "center", padding: "0.5em", height: "80px", margin: 0}} >
                    <div style={{marginRight: "1em"}}>
                        {  this.getSpecimenProviderLogo() }
                    </div>
                    <div style={{marginRight: "1em", flexGrow: 1}}>
                        <strong>{ this.getSpecimenTitleText() }</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end"}}>
                                <Button variant="outline-secondary" style={this.buttonStyle} onClick={this.handleSaveDet} disabled={false} >Det</Button>
                                <Button variant="outline-secondary" style={this.buttonStyle} onClick={this.handleSaveDet} disabled={false} >Tag</Button>
                    </div>
                </div>

                {/* body */}
                <div style={{flexGrow: 1}} >Body</div>

                {/* Footer */}
                <div style={{display: "flex", alignItems: "center", borderTop: "solid gray 1px", padding: "0.5em", margin: 0}} >
                    <div style={{ display: "flex",  flexGrow: 1, justifyContent: "flex-start", alignItems: "center"}}>
                        {this.props.children}
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center"}}>
                                <div style={{marginRight: "1em"}}>{this.state.currentSpecimenIndex + 1} of {this.props.specimenIds.length}</div>
                                <Button 
                                    variant="outline-secondary"
                                    style={this.buttonStyle}
                                    onClick={this.previousSpecimen}
                                    disabled={!this.hasPrevious()} >Previous</Button>
                                <Button
                                    variant="outline-secondary"
                                    style={this.buttonStyle}
                                    onClick={this.nextSpecimen}
                                    disabled={!this.hasNext()} >Next</Button>
                    </div>
                </div>

            </div>


        );
    }


}
const mapStateToProps = state => {
    return {
       specimensById: state.specimens.byId
    };
};
export default connect(mapStateToProps, {})(ComparePanel);
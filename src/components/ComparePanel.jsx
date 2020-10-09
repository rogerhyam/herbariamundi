import React, { Component } from "react";
import { connect } from "react-redux";
import Button from "react-bootstrap/Button";
import OpenSeadragon from 'openseadragon';
import { showSpecimenModal } from "../redux/actions/showSpecimenModal"


class ComparePanel extends Component {
    constructor(props) {
      super(props);
      this.state = {
        currentSpecimenIndex: 0
      };
      this.viewer = null;
    }

    buttonStyle = {

        marginRight: "0.5em"

    }

    /**
     * If the specimens have changed then the
     * index may be out of order and we need to
     * return an appropriate one.
     * Can't change state when property changes or we 
     * get in a loop
     * 
     */
    getCurrentSpecimenIndex = () =>{

        if(this.state.currentSpecimenIndex < this.props.specimenIds.length){
            return this.state.currentSpecimenIndex;
        }
         
        if(this.state.currentSpecimenIndex >= this.props.specimenIds.length){
            return this.props.specimenIds.length -1;
        }
        
        return 0;

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
        if(this.getCurrentSpecimenIndex() > 0 && this.props.specimenIds.length > 0){
            return true;
        }else{
            return false;
        }
    }

    hasNext = () =>{
        if (this.props.specimenIds.length  -1  > this.getCurrentSpecimenIndex()) return true;
    }

    nextSpecimen = () =>{
        let i = this.state.currentSpecimenIndex;
        i++;
        this.setState({currentSpecimenIndex: i}, () =>{
            this.initLoupe();
        });
    }

    previousSpecimen = () =>{
        let i = this.state.currentSpecimenIndex;
        i--;
        this.setState({currentSpecimenIndex: i}, () =>{
            this.initLoupe();
        });
    }

    handleDet = e =>{
        const specimen = this.getCurrentSpecimen();
        if (specimen == null) return;
        this.props.showSpecimenModal({
            id: specimen.id,
            x: 0,
            y: 0,
            tab: "dets"
          });

    }

    handleTag = e =>{
        const specimen = this.getCurrentSpecimen();
        if (specimen == null) return;
        this.props.showSpecimenModal({
            id: specimen.id,
            x: 0,
            y: 0,
            tab: "tags"
          });
    }

    initLoupe() {

        const specimen = this.getCurrentSpecimen();

        // no specimen no go
        if (specimen == null) return;

        // get the manifest uri
        const manifestUri = specimen.iiif_manifest_uri_ss[0];

        // if that hasn't changed do nothing
        // don't want to go parsing it if we don't have to
        if (this.state.manifestUri == manifestUri) {
            return;
        }else{
            this.setState({ 'manifestUri': manifestUri });
        }

        // extract the image service for the first painting annotation of the first canvas
        // and set it in thes state
        const requestOptions = {
            method: "POST",
            body: JSON.stringify({ 'manifest_uri': manifestUri }),
            headers: { Accept: "application/json" }
        };

        fetch("/fetch_parsed_manifest.php", requestOptions)
            .then(res => res.json())
            .then(json => {
                let imgServiceUri = json.canvases[0].image_info_uri;
                //  more protection for double loading
                if (this.state.imageServiceUri != imgServiceUri) {
                    this.setState({ 'imageServiceUri': imgServiceUri }, this.initOpenSeadragon);
                } else {
                    this.initOpenSeadragon(imgServiceUri);
                }
            })
            .catch(error => console.log(error));
    }

    initOpenSeadragon() {


        // if the viewer is already created 
        // we just need to change its tilesouse
        if(this.viewer != null){
            this.viewer.open(this.state.imageServiceUri);
            return;
        }

        this.viewer = OpenSeadragon({
            id: this.props.loupeId,
            prefixUrl: "/images/openseadragon/",
            showNavigator: true,
            tileSources: this.state.imageServiceUri,
            defaultZoomLevel: 0,
            showFullPageControl: false
        });
        /*
        this.viewer.addHandler('open', (event) => {
            this.viewer.viewport.zoomTo(1, new OpenSeadragon.Point(this.props.x, this.props.y), true);
        });
        */

    }

    render() {

        // initLoupe will only update 
        // if the specimen has changed
        this.initLoupe();

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
                                <Button variant="outline-secondary" style={this.buttonStyle} onClick={this.handleDet} disabled={false} >Det</Button>
                                <Button variant="outline-secondary" style={this.buttonStyle} onClick={this.handleTag} disabled={false} >Tag</Button>
                    </div>
                </div>

                {/* body */}
                <div style={{flexGrow: 1}} >
                    <div style={{ height: '100%', width: '100%' }} id={this.props.loupeId}></div>
                </div>

                {/* Footer */}
                <div style={{display: "flex", alignItems: "center", borderTop: "solid gray 1px", padding: "0.5em", margin: 0}} >
                    <div style={{ display: "flex",  flexGrow: 1, justifyContent: "flex-start", alignItems: "center"}}>
                        {this.props.children}
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center"}}>
                                <div style={{marginRight: "1em"}}>{this.getCurrentSpecimenIndex()+ 1} of {this.props.specimenIds.length}</div>
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
export default connect(mapStateToProps, {showSpecimenModal})(ComparePanel);
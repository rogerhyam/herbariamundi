import React, { Component } from "react";
import { connect } from "react-redux";
import Card from "react-bootstrap/Card";


class AccountMyData extends Component {
    constructor(props) {
      super(props);
      this.state = {
        detsCount: 0,
        detsCountDisplay: '0',
        tagsCount: 0,
        tagsCountDisplay: '0'
      };
    }


    updateDetsCount = () =>{

      // this could maybe be refactored to be stored in the model but not worth it now

        fetch('/your_data.php?type=dets&verb=count')
            .then(res => res.json())
            .then(json => {
                // only update it if it has changed or we will loop the 
                // renderer
                if(json.count != this.state.detsCount){
                  this.setState({detsCount: json.count, detsCountDisplay: json.countDisplay});
                }

            })

    }


    updateTagsCount = () =>{

        // this could maybe be refactored to be stored in the model but not worth it now

        fetch('/your_data.php?type=tags&verb=count')
            .then(res => res.json())
            .then(json => {
                // only update it if it has changed or we will loop the 
                // renderer
                if(json.count != this.state.tagsCount){
                  this.setState({tagsCount: json.count, tagsCountDisplay: json.countDisplay});
                }

            })

    }

    render() {

      // render nothing if they aren't logged in
      if(!this.props.user.logged_in){
        return '';
      }

      // update the count of det and tags
      this.updateDetsCount();
      this.updateTagsCount();

      // they are logged in so render
      return (
          <Card style={{ marginTop: "1em" }}>
            <Card.Header>Your Data</Card.Header>
            <Card.Body>
              <Card.Text>
                Here you can download lists of the specimens you contributed to.
                <ul>
                  <li><strong>Determinations:</strong> 
                    
                    
                    {this.state.detsCount > 0 ? "You have determined " + this.state.detsCountDisplay + " specimens. " : "You haven't determined any specimens yet. "}
                    
                    The CSV spreadsheet consists of a row per determination you have made and columns for basic specimen and nomenclatural data as well as links
                    to sources.{' '}<a href={"/your_data.php?type=dets&verb=csv"}>Download CSV file now.</a>
                  </li>

                  <li><strong>Tags:</strong> {this.state.tagsCount > 0 ? "You have placed tags " + this.state.tagsCountDisplay + " times. " : "You haven't tagged any specimens yet. "}


                  The CSV spreadsheet consists of a row per specimen-tag combination and columns for basic specimen data as well as links
                    to sources.{' '}<a href={"/your_data.php?type=tags&verb=csv"}>Download CSV file now.</a>
                    
                    </li>
                </ul>
              </Card.Text>
            </Card.Body>
          </Card>
      );
  }


}
const mapStateToProps = state => {
  return {
    user: state.user
  };
};
export default connect(mapStateToProps, {})(AccountMyData);
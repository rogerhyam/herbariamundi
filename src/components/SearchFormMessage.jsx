import React, { Component } from "react";
import { connect } from "react-redux";

class SearchFormMessage extends Component {

    selectedValue = null;

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidUpdate(prevProps, prevState) {

        let newMessage = "";
        // how many returned?
        if (this.props.search.total > 0) {

            // flag if it is random selection
            if ("lastSearchParams" in this.props.search
                && "sort" in this.props.search.lastSearchParams
                && this.props.search.lastSearchParams.sort
                && this.props.search.lastSearchParams.sort.startsWith("random_")
            ) {
                newMessage = `Showing a random selection of ${this.props.search.pageSize} specimens from a total of ${this.props.search.total.toLocaleString()}`;
            } else {
                let toSize = this.props.search.current.offset + this.props.search.pageSize;
                if (toSize > this.props.search.total) toSize = this.props.search.total;
                newMessage = `Showing ${this.props.search.current.offset + 1} to ${toSize} of ${this.props.search.total.toLocaleString()} specimens`;

            }

        } else {
            newMessage = "No specimens to display";
        }

        if (newMessage != prevState.message) {
            this.setState({ message: newMessage });
        }

    }

    render() {
        if (this.state.message) {
            return (
                <p style={{ marginLeft: "0.4em" }}>{this.state.message}</p>
            )
        } else {
            return "";
        }
    }

}

const mapStateToProps = state => {
    const { search } = state;
    return {
        search: search
    };
};
export default connect(mapStateToProps)(SearchFormMessage);

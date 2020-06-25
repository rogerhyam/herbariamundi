import React, { Component } from "react";
import { connect } from "react-redux";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { searchOffsetChange } from '../redux/actions/searchOffsetChange';

class SearchFormPager extends Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    handleNextButton = e => {
        let newOffset = this.props.search.current.offset + this.props.search.pageSize;
        this.props.searchOffsetChange(newOffset);
    };

    handlePreviousButton = e => {
        let newOffset = this.props.search.current.offset - this.props.search.pageSize;
        if (newOffset < 0) newOffset = 0;
        this.props.searchOffsetChange(newOffset);
    };

    componentDidUpdate(prevProps, prevState) {

    }

    render() {


        // FIXME: disable buttons and ends of run 

        return (
            <Form>
                <Button
                    onClick={this.handlePreviousButton}
                    variant="outline-secondary"
                    disabled={this.props.search.current.offset == 0}
                >Previous</Button>
                {' '}
                <Button
                    onClick={this.handleNextButton}
                    variant="outline-secondary"
                    disabled={this.props.search.current.offset + this.props.search.pageSize > this.props.search.total}>More</Button>
            </Form>
        )
    }

}

const mapStateToProps = state => {
    const { search } = state;
    return {
        search: search
    };
};
export default connect(mapStateToProps, { searchOffsetChange })(SearchFormPager);

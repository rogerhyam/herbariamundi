import React, { Component } from "react";
import { connect } from "react-redux";
import Form from "react-bootstrap/Form";
import { searchFacetChange } from '../redux/actions/searchFacetChange';

class SearchFormFacet extends Component {

    selectedValue = null;

    constructor(props) {
        super(props);
        this.state = {};
    }

    handleChange = e => {
        e.preventDefault();
        this.props.searchFacetChange(this.props.facetName, e.target.options[e.target.selectedIndex].value);
    }

    render() {
        let options = this.getOptions();
        return (
            <Form.Control as="select" value={this.selectedValue} onChange={this.handleChange}>
                {options}
            </Form.Control>
        );
    }

    getOptions() {

        // should we render the defaults or the facet choices?
        let facetValue = this.props.facets[this.props.facetName];
        this.selectedValue = facetValue;

        // build a more complex list
        let out = [];
        let facetValueBeenDisplayed = false;

        // add the default/root choice
        let firstChild = null;
        if (Array.isArray(this.props.children)) {
            firstChild = this.props.children[0];
        } else {
            firstChild = this.props.children;
        }
        out.push(<option value={firstChild.key} >{firstChild.props.display}</option>);

        // If they have selected a letter add that and select it
        if (facetValue && facetValue.length == 1) {
            // add the letter choice and make it selected
            out.push(<option value={facetValue} >{this.props.facetDisplayName} starting '{facetValue}'</option>);
            facetValueBeenDisplayed = true;
        }


        // now add all the terms that they could pick from the facet list.
        // selecting the one they did picked (if any)
        if (this.props.facetName in this.props.facetTerms && this.props.facetTerms[this.props.facetName]) {
            this.props.facetTerms[this.props.facetName].buckets.map(b => {
                if (b.val == facetValue) {
                    facetValueBeenDisplayed = true;
                }
                out.push(<option value={b.val} >{this.getNameForValue(b.val)} ({(b.count).toLocaleString()})</option>);

            });

            // at the bottom we have the missing - those that don't have a facet value
            if (
                "missing" in this.props.facetTerms[this.props.facetName]
                && "count" in this.props.facetTerms[this.props.facetName].missing
                && this.props.facetTerms[this.props.facetName].missing.count > 0) {
                out.push(<option value="_MISSING" >{this.getNameForValue("_MISSING")} ({(this.props.facetTerms[this.props.facetName].missing.count).toLocaleString()})</option>);
            }

            // what if there are only one facet in the list?
            // it would display
            // 0 - the any option
            // 1 - the only facet available because of other query variables.
            // we should select 1. Having 0 selected is odd as it says "any" when there is no choice
            if (this.props.facetTerms[this.props.facetName].buckets.length == 1) {
                this.selectedValue = this.props.facetTerms[this.props.facetName].buckets[0].val;
            }
        }

        // what if the facet value picked is not in the list of facet terms returned because
        // of some other search criteria? We won't have displayed it so must add it in
        // with a count of 0
        if (facetValue && !facetValueBeenDisplayed && facetValue != '_ANY' && facetValue != '_MISSING') {
            out.push(<option value={facetValue} >{this.getNameForValue(facetValue)} (0)</option>);
        }

        // if we get to here and there is only the default option then 
        // we should render the default list rather than the one we tried to build
        if (out.length < 2) {
            return this.getDefaultOptions(facetValue);
        } else {
            return out;
        }

    }

    /**
     * If the facet value is in the default list
     * then we display the name from the default list
     * this handles the issue with country names not being in the
     * index but could be useful for other things.
     * @param {
     * } facetValue 
     */
    getNameForValue(facetValue) {
        let displayName = facetValue;
        if (facetValue == '_MISSING') return "- Not Set -";
        this.props.children.map(op => { if (op.key == facetValue) displayName = op.props.display });
        return displayName;
    }

    getDefaultOptions(facetValue = '_ANY') {
        if (Array.isArray(this.props.children)) {
            return this.props.children.map(op => <option value={op.key} selected={facetValue == op.key} > {op.props.display}</option >);
        } else {
            let op = this.props.children;
            return (<option value={op.key} selected={facetValue == op.key} > {op.props.display}</option >);
        }
    }

}

const mapStateToProps = state => {
    const { search } = state;
    return {
        facets: search.current.facets,
        facetTerms: search.facetTerms
    };
};
export default connect(mapStateToProps, { searchFacetChange })(SearchFormFacet);

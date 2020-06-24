import React, { Component } from "react";
import { connect, shallowEqual } from "react-redux";
import Form from "react-bootstrap/Form";
import SearchFormFacet from "./SearchFormFacet";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import Col from "react-bootstrap/Col";
import { fetchSpecimens } from "../redux/actions/fetchSpecimensActions";
import { searchTextChange } from '../redux/actions/searchTextChange';
import { searchReset } from '../redux/actions/searchReset';

class SearchForm extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleTextChange = e => {
    this.setState({ searchText: e.target.value });
  };

  handleSubmit = e => {
    e.preventDefault();
    this.runSearch();
  };

  handleReset = e => {
    this.setState({ searchText: "" }, e => {
      console.log(this.state);
      this.props.searchReset();
      this.runSearch();
    });
    e.preventDefault();
  }
  handleSave = e => {
    e.preventDefault();
    console.log("SAVE");
    alert('This feature is: Coming Soon!');
  }

  componentDidUpdate(prevProps, prevState) {

    // We need to trigger a search if a facet changes
    // but not if the text changes 
    if (!shallowEqual(this.props.facets, prevProps.facets)) {
      console.log('FACETS CHANGED');
      this.runSearch();
    }

    // if we have just become active then run the search
    if (this.props.active && !prevProps.active) {
      this.runSearch();
    }

  }

  runSearch() {

    // firstly update the store with the current text values
    this.props.searchTextChange(this.state.searchText);

    // let us build the query for Solr
    let query = {};

    // add the text to the query
    query.query = this.state.searchText ? this.state.searchText : '*:*';

    // restrict to 30 rows for now
    query.limit = 30

    // work through the facets we have.
    query.facet = {};
    query.filter = [];

    // we turn facetting on if a value is set
    // for any of the facets
    let facettingOn = false;
    for (const f in this.props.facets) {
      if (this.props.facets[f] && this.props.facets[f] != '_ANY') {
        facettingOn = true;
        break;
      }
    }

    // we turn facetting on if there is a query string
    if (this.state.searchText && this.state.searchText.length > 0) {
      facettingOn = true;
    }

    if (facettingOn) {

      // work through each facet and add it to the query
      for (const f in this.props.facets) {

        query.facet[f] = {
          type: "terms",
          limit: -1,
          mincount: 1,
          missing: true,
          sort: "index",
          field: f
        }

        // if the facet has a value
        if (this.props.facets[f]) {

          if (this.props.facets[f].length == 1) {
            // if we are a single letter then we 
            // restrict to a single letter
            query.facet[f].prefix = this.props.facets[f];

            // also filter by first letter starting
            query.filter.push(f + ":" + this.props.facets[f] + "*");

          } else {

            switch (this.props.facets[f]) {
              case '_ANY':
                // do nothing
                break;
              case '_MISSING':
                // add a negative filter
                query.filter.push("-" + f + ":*");
                break;
              default:
                // by default add it as a filter
                query.filter.push(f + ":" + this.props.facets[f]);
                break;
            }

          }

        }

      }

      this.setState({ messageText: "" });

    } else {

      console.log('RANDOM');
      query.sort = "random_" + Math.random() + " asc";
      this.setState({ messageText: "No search defined so displaying a random sample of specimens" });

    }

    console.log(query);
    this.props.fetchSpecimens(query);

  }

  render() {
    // only display if we are active
    if (!this.props.active) return null;

    return (
      <Form>
        <Form.Row>
          <Col>
            <Form.Group controlId="formSearch.family">
              <SearchFormFacet facetName="family_ss" facetDisplayName="Family" >
                <default key="_ANY" display="Any Family" />
                <default key="A" display="A..." />
                <default key="B" display="B..." />
                <default key="C" display="C..." />
                <default key="D" display="D..." />
                <default key="E" display="E..." />
                <default key="F" display="F..." />
                <default key="G" display="G..." />
                <default key="H" display="H..." />
                <default key="I" display="I..." />
                <default key="J" display="J..." />
                <default key="K" display="K..." />
                <default key="L" display="L..." />
                <default key="M" display="M..." />
                <default key="N" display="N..." />
                <default key="O" display="O..." />
                <default key="P" display="P..." />
                <default key="Q" display="Q..." />
                <default key="R" display="R..." />
                <default key="S" display="S..." />
                <default key="T" display="T..." />
                <default key="U" display="U..." />
                <default key="V" display="V..." />
                <default key="W" display="W..." />
                <default key="X" display="X..." />
                <default key="Y" display="Y..." />
                <default key="Z" display="Z..." />
              </SearchFormFacet>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="formSearch.genus">
              <SearchFormFacet facetName="genus_ss" facetDisplayName="Genus" >
                <default key="_ANY" display="Any Genus" />
                <default key="A" display="A..." />
                <default key="B" display="B..." />
                <default key="C" display="C..." />
                <default key="D" display="D..." />
                <default key="E" display="E..." />
                <default key="F" display="F..." />
                <default key="G" display="G..." />
                <default key="H" display="H..." />
                <default key="I" display="I..." />
                <default key="J" display="J..." />
                <default key="K" display="K..." />
                <default key="L" display="L..." />
                <default key="M" display="M..." />
                <default key="N" display="N..." />
                <default key="O" display="O..." />
                <default key="P" display="P..." />
                <default key="Q" display="Q..." />
                <default key="R" display="R..." />
                <default key="S" display="S..." />
                <default key="T" display="T..." />
                <default key="U" display="U..." />
                <default key="V" display="V..." />
                <default key="W" display="W..." />
                <default key="X" display="X..." />
                <default key="Y" display="Y..." />
                <default key="Z" display="Z..." />
              </SearchFormFacet>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="formSearch.species">
              <SearchFormFacet facetName="specific_epithet_ss" facetDisplayName="species" >
                <default key="_ANY" display="Any species" />
                <default key="a" display="a..." />
                <default key="b" display="b..." />
                <default key="c" display="c..." />
                <default key="d" display="d..." />
                <default key="e" display="e..." />
                <default key="f" display="f..." />
                <default key="g" display="g..." />
                <default key="h" display="h..." />
                <default key="i" display="i..." />
                <default key="j" display="j..." />
                <default key="k" display="k..." />
                <default key="l" display="l..." />
                <default key="m" display="m..." />
                <default key="n" display="n..." />
                <default key="o" display="o..." />
                <default key="p" display="p..." />
                <default key="q" display="q..." />
                <default key="r" display="r..." />
                <default key="s" display="s..." />
                <default key="t" display="t..." />
                <default key="u" display="u..." />
                <default key="v" display="v..." />
                <default key="w" display="w..." />
                <default key="x" display="x..." />
                <default key="y" display="y..." />
                <default key="z" display="z..." />
              </SearchFormFacet>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="formSearch.country">
              <SearchFormFacet facetName="country_code_ss" facetDisplayName="Country" >
                <default key="_ANY" display="Any Country" />
                <default key="AF" display="Afghanistan" />
                <default key="AX" display="Åland Islands" />
                <default key="AL" display="Albania" />
                <default key="DZ" display="Algeria" />
                <default key="AS" display="American Samoa" />
                <default key="AD" display="Andorra" />
                <default key="AO" display="Angola" />
                <default key="AI" display="Anguilla" />
                <default key="AQ" display="Antarctica" />
                <default key="AG" display="Antigua and Barbuda" />
                <default key="AR" display="Argentina" />
                <default key="AM" display="Armenia" />
                <default key="AW" display="Aruba" />
                <default key="AU" display="Australia" />
                <default key="AT" display="Austria" />
                <default key="AZ" display="Azerbaijan" />
                <default key="BS" display="Bahamas" />
                <default key="BH" display="Bahrain" />
                <default key="BD" display="Bangladesh" />
                <default key="BB" display="Barbados" />
                <default key="BY" display="Belarus" />
                <default key="BE" display="Belgium" />
                <default key="BZ" display="Belize" />
                <default key="BJ" display="Benin" />
                <default key="BM" display="Bermuda" />
                <default key="BT" display="Bhutan" />
                <default key="BO" display="Bolivia, Plurinational State of" />
                <default key="BQ" display="Bonaire, Sint Eustatius and Saba" />
                <default key="BA" display="Bosnia and Herzegovina" />
                <default key="BW" display="Botswana" />
                <default key="BV" display="Bouvet Island" />
                <default key="BR" display="Brazil" />
                <default key="IO" display="British Indian Ocean Territory" />
                <default key="BN" display="Brunei Darussalam" />
                <default key="BG" display="Bulgaria" />
                <default key="BF" display="Burkina Faso" />
                <default key="BI" display="Burundi" />
                <default key="KH" display="Cambodia" />
                <default key="CM" display="Cameroon" />
                <default key="CA" display="Canada" />
                <default key="CV" display="Cape Verde" />
                <default key="KY" display="Cayman Islands" />
                <default key="CF" display="Central African Republic" />
                <default key="TD" display="Chad" />
                <default key="CL" display="Chile" />
                <default key="CN" display="China" />
                <default key="CX" display="Christmas Island" />
                <default key="CC" display="Cocos (Keeling) Islands" />
                <default key="CO" display="Colombia" />
                <default key="KM" display="Comoros" />
                <default key="CG" display="Congo" />
                <default key="CD" display="Congo, the Democratic Republic of the" />
                <default key="CK" display="Cook Islands" />
                <default key="CR" display="Costa Rica" />
                <default key="CI" display="Côte d'Ivoire" />
                <default key="HR" display="Croatia" />
                <default key="CU" display="Cuba" />
                <default key="CW" display="Curaçao" />
                <default key="CY" display="Cyprus" />
                <default key="CZ" display="Czech Republic" />
                <default key="DK" display="Denmark" />
                <default key="DJ" display="Djibouti" />
                <default key="DM" display="Dominica" />
                <default key="DO" display="Dominican Republic" />
                <default key="EC" display="Ecuador" />
                <default key="EG" display="Egypt" />
                <default key="SV" display="El Salvador" />
                <default key="GQ" display="Equatorial Guinea" />
                <default key="ER" display="Eritrea" />
                <default key="EE" display="Estonia" />
                <default key="ET" display="Ethiopia" />
                <default key="FK" display="Falkland Islands (Malvinas)" />
                <default key="FO" display="Faroe Islands" />
                <default key="FJ" display="Fiji" />
                <default key="FI" display="Finland" />
                <default key="FR" display="France" />
                <default key="GF" display="French Guiana" />
                <default key="PF" display="French Polynesia" />
                <default key="TF" display="French Southern Territories" />
                <default key="GA" display="Gabon" />
                <default key="GM" display="Gambia" />
                <default key="GE" display="Georgia" />
                <default key="DE" display="Germany" />
                <default key="GH" display="Ghana" />
                <default key="GI" display="Gibraltar" />
                <default key="GR" display="Greece" />
                <default key="GL" display="Greenland" />
                <default key="GD" display="Grenada" />
                <default key="GP" display="Guadeloupe" />
                <default key="GU" display="Guam" />
                <default key="GT" display="Guatemala" />
                <default key="GG" display="Guernsey" />
                <default key="GN" display="Guinea" />
                <default key="GW" display="Guinea-Bissau" />
                <default key="GY" display="Guyana" />
                <default key="HT" display="Haiti" />
                <default key="HM" display="Heard Island and McDonald Islands" />
                <default key="VA" display="Holy See (Vatican City State)" />
                <default key="HN" display="Honduras" />
                <default key="HK" display="Hong Kong" />
                <default key="HU" display="Hungary" />
                <default key="IS" display="Iceland" />
                <default key="IN" display="India" />
                <default key="ID" display="Indonesia" />
                <default key="IR" display="Iran, Islamic Republic of" />
                <default key="IQ" display="Iraq" />
                <default key="IE" display="Ireland" />
                <default key="IM" display="Isle of Man" />
                <default key="IL" display="Israel" />
                <default key="IT" display="Italy" />
                <default key="JM" display="Jamaica" />
                <default key="JP" display="Japan" />
                <default key="JE" display="Jersey" />
                <default key="JO" display="Jordan" />
                <default key="KZ" display="Kazakhstan" />
                <default key="KE" display="Kenya" />
                <default key="KI" display="Kiribati" />
                <default key="KP" display="Korea, Democratic People's Republic of" />
                <default key="KR" display="Korea, Republic of" />
                <default key="KW" display="Kuwait" />
                <default key="KG" display="Kyrgyzstan" />
                <default key="LA" display="Lao People's Democratic Republic" />
                <default key="LV" display="Latvia" />
                <default key="LB" display="Lebanon" />
                <default key="LS" display="Lesotho" />
                <default key="LR" display="Liberia" />
                <default key="LY" display="Libya" />
                <default key="LI" display="Liechtenstein" />
                <default key="LT" display="Lithuania" />
                <default key="LU" display="Luxembourg" />
                <default key="MO" display="Macao" />
                <default key="MK" display="Macedonia, the former Yugoslav Republic of" />
                <default key="MG" display="Madagascar" />
                <default key="MW" display="Malawi" />
                <default key="MY" display="Malaysia" />
                <default key="MV" display="Maldives" />
                <default key="ML" display="Mali" />
                <default key="MT" display="Malta" />
                <default key="MH" display="Marshall Islands" />
                <default key="MQ" display="Martinique" />
                <default key="MR" display="Mauritania" />
                <default key="MU" display="Mauritius" />
                <default key="YT" display="Mayotte" />
                <default key="MX" display="Mexico" />
                <default key="FM" display="Micronesia, Federated States of" />
                <default key="MD" display="Moldova, Republic of" />
                <default key="MC" display="Monaco" />
                <default key="MN" display="Mongolia" />
                <default key="ME" display="Montenegro" />
                <default key="MS" display="Montserrat" />
                <default key="MA" display="Morocco" />
                <default key="MZ" display="Mozambique" />
                <default key="MM" display="Myanmar" />
                <default key="NA" display="Namibia" />
                <default key="NR" display="Nauru" />
                <default key="NP" display="Nepal" />
                <default key="NL" display="Netherlands" />
                <default key="NC" display="New Caledonia" />
                <default key="NZ" display="New Zealand" />
                <default key="NI" display="Nicaragua" />
                <default key="NE" display="Niger" />
                <default key="NG" display="Nigeria" />
                <default key="NU" display="Niue" />
                <default key="NF" display="Norfolk Island" />
                <default key="MP" display="Northern Mariana Islands" />
                <default key="NO" display="Norway" />
                <default key="OM" display="Oman" />
                <default key="PK" display="Pakistan" />
                <default key="PW" display="Palau" />
                <default key="PS" display="Palestinian Territory, Occupied" />
                <default key="PA" display="Panama" />
                <default key="PG" display="Papua New Guinea" />
                <default key="PY" display="Paraguay" />
                <default key="PE" display="Peru" />
                <default key="PH" display="Philippines" />
                <default key="PN" display="Pitcairn" />
                <default key="PL" display="Poland" />
                <default key="PT" display="Portugal" />
                <default key="PR" display="Puerto Rico" />
                <default key="QA" display="Qatar" />
                <default key="RE" display="Réunion" />
                <default key="RO" display="Romania" />
                <default key="RU" display="Russian Federation" />
                <default key="RW" display="Rwanda" />
                <default key="BL" display="Saint Barthélemy" />
                <default key="SH" display="Saint Helena, Ascension and Tristan da Cunha" />
                <default key="KN" display="Saint Kitts and Nevis" />
                <default key="LC" display="Saint Lucia" />
                <default key="MF" display="Saint Martin (French part)" />
                <default key="PM" display="Saint Pierre and Miquelon" />
                <default key="VC" display="Saint Vincent and the Grenadines" />
                <default key="WS" display="Samoa" />
                <default key="SM" display="San Marino" />
                <default key="ST" display="Sao Tome and Principe" />
                <default key="SA" display="Saudi Arabia" />
                <default key="SN" display="Senegal" />
                <default key="RS" display="Serbia" />
                <default key="SC" display="Seychelles" />
                <default key="SL" display="Sierra Leone" />
                <default key="SG" display="Singapore" />
                <default key="SX" display="Sint Maarten (Dutch part)" />
                <default key="SK" display="Slovakia" />
                <default key="SI" display="Slovenia" />
                <default key="SB" display="Solomon Islands" />
                <default key="SO" display="Somalia" />
                <default key="ZA" display="South Africa" />
                <default key="GS" display="South Georgia and the South Sandwich Islands" />
                <default key="SS" display="South Sudan" />
                <default key="ES" display="Spain" />
                <default key="LK" display="Sri Lanka" />
                <default key="SD" display="Sudan" />
                <default key="SR" display="Suriname" />
                <default key="SJ" display="Svalbard and Jan Mayen" />
                <default key="SZ" display="Swaziland" />
                <default key="SE" display="Sweden" />
                <default key="CH" display="Switzerland" />
                <default key="SY" display="Syrian Arab Republic" />
                <default key="TW" display="Taiwan, Province of China" />
                <default key="TJ" display="Tajikistan" />
                <default key="TZ" display="Tanzania, United Republic of" />
                <default key="TH" display="Thailand" />
                <default key="TL" display="Timor-Leste" />
                <default key="TG" display="Togo" />
                <default key="TK" display="Tokelau" />
                <default key="TO" display="Tonga" />
                <default key="TT" display="Trinidad and Tobago" />
                <default key="TN" display="Tunisia" />
                <default key="TR" display="Turkey" />
                <default key="TM" display="Turkmenistan" />
                <default key="TC" display="Turks and Caicos Islands" />
                <default key="TV" display="Tuvalu" />
                <default key="UG" display="Uganda" />
                <default key="UA" display="Ukraine" />
                <default key="AE" display="United Arab Emirates" />
                <default key="GB" display="United Kingdom" />
                <default key="US" display="United States" />
                <default key="UM" display="United States Minor Outlying Islands" />
                <default key="UY" display="Uruguay" />
                <default key="UZ" display="Uzbekistan" />
                <default key="VU" display="Vanuatu" />
                <default key="VE" display="Venezuela, Bolivarian Republic of" />
                <default key="VN" display="Viet Nam" />
                <default key="VG" display="Virgin Islands, British" />
                <default key="VI" display="Virgin Islands, U.S." />
                <default key="WF" display="Wallis and Futuna" />
                <default key="EH" display="Western Sahara" />
                <default key="YE" display="Yemen" />
                <default key="ZM" display="Zambia" />
                <default key="ZW" display="Zimbabwe" />

              </SearchFormFacet>
            </Form.Group>
          </Col>
        </Form.Row>
        <Form.Row>
          <Col sm={9}>
            <Form.Group controlId="formSearch">
              <Form.Control
                type="text"
                placeholder="Free text"
                onChange={this.handleTextChange}
                value={this.state.searchText}
              />
              <Form.Text className="text-muted">
                {this.state.messageText}
              </Form.Text>
            </Form.Group>
          </Col>
          <Col>
            <ButtonToolbar>
              <ButtonGroup className="mr-2" >
                <Button variant="primary" type="submit" onClick={this.handleSubmit}>
                  Search
               </Button>
              </ButtonGroup>
              <ButtonGroup className="mr-2" >
                <Button variant="secondary" onClick={this.handleReset}>
                  Reset
              </Button>
                <Button variant="secondary" onClick={this.handleSave}>
                  Save
            </Button>
              </ButtonGroup>
            </ButtonToolbar>
          </Col>
        </Form.Row>
      </Form >
    );
  }
}

const mapStateToProps = state => {
  const { search } = state;
  return {
    active: search.active,
    facets: search.current.facets
  };
};
export default connect(mapStateToProps, { fetchSpecimens, searchTextChange, searchReset })(SearchForm);

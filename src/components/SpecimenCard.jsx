import React, { Component } from "react";
import { connect } from "react-redux";
import Popover from "react-bootstrap/Popover";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import DraggableTypes from "./DraggableTypes";
import { showSpecimenModal } from "../redux/actions/showSpecimenModal"

class SpecimenCard extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleDragStart = (e, specimenDbId, specimenCetafId, associtedFolderId) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("specimenDbId", specimenDbId);
    e.dataTransfer.setData("specimenCetafId", specimenCetafId);
    e.dataTransfer.setData("associtedFolderId", associtedFolderId);
    e.dataTransfer.setData("type", DraggableTypes.SPECIMEN);
    e.dataTransfer.setDragImage(e.target, 10, 10);
  };

  handleShowModalDialogue = (e) => {
    let x = e.nativeEvent.offsetX;
    let y = e.nativeEvent.offsetY;
    let h = e.nativeEvent.target.height;
    let w = e.nativeEvent.target.width;
    let aspect = h / w;

    // openseadragon the coordinate system is 
    // x goes 0 to 1
    // y goes 0 to aspect ratio

    let osdX = x / w;
    let osdY = (y / h) * aspect;

    console.log(`osd_x: ${osdX} osd_y: ${osdY}`);
    this.props.showSpecimenModal(
      {
        id: this.props.specimen.id,
        x: osdX,
        y: osdY
      }
    );
  }

  getSpecimenPopover() {
    const { specimen, associatedFolderId } = this.props;

    const title = specimen.hasOwnProperty("scientific_name_ss")
      ? specimen.scientific_name_ss
      : "Specimen";

    const fields = [
      {
        name: "collector_ss",
        label: "Collector"
      },
      {
        name: "collector_number_ss",
        label: "Number"
      },
      {
        name: "scientific_name_ss",
        label: "Name"
      },
      {
        name: "family_ss",
        label: "Family"
      },
      {
        name: "genus_ss",
        label: "Genus"
      },
      {
        name: "specific_epithet_ss",
        label: "epithet"
      },
      {
        name: "country_code_ss",
        label: "Country"
      }
    ];

    return (
      <Popover id="popover-basic">
        <Popover.Title as="h3">{title}</Popover.Title>
        <Popover.Content>
          <table>
            <tbody>
              {fields.map(f => {
                // do nothing if we lac that property
                if (!specimen.hasOwnProperty(f.name)) return "";
                // otherwise write it as a label
                return (
                  <tr key={f.name}>
                    <th style={{ textAlign: "right", verticalAlign: "top" }}>
                      {f.label}:
                    </th>
                    <td style={{ textAlign: "left", verticalAlign: "top" }}>
                      {this.getSpecimenPopoverTableValue(specimen, f)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Popover.Content>
      </Popover>
    );
  }

  getSpecimenPopoverTableValue(specimen, field) {
    if (Array.isArray(specimen[field.name])) {
      return specimen[field.name].join("; ");
    } else {
      return specimen[field.name];
    }
  }

  getCetafIdPopover(cetafId) {
    return (
      <Popover id={cetafId}>
        <Popover.Content style={{ fontSize: "60%" }}>{cetafId}</Popover.Content>
      </Popover>
    );
  }

  getLogoPopover(name) {
    return (
      <Popover>
        <Popover.Content style={{ fontSize: "80%" }}>{name}</Popover.Content>
      </Popover>
    );
  }

  render() {
    const { specimen, associatedFolderId } = this.props;

    let thumbnailUri = "/data/thumbnail_cache/" + specimen.thumbnail_path_s;
    if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
      thumbnailUri =
        "http://127.0.0.1:3100/data/thumbnail_cache/" +
        specimen.thumbnail_path_s;
    }

    return (
      <div
        key={specimen.id}
        draggable={true}
        onDragStart={e =>
          this.handleDragStart(
            e,
            specimen.db_id_i,
            specimen.id,
            associatedFolderId
          )
        }
        style={{
          width: "200px", // fixed pixel width matched to the size the thumbnails are
          height: "365px", // fixed height or the float left won't work
          float: "left",
          margin: "0.2rem"
        }}
      >
        <OverlayTrigger
          trigger={["hover", "focus"]}
          placement="auto"
          overlay={this.getSpecimenPopover()}
        >
          <img
            style={{ width: "200px" }}
            src={thumbnailUri}
            draggable={false}
            onClick={this.handleShowModalDialogue}
          />
        </OverlayTrigger>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: "5px"
          }}
        >
          <div>
            <OverlayTrigger
              trigger={["hover", "click"]}
              placement="auto"
              overlay={this.getLogoPopover(specimen.provider_name_s)}
            >
              <a href={specimen.provider_homepage_uri_s} target="_new">
                <img
                  src={specimen.provider_logo_path_s}
                  style={{ maxHeight: "25px" }}
                />
              </a>
            </OverlayTrigger>
          </div>
          <div style={{ textAlign: "right" }}>
            <OverlayTrigger
              trigger={["hover", "click"]}
              placement="auto"
              overlay={this.getCetafIdPopover(specimen.cetaf_id_preferred_s)}
            >
              <a
                style={{ fontSize: "60%" }}
                href={specimen.cetaf_id_preferred_s}
                target="_new"
              >
                CETAF ID 🔗
              </a>
            </OverlayTrigger>
          </div>
        </div>
      </div >
    );
  }
}

const mapStateToProps = state => {
  return {};
};
export default connect(mapStateToProps, { showSpecimenModal })(SpecimenCard);

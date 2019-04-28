import React from "react"
import { compose, withProps, lifecycle } from "recompose"
import { withScriptjs, withGoogleMap, GoogleMap, InfoWindow, Polygon, Marker } from "react-google-maps"
import geoData from '../../public/vicGeo.json'


// const paths = [{ lng: 145.001292608, lat: -37.795597669 }, { lng: 145.001945248, lat: -37.79665894 }, { lng: 145.001527872, lat: -37.797168023 }, { lng: 144.999500896, lat: -37.797004021 }, { lng: 144.999388896, lat: -37.79765905 }, { lng: 145.007269856, lat: -37.80297806 }, { lng: 145.007666848, lat: -37.803904059 }, { lng: 145.004588864, lat: -37.805342101 }, { lng: 145.001617952, lat: -37.804250101 }, { lng: 145.000149952, lat: -37.804289118 }, { lng: 144.999283968, lat: -37.805218114 }, { lng: 144.999963968, lat: -37.806600138 }, { lng: 145.000790944, lat: -37.807219129 }, { lng: 145.008068832, lat: -37.807408107 }, { lng: 145.00896384, lat: -37.807996092 }, { lng: 145.009381856, lat: -37.810401129 }, { lng: 145.015504736, lat: -37.810504081 }, { lng: 145.015406816, lat: -37.812144865 }, { lng: 144.991351072, lat: -37.809731244 }, { lng: 144.9936, lat: -37.796054397 }, { lng: 144.997628768, lat: -37.796422048 }, { lng: 145.001292608, lat: -37.795597669 }]

const MyMapComponent = compose(
    withProps({
        googleMapURL: "https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places",
        loadingElement: <div style={{ height: `100%` }} />,
        containerElement: <div style={{ height: `800px` }} />,
        mapElement: <div style={{ height: `100%` }} />,
    }),
    withScriptjs,
    withGoogleMap
)(
    (props) =>
        <GoogleMap
            defaultZoom={12}
            defaultCenter={{ lat: -37.8181334, lng: 144.9466019 }}
        >
            {
                props.pathsArray.map(function (value, index) {
                    return (
                        <div>
                            <Polygon
                                paths={value}
                                onClick={props.polygonClick.bind(this, index)}
                                options={{
                                    strokeColor: "#d34052",
                                    fillColor: "#d34052",
                                    strokeOpacity: "0.5",
                                    strokeWeight: '2'
                                }}
                            >
                            </Polygon>
                        </div>
                    )
                })
            }
            {props.show &&
                <InfoWindow
                    options={{
                        position: props.position
                    }}
                    onCloseClick={props.closeWindow}
                >
                    <div>
                        {props.showInfo}
                    </div>
                </InfoWindow>
            }
        </GoogleMap>
)


class Map extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isMarkerShown: true,
            show: false,
            showInfo: "aaa",
            position: { lng: 145.001292608, lat: -37.795597669 }
        };
    }

    componentDidMount() {
        let pathsArray = [];
        let geoName = [];
        geoData.map(function (value, index) {
            let paths = [];
            if (value.geometry.type == "Polygon") {
                value.geometry.coordinates[0].map(function (valueC, indexC) {
                    let geo = { lng: valueC[0], lat: valueC[1] };
                    paths.push(geo);
                })
                geoName.push(value.properties.SSC_NAME);
                pathsArray.push(paths);
            } else if (value.geometry.type == "MultiPolygon") {
                value.geometry.coordinates[0].map(function (valueC, indexC) {
                    valueC.map(function (valueMC, indexMC) {
                        let geo = { lng: valueMC[0], lat: valueMC[1] };
                        paths.push(geo);
                    })
                    geoName.push(value.properties.SSC_NAME);
                    pathsArray.push(paths);
                })
            }
        })
        console.log(pathsArray);
        this.setState({
            pathsArray: pathsArray,
            geoName: geoName
        })
    }

    polygonClick = (index, e) => {
        console.log(index);
        let ilat = e.latLng.lat();
        let ilng = e.latLng.lng();
        this.setState({
            show: true,
            showInfo: this.state.geoName[index],
            position: { lng: ilng, lat: ilat }
        })
    }

    closeWindow = () => {
        this.setState({
            show: false
        })
    }

    render() {
        let { pathsArray, show, showInfo, position } = this.state;

        return (
            <div>
                <MyMapComponent
                    show={show}
                    pathsArray={pathsArray}
                    polygonClick={this.polygonClick}
                    showInfo={showInfo}
                    position={position}
                    closeWindow={this.closeWindow}
                />
            </div>
        )
    }
}

export default Map;
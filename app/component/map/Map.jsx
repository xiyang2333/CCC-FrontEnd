import React from "react"
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { compose, withProps, lifecycle } from "recompose";
import { withScriptjs, withGoogleMap, GoogleMap, InfoWindow, Polygon, Marker } from "react-google-maps";
import geoData from '../../public/SA4_2016_AUST.json';
import incomeData from '../../public/Correct_income.json';
import { relative } from "path";
import Labelline from "../chart/Pie"


// const paths = [{ lng: 145.001292608, lat: -37.795597669 }, { lng: 145.001945248, lat: -37.79665894 }, { lng: 145.001527872, lat: -37.797168023 }, { lng: 144.999500896, lat: -37.797004021 }, { lng: 144.999388896, lat: -37.79765905 }, { lng: 145.007269856, lat: -37.80297806 }, { lng: 145.007666848, lat: -37.803904059 }, { lng: 145.004588864, lat: -37.805342101 }, { lng: 145.001617952, lat: -37.804250101 }, { lng: 145.000149952, lat: -37.804289118 }, { lng: 144.999283968, lat: -37.805218114 }, { lng: 144.999963968, lat: -37.806600138 }, { lng: 145.000790944, lat: -37.807219129 }, { lng: 145.008068832, lat: -37.807408107 }, { lng: 145.00896384, lat: -37.807996092 }, { lng: 145.009381856, lat: -37.810401129 }, { lng: 145.015504736, lat: -37.810504081 }, { lng: 145.015406816, lat: -37.812144865 }, { lng: 144.991351072, lat: -37.809731244 }, { lng: 144.9936, lat: -37.796054397 }, { lng: 144.997628768, lat: -37.796422048 }, { lng: 145.001292608, lat: -37.795597669 }]

const styles = {
    card: {
        minWidth: 275,
    },
    bullet: {
        display: 'inline-block',
        margin: '0 2px',
        transform: 'scale(0.8)',
    },
    title: {
        fontSize: 14,
    },
    pos: {
        marginBottom: 12,
    },
    gradient: {
        marginLeft: '50px',
        marginRight: '20px',
        height: '200px',
        width: '10px',
        background: 'linear-gradient(#fff, #f00)',
        display:'inline-block'
    }
};

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
            defaultZoom={5}
            defaultCenter={{ lat: -26.08525376372465, lng: 133.7342084883146 }}
        >
            {
                props.pathsArray.map(function (value, index) {
                    return (
                        <div>
                            <Polygon
                                paths={value.paths}
                                onClick={props.polygonClick.bind(this, value.code, value.name)}
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
            position: { lng: 145.001292608, lat: -37.795597669 }
        };
    }

    polygonDraw = () => {
        let pathsArray = [];

        geoData.features.map(function (value, index) {
            if (value.geometry) {
                if (value.geometry.type == "Polygon") {
                    let geoPath = [];
                    value.geometry.coordinates[0].map(function (valueC, indexC) {
                        let geo = { lng: valueC[0], lat: valueC[1] };
                        geoPath.push(geo);
                    })
                    let code = value.properties.SA4_CODE16;
                    let name = value.properties.SA4_NAME;
                    pathsArray.push({code : code, paths: geoPath, name : name});
                } else if (value.geometry.type == "MultiPolygon") {
                    let code = value.properties.SA4_CODE16;
                    let name = value.properties.SA4_NAME;
                    value.geometry.coordinates.map(function (valueC, indexC) {
                        let geoPath = [];
                        valueC[0].map(function (valueMC, indexMC) {
                            let geo = { lng: valueMC[0], lat: valueMC[1] };
                            geoPath.push(geo);
                        })
                        pathsArray.push({code : code, paths: geoPath, name : name});
                    })
                }
            }
        })
        console.log(pathsArray);
        this.setState({
            pathsArray: pathsArray
        })
    }

    componentDidMount() {
        this.polygonDraw();
    }

    polygonClick = (code, name, e) => {
        console.log(code);

        let value = [];
        for(var a in incomeData){
            if(a == code){
                value = incomeData[a];
            }
        }
        let sum = value[0] + value[1] + value[2] +value[3] +value[4] +value[5];
        const data = {data: [
            {
                item: "Lower than 500 (0 - 499)",
                count: value[0]
            }, 
            {
                item: "Lower than 1000 (500 - 999)",
                count: value[1]
            }, 
            {
                item: "Lower than 1500 (1000 - 1499)",
                count: value[2]
            }, 
            {
                item: "Lower than 2000 (1499 - 1999)",
                count: value[3]
            }, 
            {
                item: "Lower than 3000 (2000 - 2999)",
                count: value[4]
            }, 
            {
                item: "Higher than 3000 (3000 - )",
                count: value[5]
            }, 
        ], sum : sum};
        
        let ilat = e.latLng.lat();
        let ilng = e.latLng.lng();
        let info = (
        <div>
            SA4 Code: {code}<br/>
            SA4 Name: {name}<br/>
            Total Twitter Post: (TODO)<br />
            Total Income: {sum} <br />
            Weekly Income Information: <br/>
            <Labelline 
                data = {data}
            />
        </div>);
        this.setState({
            show: true,
            code : code,
            showInfo : info,
            position: { lng: ilng, lat: ilat }
        })
    }

    closeWindow = () => {
        this.setState({
            show: false
        })
    }

    render() {
        let { pathsArray, show, position,showInfo } = this.state;
        const { classes } = this.props;

        return (
            <div stle={{ positon: 'relative' }}>
                <MyMapComponent
                    show={show}
                    pathsArray={pathsArray}
                    polygonClick={this.polygonClick}
                    showInfo={showInfo}
                    position={position}
                    closeWindow={this.closeWindow}
                />
                <div style={{ position: 'absolute', top: '50px', right: '300px', width: '50px', height: '50px' }}>
                    <Card className={classes.card}>
                        <CardContent>
                            <div>
                                <table>
                                    <tr>
                                        <td rowSpan="4">
                                        <div className={classes.gradient}>
                                        </div>
                                        </td>
                                        <td valign="top">min</td>
                                    </tr>
                                    <tr><td></td></tr>
                                    <tr><td></td></tr>
                                    <tr>
                                        <td valign="bottom">max</td>
                                    </tr>
                                </table>
                            </div>
                        </CardContent>
                        <CardActions>
                        </CardActions>
                    </Card>
                </div>
            </div>
        )
    }
}

Map.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Map);
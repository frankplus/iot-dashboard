import React, { useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import { useState } from 'react';
import { latLngBounds } from 'leaflet';
import { Card, CssBaseline, FormControl, InputLabel, MenuItem, Select, Typography } from '@material-ui/core';
import PowerIcon from '@material-ui/icons/Power';
import PowerOffIcon from '@material-ui/icons/PowerOff';
import { green, red } from '@material-ui/core/colors';
import CustomerContext from "../CustomerContext";
import { capitalized, dataLabelsSpace } from '../hook/util';

const axios = require('axios').default

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
    margin: 0,
    padding: 0,
    outline: 0,
  },
  mapContainer: {
    height: '90%',
    width: '100%',
  },
  header: {
    height: '10%',
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  productName: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: '1rem',
    fontWeight: 'bold'
  },
  powerOffIcon: {
    color: red[500] 
  },
  powerOnIcon: {
    color: green[500] 
  }

}));

function timestampFormat(timestamp) {
  return new Date(Date.parse(timestamp)).toLocaleString();
}

function ChangeMapBounds({ bounds }) {
  const map = useMap();
  //bounds.push([34.024212, -118.496475]); // Mockup bound just to avoid a crash

  var uniqueBounds = []; // Stores the unique coordinates for bounds. Multiple items with same coordinates will cause the map crash

  // Needs a much more optimized way to achieve that
  bounds.forEach((elem1) => {
    var unique = true;
    uniqueBounds.forEach((elem2) => {
      if (elem1[0] === elem2[0] && elem1[1] === elem2[1]) {
        unique = false;
        //Break statement in JS???
      }
    });
    if (unique) {
      uniqueBounds.push(elem1);
    }
  });


  if (uniqueBounds.length === 0) {
    return null;
  }


  var newBounds = latLngBounds(uniqueBounds);
  map.fitBounds(newBounds);
  return null;
}

function formattedData(data, unit) {
  var value = data[unit];
  switch (unit) {
    case 'windBearing':
      value = value + ' Degrees';
      break;
    case 'windSpeed':
      value = value + ' Km/h';
      break;
    case 'temperature':
      value = value + ' °C';
      break;
    case 'humidity':
      value = value + ' %';
      break;
    case 'pressure':
      value = value + ' kPa';
      break;
    default:
      break;

  }
  return value;
}


export default function MapPage(props) {
  const classes = useStyles();
  const [state, setState] = useState({ devices: [], bounds: [] });
  const [groups, setGroups] = useState([]);
  const [group, setGroup] = useState("");
  const [product, setProduct] = useState([]);
  const [products, setProducts] = useState([]);
  const center = [45.416667, 11.883333] // Padova default coordinates

  const customerContext = useContext(CustomerContext);

  if (customerContext.isLoggedIn === undefined) {
    // Waiting to know if customer is logged in
  } else if (!customerContext.isLoggedIn) {
    props.history.push('/signin');
  }

  useEffect(() => {
    const params = {
      includeLastData: true,
    }
    if (group) {
      params["groupId"] = group;
    }
    if (product) {
      params["productId"] = product;
    }
    axios.get("/devices", { params })
      .then((res) => {
        console.log(res);
        var mbounds = [];
        res.data.forEach(device => {
          mbounds.push([device.device.config.latitude, device.device.config.longitude]);
        });

        setState({ devices: res.data, bounds: mbounds });

      })
      .catch((err) => {
        console.log(err);
      });
  }, [group, product]);

  useEffect(() => {
    // get user's groups
    axios.get("/groups")
      .then(res => {
        setGroups(res.data)
      })
  }, []);

  useEffect(() => {
    // get user's products
    axios.get("/products")
      .then(res => {
        setProducts(res.data)
      })
  }, []);

  return (
    <div className={classes.root}>
      <Card className={classes.header}>
        <FormControl className={classes.formControl}>
          <InputLabel id="group-select-label">Group</InputLabel>
          <Select
            labelId="group-select-label"
            id="group-select"
            value={group}
            onChange={(event) =>
              setGroup(event.target.value)
            }
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {
              groups.map(group =>
                <MenuItem key={group["id"]} value={group["id"]}>{group["name"]}</MenuItem>
              )
            }
          </Select>
        </FormControl>
        <FormControl className={classes.formControl}>
          <InputLabel id="product-select-label">Product</InputLabel>
          <Select
            labelId="product-select-label"
            id="product-select"
            value={product}
            onChange={(event) =>
              setProduct(event.target.value)
            }
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {
              products.map(prod =>
                <MenuItem key={prod["id"]} value={prod["id"]}>{prod["name"]}</MenuItem>
              )
            }
          </Select>
        </FormControl>
      </Card>
      <CssBaseline />
      <MapContainer center={center} minZoom={0} maxZoom={18} zoom={6} scrollWheelZoom={false} markerZoomAnimation={true} className={classes.mapContainer}>
        <ChangeMapBounds bounds={state.bounds} />
        <TileLayer
          attribution=''
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {

          state.devices.map((item) => (


            <Marker key={item.device.id} position={[item.device.config.latitude, item.device.config.longitude]}>
              <Popup>
                {item.device.config.enabled ? <PowerIcon className={classes.powerOnIcon} /> : <PowerOffIcon className={classes.powerOffIcon} />}
                <Typography className={classes.productName}>{capitalized(item.product_name)}</Typography>
                <Typography className={classes.subtitle}>Device info:</Typography>
                <ul>
                  <li>Lat: {item.device.config.latitude}</li>
                  <li>Lon: {item.device.config.longitude}</li>
                  <li>Freq: {item.device.config.update_frequency}</li>
                  <li>Battery: {item.device.deviceStatus.battery}%</li>
                  <li>Last Update: {timestampFormat(item.device.deviceStatus.last_update)}</li>
                </ul>

                <Typography className={classes.subtitle}> Groups:</Typography>
                {
                  <ul>
                    {
                      item.groups.map((group) => (
                        <li key={group.id}>{group.name}</li>
                      ))
                    }
                  </ul>

                }

                <Typography className={classes.subtitle}>Latest Data:</Typography>
                {
                  <ul>
                    {
                      Object.keys(item.data).map((key) => (
                        <li key={key}>{capitalized(dataLabelsSpace(key))}: {formattedData(item.data, key)}</li>
                      ))
                    }
                  </ul>

                }

              </Popup>
            </Marker>
          ))

        }

      </MapContainer>
    </div>



  );
}

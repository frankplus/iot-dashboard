import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Card, CardContent, CardMedia, Grow, Typography } from '@material-ui/core';
import axios from 'axios';
import { Link as RouterLink } from "react-router-dom";
import { capitalized } from '../hook/util'
import SnackbarAlert from "../components/SnackbarAlert";


const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
    width: `calc(max(85%, 400px))`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

  },
  cardContent1: {

    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  card1: {
    //minHeight: '60vh',
    //width: '70%', `calc(max(240px, min(50%, 380px)))`
    height: '100%',
    width: `calc(max(85%, 600px))`,
    display: 'flex',
    justifyContent: 'flex-top',
    alignItems: 'flext-end',
    flexDirection: 'column',
    borderRadius: 15,
  },

  topContent: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width:  '100%',
  },
  productImage: {
    height: undefined,
    width:  `calc(min(50%, 340px))`,
    aspectRatio: 1,
    //display: 'flex',
  },

  description: {
    //margin: '20px',
    fontSize: '1.0em',
    color: '#757575',
    margin: 50,
    whiteSpace: "pre-wrap"
  },
  productName: {
    marginTop: 20,
    marginBottom: 0,
    fontFamily: 'Roboto',
    fontSize: '2em',
    fontWeight: 'bold',
  },
  freeShippingDeliveryText: {
    color: 'black',
    fontSize: '1.1em',

  },

  productPrice: {
    marginBottom: 0,
    fontSize: '1.5em',
    color: '#ef5350',
    
  },

  taxes: {
    fontSize: '1.1em',
    marginBottom: 0,
  },
  availableText: {
    marginBottom: 5,
    fontSize: '1.1em',
    color: '#43A047',
    fontFamily: 'Roboto',
    fontWeight: 500,
  },
  shippingTime: {
    //marginBottom: 10,
    fontSize: '1.1em',
    fontFamily: 'Roboto',
    fontWeight: 500,
  },
  secureTransactions: {
    marginRight: 10,
    fontSize: '0.9em',
    color: '#9E9E9E'
  },
  shippedby: {
    marginBottom: 20,
    fontSize: '0.8em',
  },
  addToCartButton: {
    //marginTop: '50%',
    //fontSize: '1vw',
    marginRight: 5,
    borderRadius: 50,
  },
  buyNowButton: {
    //fontSize: '1vw',
    marginLeft: 5,
    borderRadius: 50,
  },
  buttonsContent: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center'
  }

}));

function onAddToCart(id) {
  const params = new URLSearchParams();
  params.append('productId', id);
  axios.post("/order/addProductToCart", params)
    .then((res) => {
      console.log(res)
    });
}

function Product(props) {
  const classes = useStyles();
  const [state, setState] = useState({ loading: true, product: null, imageUrl: "" });
  const [checked, setChecked] = useState(false);
  const [snackMessage, setSnackMessage]=useState("");
  const [snackSeverity,setSnackSeverity]=useState("success");
  const productId = props.match.params.id;
  useEffect(() => {
    axios.get("/products/" + productId)
      .then((res) => {
        console.log(res);

        var imageUrl = res.data.image;
        setState({ loading: false, product: res.data, imageUrl: imageUrl });
        setChecked(true);
      }).catch((err) => {
        console.log(err);
      })
  }, [productId]);

  const [numProdInCart, setNumProdInCart] = useState(0);
  useEffect(() => {
    axios.get("/order/cartInfo")
      .then((res) => {
        console.log(res);
        var numProducts = 0;
        res.data.orderProducts.forEach((orderProd) => {
          numProducts += orderProd.quantity
        });
        setNumProdInCart(numProducts);
        
      })
      .catch((err) => {
        console.log(err);
      })
      ;
  }, []);

  const setCartCount = props.handleSetCartCount;
  useEffect(() => {
    console.log(numProdInCart);
    setCartCount(numProdInCart)
  }, [numProdInCart, setCartCount]);

  const quantity = 1;
  if (state.loading) {
    return (
      <div >
        Loading data
      </div>
    );
  } else {
    return (
      <Grow in={checked} >
        <div className={classes.root}>
          <Card className={classes.card1}>
            <CardContent className={classes.topContent}>
              <CardMedia
                className={classes.productImage}
                component="img"
                width="10"
                image={state.imageUrl}

              />

              <CardContent className={classes.cardContent1}>

                <Typography className={classes.productName}>
                  {capitalized(state.product.name)}
                </Typography>

                <Typography className={classes.productPrice}>
                  {state.product.price.toFixed(2)}$
              </Typography>

                <Typography className={classes.taxes}>
                  All prices include IVA
              </Typography>

                <Typography className={classes.availableText}>
                  Immediately Available.
              </Typography>

                <Typography className={classes.shippingTime}>
                  Delivered in 7-10 days
              </Typography>

              <Typography className={classes.secureTransactions}>
                Secure transactions
            </Typography>
               
              </CardContent>
              
            </CardContent>

            <Typography className={classes.description}>
                  {state.product.description}
            </Typography>

            <CardContent className={classes.buttonsContent}>

              <Button className={classes.addToCartButton} variant="contained" color="primary" onClick={() => { onAddToCart(state.product.id); setNumProdInCart(numProdInCart + quantity);setSnackSeverity("success"); setSnackMessage("Product added to cart!"); }}>
                Add to Cart
           </Button>

              <Button className={classes.buyNowButton} variant="contained" color="primary" component={RouterLink} to="/dashboard/shop/cart" onClick={() => { onAddToCart(state.product.id); setNumProdInCart(numProdInCart + quantity) }}>
                Buy Now
          </Button>
            </CardContent>
          </Card>

            <SnackbarAlert
              open={snackMessage !== ""}
              autoHideDuration={1500}
              onTimeout={() => setSnackMessage("")}
              severity={snackSeverity}
              message={snackMessage}
          />
        </div>


        
      </Grow>
      

    );
  }
}

export default Product;

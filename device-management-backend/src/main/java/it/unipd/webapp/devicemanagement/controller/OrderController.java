package it.unipd.webapp.devicemanagement.controller;

import it.unipd.webapp.devicemanagement.exception.ResourceNotFoundException;
import it.unipd.webapp.devicemanagement.model.*;
import it.unipd.webapp.devicemanagement.repository.*;

import it.unipd.webapp.devicemanagement.security.TokenGenerator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@Slf4j
@RequestMapping("/order")
public class OrderController {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private OrderRepository orderRepo;

    @Autowired
    private ProductRepository productRepo;

    @Autowired
    private OrderProductRepository order_productRepo;

    @Autowired
    private DeviceRepository deviceRepo;

    private final TokenGenerator tokenGenerator = new TokenGenerator();

    // This method can be replaced by a Customer static method
    private Customer getLoggedCustomer() {
        return (Customer) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    //Cart information: Query the unique non completed order of customer with id=1234.
    @GetMapping("/cartInfo")
    public ResponseEntity<OrderDetail> chartInfo(){
        log.debug("getNotcompletedOrders");
        //get customerId
        long customerId=getLoggedCustomer().getId();

        //get the unique not completed order
        Optional<OrderDetail> order=orderRepo.notcompletedOrders(customerId);

        // if the there are no not-completed orders, create one
        if(order.isEmpty()){
            log.debug("not-completed Order does not exist! This shouldn happen.");
            OrderDetail orderToAdd=new OrderDetail();
            orderToAdd.setAddress("");
            orderToAdd.setCustomer(getLoggedCustomer());
            Date date = new Date();
            date.setTime(date.getTime());   //???
            orderToAdd.setTimestamp(date);

            orderRepo.save(orderToAdd);
            return ResponseEntity.ok().body(orderToAdd);

        }

        return ResponseEntity.ok().body(order.get());
    }


    //Query List of all completed orders of customer with id=1234
    @GetMapping("/completedOrders")
    public ResponseEntity<List<OrderDetail>> completedOrders(){
        log.debug("getCompletedOrders");

        //get customerId
        long customerId=getLoggedCustomer().getId();

        //get the list of completed order of the user with id = customerId
        Optional<List<OrderDetail>> orders=orderRepo.completedOrders(customerId);

        return ResponseEntity.ok().body(orders.get());
    }

    //Add product to cart
    @GetMapping("/addProductToCart/{id}")
    public ResponseEntity<OrderProduct> addProductToCart(@PathVariable(value = "id") long productId){
        log.debug("addProductToCart");

        // to execute this query we need get the product and the order(cart) entities.

        //get customerId
        long customerId=getLoggedCustomer().getId();

        //get non-complete order info (cart)
        OrderDetail cart;
        //get the unique not completed order
        Optional<OrderDetail> order=orderRepo.notcompletedOrders(customerId);
        // if the there are no not-completed orders, create one
        if(order.isEmpty()){
            log.debug("not-completed Order does not exist! This should not happen.");
            OrderDetail orderToAdd=new OrderDetail();
            orderToAdd.setAddress("");
            orderToAdd.setCustomer(getLoggedCustomer());
            Date date = new Date();
            date.setTime(date.getTime());   //???
            orderToAdd.setTimestamp(date);
            orderRepo.save(orderToAdd);
            cart=orderToAdd;
        }else{
            cart=order.get();
        }

        //get the product corresponding to the id given or return an error.
        Optional<Product> prodData = productRepo.getInfo(productId);
        if (prodData.isEmpty()) {
            // Error: product not found
            log.debug("The product does not exists");
            return ResponseEntity.notFound().build();
        }


        //check if the pair (order_id,product_id) already present in the orders_products table. (That mean there was already some quantity of that product in the cart)
        Optional<OrderProduct> ordprod=order_productRepo.getQuantity(cart.getId(), prodData.get().getId());
        if(ordprod.isEmpty()){
            log.debug("The product was not in the cart, so we add it");
            //that product wasn't in the cart, so insert 1 unit of it
            OrderProduct order_product = new OrderProduct();
            order_product.setQuantity(1);
            order_product.setOrder(cart);
            order_product.setProduct(prodData.get());
            order_productRepo.save(order_product);
            //return
            return ResponseEntity.ok(order_product);
        }else{
            log.debug("The product was already in the cart, so quantity+=1");
            // there was already some quantity of that product, so just add +1
            OrderProduct order_product=ordprod.get();
            order_product.setQuantity(order_product.getQuantity()+1);
            order_productRepo.save(order_product);
            //return
            return ResponseEntity.ok(order_product);
        }

    }

    //Remove item from the cart
    @GetMapping("/removeProductFromCart/{id}")
    public ResponseEntity<OrderProduct> removeProductFromCart(@PathVariable(value = "id") long productId) {
        log.debug("removeProductFromCart");

        //get customerId
        long customerId=getLoggedCustomer().getId();

        //get non-complete order info (cart)
        OrderDetail cart;
        //get the unique not completed order
        Optional<OrderDetail> order=orderRepo.notcompletedOrders(customerId);
        // if the there are no not-completed orders, create one
        if(order.isEmpty()){
            log.debug("not-completed Order does not exist! This should not happen.");
            OrderDetail orderToAdd=new OrderDetail();
            orderToAdd.setAddress("");
            orderToAdd.setCustomer(getLoggedCustomer());
            Date date = new Date();
            date.setTime(date.getTime());   //???
            orderToAdd.setTimestamp(date);
            orderRepo.save(orderToAdd);
            cart=orderToAdd;
        }else{
            cart=order.get();
        }

        //get the product corresponding to the id given or return an error.
        Optional<Product> prodData = productRepo.getInfo(productId);
        if (prodData.isEmpty()) {
            // Error: product not found
            log.debug("The product does not exists");
            return ResponseEntity.notFound().build();
        }

        //delete, if the product or the cart does not exist doesn't matter.
        //check if the pair (order_id,product_id) is present in the orders_products table.
        Optional<OrderProduct> ordprod=order_productRepo.getQuantity(cart.getId(), prodData.get().getId());
        if(ordprod.isEmpty()){
            log.debug("The product was not in the cart");
            //that product wasn't in the cart
            //return
            return ResponseEntity.notFound().build();
        }else{
            log.debug("The product was in the cart, so we delete it");
            // The product was in the cart, so we delete it
            order_productRepo.delete(ordprod.get());
            //return
            return ResponseEntity.ok().build();
        }

    }


    //Change quantity of a product of the cart (non-completed order)
    @GetMapping("/editProductQuanity")
    public ResponseEntity<OrderProduct> editProductQuanity(
            @RequestParam(value = "productId") long productId,
            @RequestParam(value = "newQuantity") int newQuantity) throws ResourceNotFoundException {
        log.debug("editProductQuanity");

        if(newQuantity<1){
            return ResponseEntity.badRequest().build();
        }

        //get customerId
        long customerId=getLoggedCustomer().getId();

        //get non-complete order info (cart)
        OrderDetail cart;
        //get the unique not completed order
        Optional<OrderDetail> order=orderRepo.notcompletedOrders(customerId);
        // if the there are no not-completed orders, create one
        if(order.isEmpty()){
            log.debug("not-completed Order does not exist! This should not happen.");
            OrderDetail orderToAdd=new OrderDetail();
            orderToAdd.setAddress("");
            orderToAdd.setCustomer(getLoggedCustomer());
            Date date = new Date();
            date.setTime(date.getTime());   //???
            orderToAdd.setTimestamp(date);
            orderRepo.save(orderToAdd);
            cart=orderToAdd;
        }else{
            cart=order.get();
        }

        //get the product corresponding to the id given or return an error.
        Optional<Product> prodData = productRepo.getInfo(productId);
        if (prodData.isEmpty()) {
            // Error: product not found
            log.debug("The product does not exists");
            return ResponseEntity.notFound().build();
        }

        //Update, if the product is in the cart
        //check if the pair (order_id,product_id) is present in the orders_products table.
        Optional<OrderProduct> ordprod=order_productRepo.getQuantity(cart.getId(), prodData.get().getId());
        if(ordprod.isEmpty()){
            log.debug("The product was not in the cart");
            //that product wasn't in the cart
            //return
            return ResponseEntity.notFound().build();
        }else{
            log.debug("The product was in the cart, so we update the quantity");
            // The product was in the cart, so we update the quanity
            OrderProduct order_product=ordprod.get();
            order_product.setQuantity(newQuantity);
            order_productRepo.save(order_product);
            //return
            return ResponseEntity.ok(order_product);
        }

    }




    //Query list of products of order with order_Id=1234
    @GetMapping("/getProductsOfOrder")
    public ResponseEntity<List<OrderProduct>> getProductsOfOrder(
            @RequestParam(value = "orderId") long orderId
    ) throws ResourceNotFoundException {
        log.debug("getProductsOfOrder");

        //get customerId
        long customerId=getLoggedCustomer().getId();

        // We can avoid to retrieve the order. However we would like know whether the order exists or not and show a message when the order does not exist
        orderRepo.findById(orderId).orElseThrow(() -> new ResourceNotFoundException("Order " +orderId+ " not found"));

        //check if the Customer owns that order
        orderRepo.checkOrderCustomerMatch(customerId,orderId).orElseThrow(() -> new ResourceNotFoundException("Customer "+customerId+" doesn't own the Order " +orderId));
        List<OrderProduct> orderProduct = order_productRepo.getByOrderId(orderId);


        return ResponseEntity.ok(orderProduct);
    }

    //Buy all products on the cart
    @GetMapping("/buyCart")
    public ResponseEntity<List<OrderProduct>> buyCart(
            @RequestParam(value = "orderId") long orderId,
            @RequestParam(value = "orderAddress") String orderAddress
    ) throws ResourceNotFoundException {

        //Address must not be empty
        if (orderAddress==""){
            return ResponseEntity.notFound().build();
        }

        //get customerId
        long customerId=getLoggedCustomer().getId();

        //check if really the order is the cart and is owned by the customer
        OrderDetail order= orderRepo.checkOrderCustomerMatch(customerId,orderId).orElseThrow(() -> new ResourceNotFoundException("Customer "+customerId+" doesn't own the Order " +orderId));
        if (order.isCompleted()){
            return ResponseEntity.notFound().build();
        }

        //check if the cart is empty...
        List<OrderProduct> orderProductsCart = order_productRepo.getByOrderId(orderId);
        if (orderProductsCart.size()<1){
            return ResponseEntity.notFound().build();
        }

        //update from non-completed to completed, update timestamp, update address.
        order.setAddress(orderAddress);
        order.setCompleted(true);
        Date date = new Date();
        date.setTime(date.getTime());
        order.setTimestamp(date);

        //create new empty, non-completed order
        OrderDetail newCart=new OrderDetail();
        newCart.setAddress(orderAddress);
        newCart.setCustomer(getLoggedCustomer());
        date.setTime(date.getTime());
        newCart.setTimestamp(date);
        orderRepo.save(newCart);



        //for each product on the completed order, for each quantity: create device
        DeviceController deviceController = new DeviceController();
        for (OrderProduct op: orderProductsCart) {
            for (int q=0; q<op.getQuantity();q++){
                Product prod=op.getProduct();
                Customer cust=getLoggedCustomer();
                OrderDetail ord = op.getOrder();
                //TODO:Add new device
                log.debug("Buy Cart: trying to add device "+prod.getId());
                //ResponseEntity r =deviceController.addDevice(prod.getId(),1,false,0,0);

                DeviceConfig deviceConfig = new DeviceConfig();
                deviceConfig.setToken(tokenGenerator.nextToken());
                deviceConfig.setUpdate_frequency(1);
                deviceConfig.setEnabled(false);
                deviceConfig.setLatitude(0);
                deviceConfig.setLongitude(0);

                DeviceStatus deviceStatus = new DeviceStatus();
                deviceStatus.setBattery((byte)100);
                deviceStatus.setVersion("x.y.z");
                deviceStatus.setLast_update(new Date());

                Device device = new Device();
                device.setCustomer(cust);
                device.setConfig(deviceConfig);
                device.setDeviceStatus(deviceStatus);

                device.setProduct(prod);

                deviceRepo.save(device);
                log.debug("Device added");
            }
        }

        return ResponseEntity.ok().build();
    }

}
'use strict'

// Initialises cart if it hasn't been set
$(document).ready(function () { initialiseJSON(); });

// Executed when index.html page is ready
function onIndexLoad() {

    // Materialize JavaScript component initialization
    $('.parallax').parallax();

    // Used to alternate between the two responsive product columns
    let columnSwitch = 1;

    // Reads json on server
    $.getJSON(jsonUrl, function (json) {

        // For each product in json...
        for (let i = 0; i < json.length; i++) {

            // Gets product info
            let id = json[i].id;
            let name = json[i].name;
            let description = json[i].description;
            let price = json[i].price;

            // Creates html tags with product info
            let html = `<div class='horizontal hoverable card'>
                            <div class='valign-wrapper card-image'>
                                <img src='img/${id}.jpeg'>
                            </div>
                            <div class='card-stacked'>
                                <div class='card-content'>
                                    <h5>${name}</h5>
                                    <p>${description}</p>
                                    <h4>$${price}</h4>
                                </div>
                                <div class='card-action'>
                                    <a href='product.html?id=${id}'>Buy</a>
                                </div>
                            </div>
                        </div>`;

            // Appends product to responsive columns
            if (columnSwitch > 0)
                $('.product-col:first').append(html);
            else
                $('.product-col:eq(1)').append(html);

            // Alternates column
            columnSwitch *= -1;

        }
    });
}

// Executed when create.html page is ready
function onCreateLoad() {

    // Gets products in cart
    let cart = getCart();

    // If there are any products in the cart
    if (cart.length > 0) {

        // Reads json on server
        $.getJSON(jsonUrl, function (json) {

            // Declares product, html-building, and total cost variables
            let product, id, name, quantity, price, html, total;

            // Sets total to 0
            total = 0;

            // For each product in cart...
            for (let i = 0; i < cart.length; i++) {

                // Finds product with id
                product = json.find(item => item.id == cart[i].id);

                // Gets product info and calculates total
                id = cart[i].id;
                name = product.name;
                quantity = cart[i].quantity;
                price = (product.price * quantity).toFixed(2);
                total += parseFloat(price);

                // Creates html tags with product info
                html = `<tr>
                            <td>
                                <a href='product.html?id=${id}'>
                                    <img src='img/${id}.jpeg'>
                                </a>
                            </td>
                            <td>
                                <a href='product.html?id=${id}'>
                                    <p>${name}</p>
                                 </a>
                            </td>
                            <td class='quantity'>${quantity} ${quantity == 1 ? 'bottle' : 'bottles'}</td>
                            <td class='price'>$ ${price}</td>
                            <td>
                                <a href='product.html?id=${id}'>
                                    <i class='black-text material-icons'>edit</i>
                                </a>
                            </td>
                            <td class='p-right'>
                                <a href='javascript:removeProduct(${id})'>
                                    <i class='black-text material-icons'>delete</i>
                                </a>
                            </td>
                        </tr>`;

                // Appends product to table
                $('tbody').append(html);

            }

            // Builds shipping cost row
            html = `<tr>
                        <td>
                            <img src='img/delivery.png'>
                        </td>
                        <td>
                            <p>Shipping Cost</p>    
                        </td>
                        <td></td>
                        <td class='price'>$ 15.00</td>
                        <td></td>
                        <td></td>
                    </tr>`;

            // Appends shipping cost to end of table
            $('tbody').append(html);

            // Adds shipping cost to total and fixes the number of decimals
            total = (total + 15).toFixed(2);

            // Sets button name with total price
            $('button').html(`Buy everything ($${total})`);

        });
    }
    // If there are no products in the cart, displays message and overrides page elements
    else {
        let html = `<div class='center container m-top'>
                        <h1>Your cart is empty</h1>
                        <img src='img/empty-cart.png'/>
                        <h4 class='m-bot'>
                            Try adding some 
                            <a href='index.html'>products</a>
                            to it
                        <h4/>
                    </div>`;
        $('main').html(html);
    }
}

// Executed when product.html page is ready
function onEventLoad() {

    // Materialize JavaScript component initialization
    $('textarea').characterCounter();

    // Gets id from url
    let id = getParam('id');

    // If user accessed the page with no product id set, sets it to 1
    if (!id) id = 1;

    // Reads json on server
    $.getJSON(jsonUrl, function (json) {

        // Finds product with id
        let product = json.find(item => item.id == id);

        // If product was found, display its info
        if (product) {

            // Sets page title
            document.title = product.name;

            // Displays product info on page
            $('#product-id').val(product.id);
            $('#product-name').html(product.name);
            $('#product-description').html(product.description);
            $('#product-price').html('$ ' + product.price);
            $('#product-image').attr('src', 'img/' + product.id + '.jpeg');

            // Gets products in cart
            let cart = getCart();

            // If the product exists in the cart already, sets input quantity
            for (let i = 0; i < cart.length; i++) {
                if (cart[i].id == product.id) {
                    $('#quantity').val(cart[i].quantity);
                    break;
                }
            }

            // If there are any reviews...
            if (product.reviews.length > 0) {

                // Displays review section title
                let h4 = `<h4 class='center'>Reviews</h4>`;
                $('#reviews').html(h4);

                // For each product review...
                for (let i = 0; i < product.reviews.length; i++) {

                    // Gets review info
                    let user = product.reviews[i].user;
                    let review = product.reviews[i].review;

                    // Creates html tags with review info
                    let html = `<a href=''>
                                    <h6>${user} :</h6>
                                </a>
                                <blockquote>
                                    <p>${review}</p>
                                </blockquote>`;

                    // Appends review to div
                    $('#reviews').append(html);

                }
            }
        }
        // If product wasn't found, display error message and overrides page elements
        else {
            let html = `<div class='center container'>
                            <h1 class='m-top'>Product not found</h1>
                            <h4 class='m-bot'>
                                Check our available products 
                                <a href='index.html'>here</a>
                            <h4/>
                        </div>`;
            $('main').html(html);
        }
    });
}

// Adds product to cart. If the product was already added, updates the quantity
function addEvent() {

    // Gets JSON from browser storage
    let cart = getCart();

    // Gets product info and creates object
    let id = $('#product-id').val();
    let quantity = $('#quantity').val();
    let product = { "id": id, "quantity": quantity };

    // If the product exists in the cart already, delets the product and updates cart
    if (cart.some(item => item.id == id)) {
        removeEvent(id);
        cart = getCart();
    }

    // Adds new product to cart and saves cart
    cart[cart.length] = product;
    saveEvents(cart);

}

// Removes product from cart
function removeEvent(id) {

    // Gets JSON from browser storage
    let cart = getCart();

    // Finds product and delets it
    for (let i = cart.length - 1; i >= 0; i--) {
        if (cart[i].id == id) {
            cart.splice(i, 1);
            break;
        }
    }

    // Saves cart and reloads cart
    saveEvents(cart);
    location.reload();

}

// Removes all products from cart
function removeAll() {
    localStorage.setItem('cart', '[]');
    location.reload();
}

// Gets param from url
function getParam(name) {

    // Gets all url values
    let url = window.location.search.substring(1);
    let values = url.split('&');

    // For each value in url...
    for (let i = 0; i < values.length; i++) {

        // Get individual value
        let value = values[i].split('=');

        // Compares param name with searched name. If it's found, returns its value
        if (value[0] == name)
            return value[1];

    }
}

// Gets JSON object
function getEvents() {
    return JSON.parse(localStorage.getItem('events'));
}

// Saves JSON object
function saveEvents(events) {
    localStorage.setItem('events', JSON.stringify(events));
}

// Initialises JSON if it hasn't been set
function initialiseJSON() {
    if (!localStorage.getItem('events')) localStorage.setItem('events', '[]');
}
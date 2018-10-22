'use strict'

// Initializes JSON and Materialize Javascript components
$(document).ready(function () {

    initializeJSON();
    initializeMaterialize();

    // localStorage.setItem('json', '[]');
    // console.log(getJSON());

});

// Executed when index.html page is ready
function onIndexLoad() {

    // Used to alternate between the two responsive columns
    let columnSwitch = 1;

    // Gets JSON from local storage
    let json = getJSON();

    // For each object in JSON...
    for (let i = 0; i < json.length; i++) {

        // Gets info
        let id = json[i].id;
        let title = json[i].title;
        let creator = json[i].creator;
        let date = json[i].date;
        let address = json[i].address;
        let description = json[i].description;
        let image = json[i].image;
        let attendants = json[i].attendants.length;

        // Creates html with object info
        let html = `<div class='horizontal hoverable card'>
                        <div class='valign-wrapper card-image'>
                            <img src='data:image/png;base64, ${image}'>
                        </div>
                        <div class='card-stacked'>
                            <div class='card-content'>
                                <h4>${title}</h4>
                                <p class='small-text'>Organized by ${creator}, ${attendants} people coming</p>
                                <p class='big-text'>Taking place on ${date} at ${address}</p>
                                <p class='description'>${description}</p>
                            </div>
                            <div class='card-action'>
                                <a href='event.html?id=${id}'>See details</a>
                            </div>
                        </div>
                    </div>`;

        // Appends html to responsive columns
        if (columnSwitch > 0)
            $('.responsive-column:first').append(html);
        else
            $('.responsive-column:eq(1)').append(html);

        // Alternates column
        columnSwitch *= -1;

    }

}

// Executed when event.html page is ready
function onEventLoad() {

    // Gets id from url and JSON from local storage
    let id = getParam('id');
    let json = getJSON();

    // Finds object with id
    let object = json.find(item => item.id == id);

    // If object was found, display its info
    if (object) {

        // Sets page title
        document.title = object.title;

        // Displays object info on page
        $('#id').val(object.id);
        $('#title').val(object.title);
        $('#event-title').html(object.title);
        $('#creator').val(object.creator);
        $('#date').val(object.date);
        $('#address').val(object.address);
        $('#description').val(object.description);
        $('#preview').attr('src', `data:image/png;base64, ${object.image}`);
        $('#preview').show();
        displayAttendants(object.attendants);

        // Updates text fields
        M.updateTextFields();

    }
    // If object wasn't found, display error message and overrides page elements
    else {

        let html = `<div class='center container'>
                        <h1>Event not found</h1>
                        <h4 class='m-bot'>
                            Check out available events
                            <a href='index.html'>here</a>
                        <h4/>
                    </div>`;

        $('main').html(html);

    }
}

// Initializes JSON if it hasn't been
function initializeJSON() {
    if (!localStorage.getItem('json')) localStorage.setItem('json', '[]');
}

// Materialize JavaScript component initialization
function initializeMaterialize() {

    $('textarea').characterCounter();
    $('.datepicker').datepicker();
    $('.parallax').parallax();
    $('.modal').modal();
    $('.chips').chips();
    $('.chips-placeholder').chips({
        placeholder: 'Friends\' names'
    });
    $('.chips-autocomplete').chips({
        autocompleteOptions: {
            data: {
                'jorcebs': null,
                'lorem': null,
                'ipsum': null,
                'dolor': null,
                'sit': null,
                'amet': null,
                'consectetur': null,
                'adipiscing': null,
                'elit': null
            },
            limit: Infinity,
            minLength: 1
        }
    });

}

// Gets JSON object
function getJSON() {
    return JSON.parse(localStorage.getItem('json'));
}

// Saves JSON
function saveJSON(json) {
    localStorage.setItem('json', JSON.stringify(json));
}

// Adds object to JSON
function add() {

    // Gets JSON from local storage
    let json = getJSON();

    // Gets object info
    let id = json.length + 1;
    let title = $('#title').val();
    let creator = $('#creator').val();
    let date = $('#date').val();
    let address = $('#address').val();
    let description = $('#description').val();
    let image = getBase64Image(document.getElementById('preview'));
    let attendants = fixAttendants($('div.chip[tabindex="0"]').text());

    // Creates object
    let object = {
        'id': id,
        'title': title,
        'creator': creator,
        'date': date,
        'address': address,
        'description': description,
        'image': image,
        'attendants': attendants
    };

    // Adds object to JSON
    json[json.length] = object;

    // Saves JSON
    saveJSON(json);

}

// Removes object from JSON using id
function remove(id) {

    // Gets JSON from local storage
    let json = getJSON();

    // Finds object and delets it
    for (let i = json.length - 1; i >= 0; i--) {
        if (json[i].id == id) {
            json.splice(i, 1);
            break;
        }
    }

    // Saves JSON and reloads page
    saveJSON(json);
    location.reload();

}

// Updates object info
function update() {

    // Gets object id
    let id = $('#id').val();

    // Delets object and adds it again
    remove(id);
    add(id);

}

// Removes all objects in JSON and reloads page
function removeAll() {
    localStorage.setItem('json', '[]');
    location.reload();
}

// Gets parameter from url
function getParam(name) {

    // Gets all parameters from url
    let params = window.location.search.substring(1).split('&');

    // For each parameter in url...
    for (let i = 0; i < params.length; i++) {

        // Gets individual parameter
        let param = params[i].split('=');

        // If it's the parameter we're looking for, returns its value
        if (param[0] == name)
            return param[1];

    }
}

// Breaks up text into separate attendats usernames
function fixAttendants(text) {
    return text.split('close').filter(function (el) { return el.length != 0 });
}

// Creates JSON for chip tags usage
function displayAttendants(attendants) {

    // If there is at least one attendant
    if (attendants.length > 0) {

        // Creates json object
        let json = [];

        // For each attendant...
        for (let i = 0; i < attendants.length; i++) {

            // Creates object
            let object = { tag: attendants[i] };

            // Adds object to JSON
            json[json.length] = object;
        }

        // Displays attendants
        $('.chips-initial').chips({
            data: json
        });
    }
}

// Displays uploaded image
function loadImage(input) {

    if (input.files && input.files[0]) {
        var reader = new FileReader();

        // Displays image
        reader.onload = function (e) {
            $('#preview').attr('src', e.target.result);
            $('#preview').show();
        }

        reader.readAsDataURL(input.files[0]);
    }
}

// Gets image string
function getBase64Image(img) {

    let canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;

    let ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    let dataURL = canvas.toDataURL('image/png');

    return dataURL.replace(/^data:image\/(png|jpg);base64,/, '');

}
$( document ).ready( function(){
    let eventToSet = {};
    let eventSearch = {};
    
    let editEventMode = false;
    let addEventMode = false;

    let allEvents = [];
    getAllEvents();

    let eventToEdit;

    $("#add-event-button").click(function(){
        addEventMode = true;
    });

    //gets id of event to send to API
    $(document).on('click', '[href]', function(){
        let id = $(this).attr('id');
        editEventMode = true;
        getEventToEdit(id);
    });

    //creates search object to send to API
    $("#search-events-button").click(function(){
        console.log('searching');
        let title = $("#event-title-search").val();
        let afterDate = $("#start-date-after-search").val();
        let beforeDate = $("#start-date-before-search").val();

        if (title == ""){
            title = null;
        } 
        if (afterDate == ""){
            afterDate = null;
        }
        if (beforeDate == ""){
            beforeDate = null;
        }
        eventSearch.seTitle = title;
        eventSearch.seStartDate = afterDate;
        eventSearch.seEndDate = beforeDate;

        searchForEvent(eventSearch); 
    });

    //creates event object to send to API
    $("#save-event-button").click(function(){
        //sets id so API can determine whether to add a new event or update existing one
        if(editEventMode){
            eventToSet.id = id;
        } else if(addEventMode) {
            eventToSet.id = 0;
        };

        eventToSet.title = $("#event-title").val();
        eventToSet.startDateAfter = $("#start-date-after").val();
        eventToSet.startDateBefore = $("#start-date-before").val();
        eventToSet.eventLocation = $("#event-location").val();
        eventToSet.eventDescription = $("#event-description").val();
        eventToSet.eventUrl = $("#event-url").val();
        eventToSet.hideEvent = $("#hide-event").is(':checked');

        setEvent(eventToSet);

        editEventMode = false;
        addEventMode = false;
    });

    $(".close-button").click(function(){
        clearAddEditForm();
        editEventMode = false;
        addEventMode = false;
    });

    //clears modal when closed
    function clearAddEditForm(){
        eventToAddOrEdit = {};
        $("#event-title").val('');
        $("#start-date-after").val('');
        $("#start-date-before").val('');
        $("#event-location").val('');
        $("#event-description").val('');
        $("#event-url").val('');
        $("#hide-event").prop( "checked", false );
    };

    //calls to API to fetch all events
    function getAllEvents(){
        $.ajax({
            type: 'GET',
            url: 'http://137.26.231.36/NKCAAPI/SiteEvent/List'
          }).done(function(response){
            allEvents = response;
            displayEvents(allEvents);
            console.log('all events', allEvents);
          }).fail(function(response){
            console.log('error', response);
          });
    };

    function editing(){
        console.log('edit event');
    };

    //grabs specific event information to autofill the edit modal
    function getEventToEdit(id){
        $.ajax({
            type: 'GET',
            url: `http://137.26.231.36/NKCAAPI/SiteEvent/GetByID/${id}`
          }).done(function(response){
            eventToEdit = response;
            autofillEditForm(eventToEdit);
          }).fail(function(response){
            console.log('error', response);
          });
    };

    //iterates through events sent back from the API and displays them on the dom
    function displayEvents(events){
        let $tr = $('<tbody></tbody>');
        for (let event of events){
            let date = new Date(event.seStartDate); 
            let dateString = date.toLocaleDateString();
            $tr.append(`
            <tr>
            <td> <a href="" id="${event.seID}" data-toggle="modal" data-target="#add-edit-modal"> ${event.seTitle} </a> </td>
            <td> ${dateString} </td>
            <td> ${event.seDescription} </td>
            </tr>
            `);
        };
        $("#event-table-body").append($tr);
    };

    //sends query to API and fetches back search results
    function searchForEvent(search){
        let searchObject = JSON.stringify(search);
        $.ajax({
            url: "http://137.26.231.36/NKCAAPI/SiteEvent/Search",
            type: "POST",
            headers: {
              "Content-Type": "application/json",
              "cache-control": "no-cache"
            },
            processData: false,
            data: `{\n\t\"seTitle\": ${search.seTitle},\n\t\"seStartDate\": ${search.seStartDate},\n\t\"seEndDate\": ${search.seEndDate}\n}`
          }).done(function(response){
            displayEvents(response);
          }).fail(function(response){
            console.log('error', response);
          });
    };

    //calls to API to either add a new event or add an existing one
    function setEvent(event){
        $.ajax({
            async: true,
            crossDomain: true,
            url: "http://137.26.231.36/NKCAAPI/SiteEvent/Set",
            type: "POST",
            headers: {
              "Content-Type": "application/json",
              "cache-control": "no-cache"
            },
            processData: false,
            data: `{\n\"seID\": ${event.seID},\n\"seTitle\":\"${event.seTitle}\",\n\"seStartDate\": \"${event.seStartDate}\",\n\"seEndDate\": \"${event.seEndDate}\",\n\"seLocation\": \"${event.seLocation}\",\n\"seDescription\": \"${event.seDescription}\",\n\"seUrl\": \"${event.seUrl}\",\n\"seActive\": ${event.seActive}\n}`
          }).done(function(response){
            getAllEvents();
            closeModal();
            clearAddEditForm();
          }).fail(function(response){
            console.log('error', response);
          });
    };

    //closes the modal when finished adding/editing an event
    function closeModal(){
        $('#add-edit-modal').modal('hide');
    };

    //autofills edit modal
    function autofillEditForm(event){
        $("#event-title").val(event.seTitle);
        $("#start-date-after").val(event.seStartDate.substring(0, 10)); 
        $("#start-date-before").val(event.seEndDate.substring(0, 10));
        $("#event-location").val(event.seLocation);
        $("#event-description").val(event.seDescription);
        $("#event-url").val(event.seUrl);
        $("#hide-event").prop( "checked", event.seActive);
    };

    //checks for character limits and displays error if exceeded
    $("#event-title-search").keydown(function(){
        console.log($("#event-title-search").val().length);
        if ($("#event-title-search").val().length > 129){
            $("#event-title-search-error").css("display", "block");
        } else{
            $("#event-title-search-error").css("display", "none");
        }
    });
    $("#event-title").keydown(function(){
        if ($("#event-title").val().length > 129){
            $("#event-title-error").css("display", "block");
        } else{
            $("#event-title-error").css("display", "none");
        }
    });
    $("#event-location").keydown(function(){
        if ($("#event-location").val().length > 129){
            $("#event-location-error").css("display", "block");
        } else {
            $("#event-location-error").css("display", "none");
        }       
    });
    $("#event-description").keydown(function(){
        if ($("#event-description").val().length > 4001){
            $("#event-description-error").css("display", "block");
        } else{
            $("#event-description-error").css("display", "none");
        }        
    });
    $("#event-url").keydown(function(){
        if ($("#event-url").val().length > 2049){
            $("#event-url-error").css("display", "block");
        } else{
            $("#event-url-error").css("display", "none");
        }      
    });

});
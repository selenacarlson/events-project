$( document ).ready( function(){
    
    let allEvents = [];  
    let eventSearch = {};
    let eventToSet = {};
    
    let editEventMode = false;
    let addEventMode = false;

    getAllEvents();

    //calls to API to fetch all events
    function getAllEvents(){
        $.ajax({
            type: 'GET',
            url: 'http://137.26.231.36/NKCAAPI/SiteEvent/List'
          }).done(function(response){
            allEvents = response;
            displayEvents(allEvents);
          }).fail(function(response){
            console.log('error', response);
          });
    };

    //iterates through events sent back from the API and displays them on the dom
    function displayEvents(events){
        $("#event-table-body").remove("tbody");
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

    //creates search object to send to API
    $("#search-events-button").click(function(){
        let title = $("#event-title-search").val();
        let afterDate = $("#start-date-after-search").val();
        let beforeDate = $("#start-date-before-search").val();

        //formats blank responses for API call
        if (title == ""){
            title = null;
        }; 
        if (afterDate == undefined){
            afterDate = null;
        };
        if (beforeDate == undefined){
            beforeDate = null;
        };
        eventSearch.seTitle = title;
        eventSearch.seStartDate = formatDate(afterDate);
        eventSearch.seEndDate = formatDate(beforeDate);
        searchForEvent(eventSearch); 
    });

    function formatDate(date){
        return moment(date).toISOString();
    }

    //sends query to API and fetches back search results
    function searchForEvent(search){
        $.ajax({
            async: true,
            crossDomain: true,
            url: "http://137.26.231.36/NKCAAPI/SiteEvent/Search",
            type: "POST",
            headers: {
              "Content-Type": "application/json",
              "cache-control": "no-cache"
            },
            processData: false,
            data: `{\n\t\"seTitle\": ${search.seTitle},
                    \n\t\"seStartDate\": ${search.seStartDate},
                    \n\t\"seEndDate\": ${search.seEndDate}\n}`
        }).done(function(response){
            allEvents = [];
            allEvents.push(response);
            displayEvents(allEvents);
        }).fail(function(response){
            console.log('error', response);
        });
    };

    //tells modal to add event instead of edit
    $("#add-event-button").click(function(){
        addEventMode = true;
    });

    //tells modal to edit event instead of add and gets id of event to send to API
    $(document).on('click', '[href]', function(){
        let id = $(this).attr('id');
        editEventMode = true;
        getEventToEdit(id);
    });

    //grabs specific event information to autofill the edit modal
    function getEventToEdit(id){
        $.ajax({
            type: 'GET',
            url: `http://137.26.231.36/NKCAAPI/SiteEvent/GetByID/${id}`
        }).done(function(response){
            autofillEditForm(response);
        }).fail(function(response){
            console.log('error', response);
        });
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

    //creates event object to send to API
    $("#save-event-button").click(function(){
        //sets id so API can determine whether to add a new event or update existing one
        if(editEventMode){
            eventToSet.id = id;
        } else if(addEventMode) {
            eventToSet.id = 0;
        };

        let seTitle = $("#event-title").val();
        let seStartDate = $("#start-date-after").val();
        let seEndDate = $("#start-date-before").val();
        let seLocation = $("#event-location").val();
        let seDescription = $("#event-description").val();
        let seUrl = $("#event-url").val();
        let seActive = $("#hide-event").is(':checked');

        if(seTitle == "" || seStartDate == undefined){
            $("#required-fields-error").css("display", "block");
        } else{
            $("#required-fields-error").css("display", "none");

            //formats values for API call
            if(seEndDate == undefined){
                seEndDate = null;
            }
            if(seLocation == ""){
                seLocation = " ";
            };
            if(seDescription == ""){
                seDescription = " ";
            };
            if(seUrl == ""){
                seUrl = " ";
            }

            eventToSet.seTitle = seTitle;
            eventToSet.seStartDate = formatDate(seStartDate);
            eventToSet.seEndDate = formatDate(seEndDate);
            eventToSet.seLocation = seLocation;
            eventToSet.seDescription = seDescription;
            eventToSet.seUrl = seUrl;
            eventToSet.seActive = seActive;
            setEvent(eventToSet);
        }
    });

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
            data: `{\n\"seID\": ${event.seID},
                    \n\"seTitle\":\"${event.seTitle}\",
                    \n\"seStartDate\": \"${event.seStartDate}\",
                    \n\"seEndDate\": \"${event.seEndDate}\",
                    \n\"seLocation\": \"${event.seLocation}\",
                    \n\"seDescription\": \"${event.seDescription}\",
                    \n\"seUrl\": \"${event.seUrl}\",
                    \n\"seActive\": ${event.seActive}\n}`
        }).done(function(response){
            getAllEvents();
            closeModal();
            clearAddEditForm();
        }).fail(function(response){
            console.log('error', response);
        });
    };

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
        editEventMode = false;
        addEventMode = false;
    };

    //modal reset process when closed
    $(".close-button").click(clearAddEditForm);
    
    //closes the modal when finished adding/editing an event
    function closeModal(){
        $('#add-edit-modal').modal('hide');
    };

    //checks for character limits and displays error if limit is exceeded
    $("#event-title-search").keydown(function(){
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
// RSVP form functionality
$(document).ready(function() {
    // Modifichiamo la gestione del submit per formattare correttamente i partecipanti
    $('.ajaxForm').off('submit').on('submit', function(e) {
        e.preventDefault();
        var form = $(this);
        
        // Show loading state
        $('#submitButton').prop('disabled', true).text('Submitting...');
        
        // Ottieni i dati base del form
        var formData = form.serializeArray();
        
        // Troviamo tutti i partecipanti e formattiamoli in modo leggibile
        var attendees = [];
        var family = {};
        var notes = "";
        
        // Raggruppa i dati per partecipante
        var attendeeData = {};
        
        $.each(formData, function(i, field) {
            if (field.name === 'familyName') {
                family.name = field.value;
            } else if (field.name === 'email') {
                family.email = field.value;
            } else if (field.name === 'additionalNotes') {
                notes = field.value;
            } else if (field.name.indexOf('attendees[') === 0) {
                // Estrai l'indice e la proprietà
                var matches = field.name.match(/attendees\[(\d+)\]\[([^\]]+)\]/);
                if (matches) {
                    var index = matches[1];
                    var prop = matches[2];
                    
                    // Inizializza l'oggetto se non esiste
                    if (!attendeeData[index]) {
                        attendeeData[index] = {};
                    }
                    
                    // Gestisci gli array (come intolleranze) raccogliendoli in un array
                    if (prop.indexOf('intolerances') !== -1) {
                        if (!attendeeData[index]['intolerances']) {
                            attendeeData[index]['intolerances'] = [];
                        }
                        attendeeData[index]['intolerances'].push(field.value);
                    } else {
                        // Salva normalmente tutte le altre proprietà
                        attendeeData[index][prop] = field.value;
                    }
                }
            }
        });
        
        // Formatta ogni partecipante
        $.each(attendeeData, function(index, attendee) {
            var text = attendee.firstName + ' ' + attendee.lastName + ' (Menu: ' + attendee.menu + ')';
            
            // Aggiungi dettagli bambino se applicabile
            if (attendee.isChild === 'yes') {
                text += ' - Bambino ';
                if (attendee.childAge) {
                    text += attendee.childAge === 'under1' ? 'sotto 1 anno' : attendee.childAge + ' anni';
                }
                if (attendee.highchair === 'yes') {
                    text += ' - Necessita seggiolone';
                }
            }
            
            // Aggiungi intolleranze se presenti
            if (attendee.intolerances && attendee.intolerances.length > 0) {
                text += ' - Intolleranze: ' + attendee.intolerances.join(', ');
            }
            
            attendees.push(text);
        });
        
        // Crea i dati formattati da inviare
        var formattedData = {
            familyName: family.name || '',
            email: family.email || '',
            attendees_formatted: attendees.join('\n'),
            additionalNotes: notes
        };
        
        // Invia i dati formattati
        $.ajax({
            url: form.attr('action'),
            method: form.attr('method'),
            data: formattedData,
            dataType: 'json',
            success: function(response) {
                // Show success message
                form.html('<div class="alert alert-success text-center">' +
                          '<h4>Thank you for your RSVP!</h4>' +
                          '<p>We have received your submission and look forward to celebrating with you.</p>' +
                          '</div>');
            },
            error: function(xhr, status, error) {
                // Show error message
                form.prepend('<div class="alert alert-danger">' +
                             '<h4>Error!</h4>' +
                             '<p>There was a problem submitting your RSVP. Please try again or contact us directly.</p>' +
                             '</div>');
                $('#submitButton').prop('disabled', false).text('Submit RSVP');
            }
        });
    });

    // Add and remove attendee functionality
    var addBtn = $('#addAttendeeBtn');
    var removeBtn = $('#removeAttendeeBtn');
    var container = $('#attendeesContainer');
    
    // Add event handlers for the child-related options
    initChildOptions();
    
    // Add another attendee
    addBtn.click(function() {
        var attendees = container.find('.attendee-form');
        var lastIndex = parseInt(attendees.last().attr('data-index'));
        var newIndex = lastIndex + 1;
        
        // Clone the first attendee form and update its index
        var newAttendee = attendees.first().clone();
        newAttendee.attr('data-index', newIndex);
        
        // Update the attendee title
        newAttendee.find('.attendee-title').text('ATTENDEE #' + (newIndex + 1));
        
        // Update all input names and clear values
        newAttendee.find('input, select, textarea').each(function() {
            var input = $(this);
            var name = input.attr('name');
            if (name) {
                input.attr('name', name.replace(/\[0\]/g, '[' + newIndex + ']'));
            }
            
            // Clear values except for select elements with a selected default
            if (!input.is('select') || !input.find('option:selected').prop('defaultSelected')) {
                if (input.attr('type') === 'checkbox') {
                    input.prop('checked', false);
                } else {
                    input.val('');
                }
            }
            
            // Update IDs for child-related elements
            if (input.attr('id') && input.attr('id').includes('_0')) {
                var newId = input.attr('id').replace('_0', '_' + newIndex);
                input.attr('id', newId);
                input.attr('data-index', newIndex);
            }
        });
        
        // Update child option container IDs
        newAttendee.find('div[id]').each(function() {
            var div = $(this);
            if (div.attr('id') && div.attr('id').includes('_0')) {
                var newId = div.attr('id').replace('_0', '_' + newIndex);
                div.attr('id', newId);
            }
        });
        
        // Hide the child options initially
        newAttendee.find('.child-options').hide();
        newAttendee.find('.child-age-options').hide();
        newAttendee.find('.highchair-options').hide();
        
        // Append the new attendee form
        container.append(newAttendee);
        
        // Add event handlers to the new elements
        addChildOptionsListeners(newIndex);
        
        // Show remove button if there's more than one attendee
        if (container.find('.attendee-form').length > 1) {
            removeBtn.show();
        }
    });
    
    // Remove the last attendee
    removeBtn.click(function() {
        var attendees = container.find('.attendee-form');
        if (attendees.length > 1) {
            attendees.last().remove();
            
            // Hide remove button if there's only one attendee left
            if (container.find('.attendee-form').length === 1) {
                removeBtn.hide();
            }
        }
    });
    
    // Function to initialize child option handlers
    function initChildOptions() {
        // For the first attendee (index 0)
        addChildOptionsListeners(0);
    }
    
    // Function to add child option listeners for a specific attendee
    function addChildOptionsListeners(index) {
        // Show/hide child options when isChild select changes
        $('#isChild_' + index).change(function() {
            toggleChildOptions(index);
        });
        
        // Show/hide highchair option when child age changes
        $('#childAge_' + index).change(function() {
            checkHighchairNeeded(index);
        });
    }
    
    // Function to toggle child options based on isChild select
    function toggleChildOptions(index) {
        var isChild = $('#isChild_' + index).val();
        var childOptions = $('#childAgeOptions_' + index);
        var highchairOptions = $('#highchairOptions_' + index);
        
        if (isChild === 'yes') {
            childOptions.slideDown();
            // Reset child age when toggling
            $('#childAge_' + index).val('');
            // Hide highchair options until age is selected
            highchairOptions.hide();
        } else {
            childOptions.slideUp();
            highchairOptions.slideUp();
        }
    }
    
    // Function to check if highchair is needed based on child age
    function checkHighchairNeeded(index) {
        var childAge = $('#childAge_' + index).val();
        var highchairOptions = $('#highchairOptions_' + index);
        
        // Show highchair option only for children under 4 years
        if (childAge === 'under1' || childAge === '1' || childAge === '2' || childAge === '3') {
            highchairOptions.slideDown();
        } else {
            highchairOptions.slideUp();
        }
    }
});
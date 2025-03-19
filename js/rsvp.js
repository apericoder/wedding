// RSVP form functionality
$(document).ready(function() {
    // Add and remove attendee functionality
    var addBtn = $('#addAttendeeBtn');
    var removeBtn = $('#removeAttendeeBtn');
    var container = $('#attendeesContainer');
    
    // Initialize event listeners for child options
    initChildOptionListeners();
    
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
        newAttendee.find('.child-age-options, .highchair-options').hide();
        
        // Append the new attendee form
        container.append(newAttendee);
        
        // Add event listeners to the new elements
        attachChildListeners(newIndex);
        
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
    
    // Initialize AJAX form submission
    $('.ajaxForm').submit(function(e) {
        e.preventDefault();
        var form = $(this);
        
        // Show loading state
        $('#submitButton').prop('disabled', true).text('Submitting...');
        
        $.ajax({
            url: form.attr('action'),
            method: form.attr('method'),
            data: form.serialize(),
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
    
    // Functions for child options
    function initChildOptionListeners() {
        // Attach event listeners to all isChild selects
        attachChildListeners(0);
    }
    
    function attachChildListeners(index) {
        // Child selection change handler
        $('#isChild_' + index).change(function() {
            toggleChildOptions(index);
        });
        
        // Child age selection change handler
        $('#childAge_' + index).change(function() {
            checkHighchairNeeded(index);
        });
    }
    
    function toggleChildOptions(index) {
        var isChild = $('#isChild_' + index).val();
        var childAgeOptions = $('#childAgeOptions_' + index);
        var highchairOptions = $('#highchairOptions_' + index);
        
        if (isChild === 'yes') {
            childAgeOptions.slideDown();
            // Reset age when switching from adult to child
            $('#childAge_' + index).val('');
            // Hide highchair option until an age is selected
            highchairOptions.hide();
        } else {
            childAgeOptions.slideUp();
            highchairOptions.slideUp();
        }
    }
    
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
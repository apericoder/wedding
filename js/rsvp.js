/**
 * RSVP Form Handler
 * Gestisce la logica del form RSVP, inclusa la formattazione dei dati dei partecipanti
 */
document.addEventListener('DOMContentLoaded', function() {
    // Verifica che jQuery sia disponibile
    if (typeof jQuery === 'undefined') {
        console.error('RSVP form requires jQuery. Make sure it is loaded before RSVP scripts.');
        return;
    }
    
    jQuery(function($) {
        // Contatore per tracciare il numero di partecipanti
        var attendeeCount = 1;
        
        // Toggle per le opzioni bambino
        $(document).on('change', 'select[name$="[isChild]"]', function() {
            var childOptions = $(this).closest('.attendee-form').find('.child-options');
            if ($(this).val() === 'yes') {
                childOptions.slideDown();
            } else {
                childOptions.slideUp();
            }
        });
        
        // Aggiunta di un nuovo partecipante
        $("#addAttendeeBtn").click(function() {
            console.log("Add attendee button clicked");
            attendeeCount++;
            
            // Clone del primo form partecipante
            var newAttendee = $('.attendee-form').first().clone();
            
            // Aggiorna il titolo (supporta sia inglese che italiano)
            var titleText = 'ATTENDEE #' + attendeeCount;
            if (newAttendee.find('.attendee-title').text().indexOf('PARTECIPANTE') !== -1) {
                titleText = 'PARTECIPANTE #' + attendeeCount;
            }
            newAttendee.find('.attendee-title').text(titleText);
            
            // Aggiorna gli attributi name degli input con il nuovo indice
            newAttendee.find('input, select, textarea').each(function() {
                var name = $(this).attr('name');
                if (name) {
                    $(this).attr('name', name.replace('[0]', '[' + (attendeeCount-1) + ']'));
                    // Reset dei valori
                    if ($(this).attr('type') === 'text' || $(this).is('textarea')) {
                        $(this).val('');
                    } else if ($(this).attr('type') === 'checkbox') {
                        $(this).prop('checked', false);
                    } else if ($(this).is('select')) {
                        $(this).prop('selectedIndex', 0);
                    }
                }
            });
            
            // Nasconde le opzioni per bambini
            newAttendee.find('.child-options').hide();
            
            // Aggiungi il nuovo form dopo l'ultimo
            $('.attendee-form').last().after(newAttendee);
            
            // Mostra il pulsante per rimuovere
            if (attendeeCount > 1) {
                $('#removeAttendeeBtn').show();
            }
        });
        
        // Rimozione dell'ultimo partecipante
        $("#removeAttendeeBtn").click(function() {
            console.log("Remove attendee button clicked");
            if (attendeeCount > 1) {
                $('.attendee-form').last().remove();
                attendeeCount--;
                
                // Nascondi il pulsante di rimozione se c'è solo un partecipante
                if (attendeeCount === 1) {
                    $('#removeAttendeeBtn').hide();
                }
            }
        });
        
        // Gestione dell'invio del form
        $(".ajaxForm").submit(function(e) {
            e.preventDefault();
            console.log("Form submission initiated");
            
            // Verifica reCAPTCHA (se configurato)
            if (typeof grecaptcha !== 'undefined' && grecaptcha.getResponse) {
                var recaptchaResponse = grecaptcha.getResponse();
                if(recaptchaResponse.length === 0) {
                    // Messaggi multilingua
                    var isItalian = $('html').attr('lang') === 'it' || 
                                  $('button[type="submit"]').text().indexOf('Invia') !== -1;
                    var recaptchaMsg = isItalian ? 
                                      'Per favore, verifica di non essere un robot.' : 
                                      'Please verify that you are not a robot.';
                    alert(recaptchaMsg);
                    return false;
                }
            }
            
            // Disabilita il pulsante per prevenire invii multipli
            var submitButton = $("#submitButton");
            var originalButtonText = submitButton.text();
            submitButton.prop('disabled', true).text(
                submitButton.text().indexOf('Invia') !== -1 ? 'Invio in corso...' : 'Submitting...'
            );
            
            // Preparazione dati per l'invio
            var formData = new FormData(this);
            
            // Formatta correttamente i dati degli attendees
            var attendeesData = [];
            $(".attendee-form").each(function(index) {
                var attendee = {
                    firstName: $(this).find('input[name^="attendees"][name$="[firstName]"]').val(),
                    lastName: $(this).find('input[name^="attendees"][name$="[lastName]"]').val(),
                    menu: $(this).find('select[name^="attendees"][name$="[menu]"]').val(),
                    isChild: $(this).find('select[name^="attendees"][name$="[isChild]"]').val()
                };
                
                // Raccogli le restrizioni alimentari selezionate
                var intolerances = [];
                $(this).find('input[type="checkbox"][name^="attendees"][name$="[intolerances][]"]:checked').each(function() {
                    intolerances.push($(this).val());
                });
                attendee.intolerances = intolerances.join(', ');
                
                // Aggiunge l'opzione highchair se è un bambino
                if (attendee.isChild === 'yes') {
                    attendee.highchair = $(this).find('select[name^="attendees"][name$="[highchair]"]').val();
                }
                
                // Aggiungi l'attendee formattato all'array
                attendeesData.push(attendee);
            });
            
            // Determina se siamo nella versione italiana o inglese del sito
            var isItalian = $('html').attr('lang') === 'it' || 
                            submitButton.text().indexOf('Invia') !== -1 || 
                            $('h5.attendee-title').first().text().indexOf('PARTECIPANTE') !== -1;
            
            // Aggiungi gli attendees formattati come stringa JSON
            for (var i = 0; i < 10; i++) {
                formData.delete('attendees[' + i + '][firstName]');
                formData.delete('attendees[' + i + '][lastName]');
                formData.delete('attendees[' + i + '][menu]');
                formData.delete('attendees[' + i + '][isChild]');
                formData.delete('attendees[' + i + '][intolerances][]');
                formData.delete('attendees[' + i + '][highchair]');
            }
            formData.append('attendees_formatted', JSON.stringify(attendeesData));
            
            // Aggiungi anche un formato leggibile per l'email
            var readableAttendees = '';
            attendeesData.forEach(function(attendee, index) {
                var titlePrefix = isItalian ? "Partecipante #" : "Attendee #";
                var nameLabel = isItalian ? "- Nome: " : "- Name: ";
                var menuLabel = isItalian ? "- Menu: " : "- Menu: ";
                var isChildLabel = isItalian ? "- Bambino: " : "- Is Child: ";
                var restrictionsLabel = isItalian ? "- Restrizioni alimentari: " : "- Dietary Restrictions: ";
                var highchairLabel = isItalian ? "- Seggiolone: " : "- Highchair: ";
                
                readableAttendees += titlePrefix + (index + 1) + ":\n";
                readableAttendees += nameLabel + attendee.firstName + " " + attendee.lastName + "\n";
                readableAttendees += menuLabel + attendee.menu + "\n";
                readableAttendees += isChildLabel + (attendee.isChild === 'yes' ? 
                                                    (isItalian ? 'Sì' : 'Yes') : 
                                                    (isItalian ? 'No' : 'No')) + "\n";
                if (attendee.intolerances && attendee.intolerances.length > 0) {
                    readableAttendees += restrictionsLabel + attendee.intolerances + "\n";
                }
                if (attendee.isChild === 'yes' && attendee.highchair) {
                    readableAttendees += highchairLabel + (attendee.highchair === 'yes' ? 
                                                         (isItalian ? 'Sì' : 'Yes') : 
                                                         (isItalian ? 'No' : 'No')) + "\n";
                }
                readableAttendees += "\n";
            });
            formData.append('attendees_readable', readableAttendees);
            
            // Aggiungi reCAPTCHA response se presente
            if (typeof grecaptcha !== 'undefined' && grecaptcha.getResponse) {
                formData.append('g-recaptcha-response', grecaptcha.getResponse());
            }
            
            // Converti FormData in oggetto per jQuery AJAX
            var formObject = {};
            formData.forEach(function(value, key){
                formObject[key] = value;
            });
            
            var href = $(this).attr("action");
            
            $.ajax({
                type: "POST",
                dataType: "json",
                url: href,
                data: formObject,
                success: function(response) {
                    if(response.status == "success") {
                        var successMsg = isItalian ? 
                                       'Grazie! Il tuo RSVP è stato registrato.' : 
                                       'Thank you! Your RSVP has been recorded.';
                        alert(successMsg);
                        
                        // Reset del form
                        $("#rsvpForm")[0].reset();
                        // Mantieni solo il primo attendee
                        $('.attendee-form:not(:first)').remove();
                        attendeeCount = 1;
                        $('#removeAttendeeBtn').hide();
                        // Reset reCAPTCHA se presente
                        if (typeof grecaptcha !== 'undefined' && grecaptcha.reset) {
                            grecaptcha.reset();
                        }
                        // Riabilita il pulsante
                        submitButton.prop('disabled', false).text(originalButtonText);
                    } else {
                        var errorMsg = isItalian ? 
                                     "Si è verificato un errore: " + (response.message || "Errore sconosciuto") : 
                                     "An error occurred: " + (response.message || "Unknown error");
                        alert(errorMsg);
                        submitButton.prop('disabled', false).text(originalButtonText);
                    }
                },
                error: function(xhr, status, error) {
                    console.error("AJAX error:", status, error);
                    var ajaxErrorMsg = isItalian ? 
                                     "Si è verificato un errore durante l'invio del modulo. Riprova o contattaci direttamente." : 
                                     "There was an error submitting your form. Please try again or contact us directly.";
                    alert(ajaxErrorMsg);
                    submitButton.prop('disabled', false).text(originalButtonText);
                }
            });
        });
    });
});
/**
 * Wedding Countdown
 * Script per il conto alla rovescia della data del matrimonio
 */
document.addEventListener('DOMContentLoaded', function() {
    // Set the date we're counting down to (July 27, 2025)
    var countDownDate = new Date("Jul 27, 2025 16:30:00").getTime();
    
    // Funzione per aggiornare il countdown
    function updateCountdown() {
        // Get today's date and time
        var now = new Date().getTime();
        
        // Find the distance between now and the count down date
        var distance = countDownDate - now;
        
        // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Elementi del DOM per il countdown - controlliamo ogni volta perché potrebbero non essere ancora caricati
        var daysElement = document.getElementById("days");
        var hoursElement = document.getElementById("hours");
        var minutesElement = document.getElementById("minutes");
        var secondsElement = document.getElementById("seconds");
        
        // Display the result in the elements if they exist
        if (daysElement) daysElement.innerHTML = days;
        if (hoursElement) hoursElement.innerHTML = hours;
        if (minutesElement) minutesElement.innerHTML = minutes;
        if (secondsElement) secondsElement.innerHTML = seconds;
        
        // If the count down is finished
        if (distance < 0) {
            clearInterval(countdownInterval);
            
            // Imposta tutti i valori a zero invece di cambiare l'intero HTML
            if (daysElement) daysElement.innerHTML = "0";
            if (hoursElement) hoursElement.innerHTML = "0";
            if (minutesElement) minutesElement.innerHTML = "0";
            if (secondsElement) secondsElement.innerHTML = "0";
        }
    }
    
    // Esegui immediatamente una volta per evitare il delay iniziale
    updateCountdown();
    
    // Update the count down every 1 second
    var countdownInterval = setInterval(updateCountdown, 1000);
});
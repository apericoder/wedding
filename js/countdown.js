/**
 * Wedding Countdown
 * Script per il conto alla rovescia della data del matrimonio
 */
document.addEventListener('DOMContentLoaded', function() {
    // Set the date we're counting down to (July 27, 2025)
    var countDownDate = new Date("Jul 27, 2025 00:00:00").getTime();
    
    // Elementi del DOM per il countdown
    var daysElement = document.getElementById("days");
    var hoursElement = document.getElementById("hours");
    var minutesElement = document.getElementById("minutes");
    var secondsElement = document.getElementById("seconds");
    var countdownElement = document.getElementById("countdown");
    
    // Verifica che gli elementi esistano
    if (!daysElement || !hoursElement || !minutesElement || !secondsElement || !countdownElement) {
        console.error("Countdown elements not found in the DOM");
        return;
    }
    
    // Determina la lingua utilizzata per il messaggio finale
    var isItalian = document.documentElement.lang === 'it' || 
                   document.querySelector('.countdown-label:first-child').textContent === 'Giorni';
    
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
        
        // Display the result in the elements
        daysElement.innerHTML = days;
        hoursElement.innerHTML = hours;
        minutesElement.innerHTML = minutes;
        secondsElement.innerHTML = seconds;
        
        // If the count down is finished, write some text
        if (distance < 0) {
            clearInterval(countdownInterval);
            countdownElement.innerHTML = isItalian ? "Oggi è il grande giorno!" : "Today is the day!";
        }
    }
    
    // Esegui immediatamente una volta per evitare il delay iniziale
    updateCountdown();
    
    // Update the count down every 1 second
    var countdownInterval = setInterval(updateCountdown, 1000);
});
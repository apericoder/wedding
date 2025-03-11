// Funzione per ottenere il linguaggio corrente dalla URL
function getCurrentLanguage() {
    var path = window.location.pathname;
    if (path.includes('/it/')) {
        return 'it';
    } else if (path.includes('/ru/')) {
        return 'ru';
    } else {
        return 'en';
    }
}

// Labels per le diverse lingue
const labels = {
    en: {
        days: "Days",
        hours: "Hours",
        minutes: "Minutes",
        seconds: "Seconds"
    },
    it: {
        days: "Giorni",
        hours: "Ore",
        minutes: "Minuti",
        seconds: "Secondi"
    },
    ru: {
        days: "Дней",
        hours: "Часов",
        minutes: "Минут",
        seconds: "Секунд"
    }
};

// Set the date we're counting down to (July 27, 2025)
var countDownDate = new Date("Jul 27, 2025 16:30:00").getTime();

// Update the count down every 1 second
var x = setInterval(function() {
    // Get current language
    var currentLang = getCurrentLanguage();
    var currentLabels = labels[currentLang];

    // Get today's date and time
    var now = new Date().getTime();
    
    // Find the distance between now and the count down date
    var distance = countDownDate - now;
    
    // Time calculations for days, hours, minutes and seconds
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    // Output the result
    document.getElementById("days").innerHTML = days;
    document.getElementById("hours").innerHTML = hours;
    document.getElementById("minutes").innerHTML = minutes;
    document.getElementById("seconds").innerHTML = seconds;
    
    // Update labels
    var labelsElements = document.getElementsByClassName("countdown-label");
    if (labelsElements.length >= 4) {
        labelsElements[0].innerHTML = currentLabels.days;
        labelsElements[1].innerHTML = currentLabels.hours;
        labelsElements[2].innerHTML = currentLabels.minutes;
        labelsElements[3].innerHTML = currentLabels.seconds;
    }
    
    // If the count down is over, write some text 
    if (distance < 0) {
        clearInterval(x);
        document.getElementById("countdown").innerHTML = "THE BIG DAY IS HERE!";
    }
}, 1000);
// Initialize the Profile Card
function initProfileCard() {
    const timeElement = document.getElementById('current-time');

    // Function to update time in milliseconds
    function updateTime() {
        if (timeElement) {
            timeElement.textContent = Date.now();
        }
    }

    // Set initial time
    updateTime();

    // Update time every 10ms for smooth precision (though 500-1000ms was suggested, 
    // millisecond display usually looks better with higher frequency)
    // We'll stick to a reasonable interval as per guidance.
    setInterval(updateTime, 10);

    console.log("Profile Card initialized. Time updating...");
}

// Start the application
document.addEventListener('DOMContentLoaded', initProfileCard);

document.addEventListener("DOMContentLoaded", () => {
    // Get form and device elements
    const signIn = document.getElementById("btnSignUp");
    const registerForm = document.getElementById("registerForm");
    const updateForm = document.getElementById("updateForm");
    const deviceForm = document.getElementById("deviceForm");
    const deviceList = document.getElementById("deviceList");
    
    
    // Ensure the element exists before adding event listeners
    if (signIn) {
        signIn.addEventListener("submit", (event) => {
            event.preventDefault();
            localStorage.setItem("isSignedIn", true);        // Use flag to determine when Account containers to display
            window.open("monitor-readings.html", '_self');  // Open Monitor Readings tab after pressing Sign-In
            alert("Welcome!");
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", (event) => {
            event.preventDefault();
            alert("Account created successfully!");
        });
    }

    if (updateForm) {
        updateForm.addEventListener("submit", (event) => {
            event.preventDefault();
            alert("Account updated successfully!");
        });
    }

    if (deviceForm) {
        deviceForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const deviceName = document.getElementById("device").value;
            if (deviceName) {
                const listItem = document.createElement("li");
                listItem.textContent = deviceName;
                deviceList.appendChild(listItem);
                document.getElementById("device").value = ''; // Clear input field
            }
        });
    }

});

// Handle Dropdown menu open and close
function toggDropDown() {
    document.getElementById("dropdown-contents").classList.toggle("show");
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')){
        var dropdowns = document.querySelectorAll('.dropdown-content');
        dropdowns.forEach(dropdown => {
            if (dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
            }
        });
    }
};
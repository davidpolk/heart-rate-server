// public/javasciprts/account.js
$(function (){
    $('#btnLogOut').click(logout);

    $.ajax({
        url: '/customers/status',
        method: 'GET',
        headers: { 'x-auth' : window.localStorage.getItem("token") },
        dataType: 'json'
    })
    .done(function (data, textStatus, jqXHR) {
        $('#rxData').html(JSON.stringify(data, null, 2));
        /////////////////////////////////
        const devices = data[0].deviceName;
                const deviceList = $("#deviceItems");
                deviceList.empty(); // Clear the list before adding items
                
                if (devices.length > 0) {
                    devices.forEach((device) => {
                        const listItem = `
                            <li>
                                <span>${device}</span>
                                <button class="delete-btn" data-device-name="${device}">Delete</button>
                            </li>`;
                        deviceList.append(listItem);
                    });
                
                    // Attach click event listener to delete buttons
                    $(".delete-btn").click(function () {
                        const deviceName = $(this).data("device-name");
                
                        // Call delete function with the device name
                        deleteDevice(deviceName);
                    });
                } else {
                    deviceList.append("<li>No devices found</li>");
                } 
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        window.location.replace("display.html");
    });
});

//add new device-----------------------------------------------------------
$(function () {
    // Handle the add device button click
    $("#btnAddDevice").click(function () {
        const deviceName = $("#deviceName").val().trim();

        if (!deviceName) {
            $("#addDeviceMessage").text("Device name is required");
            return;
        }

        // Send the device name to the server
        $.ajax({
            url: '/customers/add-devices',
            method: 'POST',
            headers: { 'x-auth': window.localStorage.getItem("token") },
            contentType: 'application/json',
            data: JSON.stringify({ deviceName }),
        })
        .done(function (data) {
            if (data.success) {
                $("#addDeviceMessage").text("Device added successfully");
                $("#deviceName").val(""); // Clear the input
                // Optionally refresh the device list
                listDevices();
            } else {
                $("#addDeviceMessage").text("Error: " + data.message);
            }
        })
        .fail(function () {
            $("#addDeviceMessage").text("Failed to add device. Please try again.");
        });
    });
});

//delete device---------------------------------------------------------------
// Function to delete device
// Function to delete device
function deleteDevice(deviceName) {
    $.ajax({
        url: '/customers/delete-device',
        method: 'POST',
        headers: { 'x-auth': window.localStorage.getItem("token") },
        contentType: 'application/json',
        data: JSON.stringify({ deviceName }), // Sending the device name to delete
    })
    .done(function (data) {
        if (data.success) {
            // Device deleted successfully, update the list of devices
            $("#addDeviceMessage").text("Device deleted successfully");
            listDevices(); // Refresh the device list after deletion
        } else {
            $("#addDeviceMessage").text("Error: " + data.message);
        }
    })
    .fail(function () {
        $("#addDeviceMessage").text("Failed to delete device. Please try again.");
    });
}

// Function to refresh the device list
function listDevices() {
    $.ajax({
        url: '/customers/status',
        method: 'GET',
        headers: { 'x-auth': window.localStorage.getItem("token") },
        dataType: 'json',
    })
    .done(function (data) {
        const devices = data[0].deviceName;
        const deviceList = $("#deviceItems");
        deviceList.empty(); // Clear the list before adding items

        if (devices.length > 0) {
            devices.forEach((device) => {
                const listItem = `
                    <li>
                        <span>${device}</span>
                        <button class="delete-btn" data-device-name="${device}">Delete</button>
                    </li>`;
                deviceList.append(listItem);
            });

            // Attach click event listener to delete buttons
            $(".delete-btn").click(function () {
                const deviceName = $(this).data("device-name");
                // Call delete function with the device name
                deleteDevice(deviceName);
            });
        } else {
            deviceList.append("<li>No devices found</li>");
        }
    });
}



function logout() {
    localStorage.removeItem("token");
    window.location.replace("index.html");
}

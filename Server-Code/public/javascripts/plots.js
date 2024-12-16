//////////              DATA                    //////////

/* Data arrays to be filled with User's data */
/* To be replaced with mongodb */
localStorage.setItem("times", JSON.stringify(["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "01:00"]));
localStorage.setItem("heartRate_dataset1", JSON.stringify([15, 72, 110, 91, 100, 62, 75]));
localStorage.setItem("bloodOxygen_dataset1", JSON.stringify([11, 94, 90, 100, 99, 98, 95]));

localStorage.setItem("heartRate_dataset2", JSON.stringify([25, 72, 60, 91, 60, 10, 75]));
localStorage.setItem("bloodOxygen_dataset2", JSON.stringify([21, 94, 90, 100, 99, 98, 95]));

localStorage.setItem("heartRate_dataset3", JSON.stringify([35, 72, 200, 91, 100, 62, 75]));
localStorage.setItem("bloodOxygen_dataset3", JSON.stringify([31, 94, 90, 100, 99, 98, 95]));

localStorage.setItem("heartRate_dataset4", JSON.stringify([45, 72, 110, 91, 100, 62, 75]));
localStorage.setItem("bloodOxygen_dataset4", JSON.stringify([41, 94, 90, 100, 99, 98, 95]));

localStorage.setItem("heartRate_dataset5", JSON.stringify([55, 72, 110, 91, 100, 62, 75]));
localStorage.setItem("bloodOxygen_dataset5", JSON.stringify([51, 94, 90, 100, 99, 98, 95]));

localStorage.setItem("heartRate_dataset6", JSON.stringify([65, 72, 110, 91, 100, 62, 75]));
localStorage.setItem("bloodOxygen_dataset6", JSON.stringify([61, 94, 90, 100, 99, 98, 95]));

localStorage.setItem("heartRate_dataset7", JSON.stringify([75, 72, 110, 91, 100, 62, 75]));
localStorage.setItem("bloodOxygen_dataset7", JSON.stringify([71, 94, 90, 100, 99, 98, 95]));

var times = JSON.parse(localStorage.getItem("times"));
var heartRate_dataset1 = JSON.parse(localStorage.getItem("heartRate_dataset1"));
var bloodOxygen_dataset1 = JSON.parse(localStorage.getItem("bloodOxygen_dataset1"));

var heartRate_dataset2 = JSON.parse(localStorage.getItem("heartRate_dataset2"));
var bloodOxygen_dataset2 = JSON.parse(localStorage.getItem("bloodOxygen_dataset2"));

var heartRate_dataset3 = JSON.parse(localStorage.getItem("heartRate_dataset3"));
var bloodOxygen_dataset3 = JSON.parse(localStorage.getItem("bloodOxygen_dataset3"));

var heartRate_dataset4 = JSON.parse(localStorage.getItem("heartRate_dataset4"));
var bloodOxygen_dataset4 = JSON.parse(localStorage.getItem("bloodOxygen_dataset4"));

var heartRate_dataset5 = JSON.parse(localStorage.getItem("heartRate_dataset5"));
var bloodOxygen_dataset5 = JSON.parse(localStorage.getItem("bloodOxygen_dataset5"));

var heartRate_dataset6 = JSON.parse(localStorage.getItem("heartRate_dataset6"));
var bloodOxygen_dataset6 = JSON.parse(localStorage.getItem("bloodOxygen_dataset6"));

var heartRate_dataset7 = JSON.parse(localStorage.getItem("heartRate_dataset7"));
var bloodOxygen_dataset7 = JSON.parse(localStorage.getItem("bloodOxygen_dataset7"));

var heartRate_dataset_week = [heartRate_dataset1, heartRate_dataset2, heartRate_dataset3, heartRate_dataset4,
                             heartRate_dataset5, heartRate_dataset6, heartRate_dataset7]


/*  ^^ Everything above this is completely unnecssary ^^  Only use if data is being retreived from MongoDB in another .js file */


/* Get Selected default dropdown data */ 
var heartRate_dataset_day = JSON.parse(localStorage.getItem("heartRate_dataset1"));
var bloodOxygen_dataset_day = JSON.parse(localStorage.getItem("bloodOxygen_dataset1"));






//////////              CREATE PLOTS                //////////

/* Create arrays used for plotting shapes around Max and Min values */
const [heartRate_Max, heartRate_Min] = getMinMaxDatasets(heartRate_dataset_day);
const [bloodOxygen_Max, bloodOxygen_Min] = getMinMaxDatasets(bloodOxygen_dataset_day);

/* Format Data that is to be plotted */
const heartRate_data = formatChartData(heartRate_dataset_day, "bpm")
const bloodOxygen_data = formatChartData(bloodOxygen_dataset_day, "%")

/* Create Heart Rate Plot (Chart) */
const heartRate_plot = new Chart('heart-rate-plot', {
    type: 'line',
    data:  heartRate_data,
    options: {

        // allow plot to grow and shrink with along window 
        maintainAspectRatio: false,
        aspectRatio: .85,

        plugins: {
            title:{     // Add Plot Title 
                display:true,
                text: 'Heart Rate',
                font: { size: 20 }
            },
            legend: {     // Add Max and Min values as legends 
                labels: {
                    filter: (legendItem, chartData) => (legendItem.text !== 'do not show'),
                    usePointStyle: true,
                }
            }
        },
        
        // Set X and Y axis labels and bounds
        scales: {
            x:{
                title: {
                    text: "Time of Day",
                    display: true,
                }
            },
            y:{
                title: {
                    text: "BPM",
                    display: true,  
                },
            }
        }
    }
})

/* Create Blood Oxygen Saturation Plot (Chart) */
const bloodOxygen_plot = new Chart('blood-oxygen-plot', {
    type: 'line',
    data:  bloodOxygen_data,
    options: {

        // allow plot to grow and shrink with along window 
        maintainAspectRatio: false,
        aspectRatio: 0.85,
        
        plugins: {
            title:{      // Add Plot Title 
                display:true,
                text: 'Blood Oxygen Saturation',
                font: { size: 20 }
            },
            legend: {   // Add Max and Min values as legends 
                labels: {
                    filter: (legendItem, chartData) => (legendItem.text !== 'do not show'),
                    usePointStyle: true,
                }
            }
        },
        
        // Set X and Y axis labels 
        scales: {
            x:{
                title: {
                    text: "Time of Day",
                    display: true,
                } 
            },
            y:{
                title: {
                    text: "Saturation (%)",
                    display: true,
                }, 
            }
        }
    }
})





//////////              FILL WEEKLY VALUES ("Weelky View: Heart Rate" section)                //////////
var sum_heartRates = 0;
var heartRates_count = 0;
var max_heartRates_daily = [];
var max_heartRates_week;
var min_heartRates_daily = [];
var min_heartRates_week;


for(let i=0; i < heartRate_dataset_week.length; i++){

    /* Get Max and min heart rate for every day of the week */
    max_heartRates_daily.push(Math.max(...heartRate_dataset_week[i]));
    min_heartRates_daily.push(Math.min(...heartRate_dataset_week[i]));

    for(let j=0; j < heartRate_dataset_week[i].length; j++){
        /* Get sum of all heart rates and total number of heart rate samples for the week */
        sum_heartRates = sum_heartRates + heartRate_dataset_week[i][j];
        heartRates_count++;
    }
}

/* Get highest heart rate of the week */
max_heartRates_week = Math.max(...max_heartRates_daily);
const max_listItem = document.createElement("p"); 
max_listItem.textContent = max_heartRates_week.toString() + " bpm";
document.getElementById('max-heart-rate').appendChild(max_listItem);

/* Get lowest heart rate of the week */
min_heartRates_week = Math.min(...min_heartRates_daily);
const min_listItem = document.createElement("p"); 
min_listItem.textContent = min_heartRates_week.toString() + " bpm";
document.getElementById('min-heart-rate').appendChild(min_listItem);

/* Get average heart rate of the week */
var avg_heartRate = (sum_heartRates / heartRates_count) || 0;
const avg_listItem = document.createElement("p"); 
avg_listItem.textContent = avg_heartRate.toFixed(1).toString() + " bpm";
document.getElementById('avg-heart-rate').appendChild(avg_listItem);





///////////         Event Listeners           //////////

document.addEventListener("DOMContentLoaded", () => {
    // Get form and device elements
    const monday = document.getElementById("monday");
    const tuesday = document.getElementById("tuesday");
    const wednesday = document.getElementById("wednesday");
    const thursday = document.getElementById("thursday");
    const friday = document.getElementById("friday");
    const saturday = document.getElementById("saturday");
    const sunday = document.getElementById("sunday");
    const dayHeader = document.getElementById("selected-day");
    

    // Ensure the element exists before adding event listeners
    if (monday) {
        monday.addEventListener("click", (event) => {
            event.preventDefault();
            dayHeader.innerText = "Monday";
            const heartRate_data = JSON.parse(localStorage.getItem("heartRate_dataset1"));
            const bloodOxygen_data = JSON.parse(localStorage.getItem("bloodOxygen_dataset1"));
            updateChartData(heartRate_data, bloodOxygen_data);
        });
    }
    if (tuesday) {
        tuesday.addEventListener("click", (event) => {
            event.preventDefault();
            dayHeader.innerText = "Tuesday";
            const heartRate_data = JSON.parse(localStorage.getItem("heartRate_dataset2"));
            const bloodOxygen_data = JSON.parse(localStorage.getItem("bloodOxygen_dataset2"));
            updateChartData(heartRate_data, bloodOxygen_data);
        });
    }
    if (wednesday) {
        wednesday.addEventListener("click", (event) => {
            event.preventDefault();
            dayHeader.innerText = "Wednesday";
            const heartRate_data = JSON.parse(localStorage.getItem("heartRate_dataset3"));
            const bloodOxygen_data = JSON.parse(localStorage.getItem("bloodOxygen_dataset3"));
            updateChartData(heartRate_data, bloodOxygen_data);
        });
    }
    if (thursday) {
        thursday.addEventListener("click", (event) => {
            event.preventDefault();
            dayHeader.innerText = "Thursday";
            const heartRate_data = JSON.parse(localStorage.getItem("heartRate_dataset4"));
            const bloodOxygen_data = JSON.parse(localStorage.getItem("bloodOxygen_dataset4"));
            updateChartData(heartRate_data, bloodOxygen_data);
        });
    }
    if (friday) {
        friday.addEventListener("click", (event) => {
            event.preventDefault();
            dayHeader.innerText = "Friday";
            const heartRate_data = JSON.parse(localStorage.getItem("heartRate_dataset5"));
            const bloodOxygen_data = JSON.parse(localStorage.getItem("bloodOxygen_dataset5"));
            updateChartData(heartRate_data, bloodOxygen_data);
        });
    }
    if (saturday) {
        saturday.addEventListener("click", (event) => {
            event.preventDefault();
            dayHeader.innerText = "Saturday";
            const heartRate_data = JSON.parse(localStorage.getItem("heartRate_dataset6"));
            const bloodOxygen_data = JSON.parse(localStorage.getItem("bloodOxygen_dataset6"));
            updateChartData(heartRate_data, bloodOxygen_data);
        });
    }
    if (sunday) {
        sunday.addEventListener("click", (event) => {
            event.preventDefault();
            dayHeader.innerText = "Sunday";
            const heartRate_data = JSON.parse(localStorage.getItem("heartRate_dataset7"));
            const bloodOxygen_data = JSON.parse(localStorage.getItem("bloodOxygen_dataset7"));
            updateChartData(heartRate_data, bloodOxygen_data);
        });
    }

});






/////////////    Function Declarations  ////////////////

function updateChartData(heartRateData, bloodOxygenData) {
    // Format Data
    const heartRate_dataObject = formatChartData(heartRateData, "bpm")
    const bloodOxygen_dataObject = formatChartData(bloodOxygenData, "%")

    // Overwrite chart's datasets for new ones
    heartRate_plot.data = heartRate_dataObject;
    bloodOxygen_plot.data = bloodOxygen_dataObject;

    // Adjust Y-Axis ranges
    heartRate_plot.options.scales.y.min = Math.min(...heartRateData) - 5
    heartRate_plot.options.scales.y.max = Math.max(...heartRateData) + 5
    bloodOxygen_plot.options.scales.y.min = Math.min(...bloodOxygenData) - 3
    bloodOxygen_plot.options.scales.y.max = Math.max(...bloodOxygenData) + 3
    
    // Update Charts
    heartRate_plot.update();
    bloodOxygen_plot.update();
}

function formatChartData(newData, unitString){
    const [max_dataset, min_dataset] = getMinMaxDatasets(newData);

    const dataObject = {
        labels: times,     // Fill x-axis values (Time of day)
        datasets: [
        {   // Add Heart Rate Line Plot
            label: 'do not show',
            data: newData,
            borderColor: 'rgb(135, 133, 115)',
            pointStyle: false
        },
        {   // Add Minimum Heart Rate Circle to plot
            label: 'Lowest: '.concat(Math.min(...newData).toString(), " " , unitString, "      "),
            data: min_dataset,
            type: 'bubble',
            radius: 10,
            pointStyle: 'rect',
            borderColor: 'rgb(200, 0, 0)',
            pointBackgroundColor: 'rgb(245, 220, 220)',
        },
        {   // Add Maximum Heart Rate Circle to plot
            label: 'Highest: '.concat(Math.max(...newData).toString(), " ", unitString),
            data: max_dataset,
            type: 'bubble',
            radius: 10,
            pointStyle: 'triangle',
            borderColor: 'rgb(100,50,180)',
            pointBackgroundColor: 'rgb(226, 219, 245)',
        }]
    };

    return dataObject;
}

function getMinMaxDatasets(data) {
    var max_dataset = []
    var min_dataset = []
    
    for(let i=0; i <= times.length; i++){
        if (data[i] == Math.max(...data)){
            max_dataset.push(Math.max(...data));
            min_dataset.push(null);
        }
        else if (data[i] == Math.min(...data)){
            max_dataset.push(null);
            min_dataset.push(Math.min(...data));
        }
        else{
            max_dataset.push(null);
            min_dataset.push(null);
        }
    }
    return [max_dataset, min_dataset]
}
let runCount = 0;


const capacity =
document.getElementById("capacity");

const orders =
document.getElementById("orders");

const speed =
document.getElementById("speed");

const threshold =
document.getElementById("threshold");

const capacityValue =
document.getElementById("capacityValue");

const ordersValue =
document.getElementById("ordersValue");

const speedValue =
document.getElementById("speedValue");

const thresholdValue =
document.getElementById("thresholdValue");

/* KPI */

const storageUtilization =
document.getElementById("storageUtilization");

const incomingOrdersValue =
document.getElementById("incomingOrdersValue");

const robotUtilization =
document.getElementById("robotUtilization");

const processingTime =
document.getElementById("processingTime");

const congestionIndex =
document.getElementById("congestionIndex");

const inventoryHealth =
document.getElementById("inventoryHealth");

/* Analytics */

const efficiency =
document.getElementById("efficiency");

const pendingOrders =
document.getElementById("pendingOrders");

const storageHealth =
document.getElementById("storageHealth");

/* Operations */

const agvStatus =
document.getElementById("agvStatus");

const rackAlert =
document.getElementById("rackAlert");

const inventoryAlert =
document.getElementById("inventoryAlert");

const riskStatus =
document.getElementById("riskStatus");

const warehouseState =
document.getElementById("warehouseState");

/* Recommendation */

const observation =
document.getElementById("observation");



const rackAValue =
document.getElementById("rackAValue");

const rackBValue =
document.getElementById("rackBValue");

const rackCValue =
document.getElementById("rackCValue");

const rackDValue =
document.getElementById("rackDValue");



const agvLive =
document.getElementById("agvLive");


const zone1 =
document.getElementById("zone1");

const zone2 =
document.getElementById("zone2");

const zone3 =
document.getElementById("zone3");

const zone4 =
document.getElementById("zone4");


const runBtn =
document.getElementById("runBtn");

const resetBtn =
document.getElementById("resetBtn");


const logTable =
document.getElementById("logTable");



const liveClock =
document.getElementById("liveClock");

function updateClock(){

if (!liveClock) return;

const now = new Date();

liveClock.textContent =
now.toLocaleTimeString();

}

if (liveClock) {

setInterval(updateClock,1000);

updateClock();

}


capacity.addEventListener("input",()=>{

capacityValue.textContent =
capacity.value;

});

orders.addEventListener("input",()=>{

ordersValue.textContent =
orders.value;

});

speed.addEventListener("input",()=>{

speedValue.textContent =
speed.value;

});

threshold.addEventListener("input",()=>{

thresholdValue.textContent =
threshold.value;

});


runBtn.addEventListener(
"click",
runSimulation
);

function runSimulation(){

const cap =
Number(capacity.value);

const ord =
Number(orders.value);

const spd =
Number(speed.value);

const th =
Number(threshold.value);

const utilization =
Math.min(
100,
Math.round(
(ord/cap)*100
)
);

const robotUse =
Math.min(
100,
Math.round(
ord/(spd*10)
)
);

const processTime =
(
ord/(spd*20)
).toFixed(1);

const efficiencyScore =
Math.max(
55,
Math.round(
100-(utilization*0.3)
)
);

const pending =
Math.max(
0,
ord-(spd*60)
);

storageUtilization.textContent =
utilization + "%";

incomingOrdersValue.textContent =
ord;

robotUtilization.textContent =
robotUse + "%";

processingTime.textContent =
processTime + " min";

efficiency.textContent =
efficiencyScore + "%";

pendingOrders.textContent =
pending;

const rackA =
utilization;

const rackB =
Math.round(
utilization * 0.90
);

const rackC =
Math.round(
utilization * 0.75
);

const rackD =
Math.round(
utilization * 0.60
);

rackAValue.textContent =
rackA + "%";

rackBValue.textContent =
rackB + "%";

rackCValue.textContent =
rackC + "%";

rackDValue.textContent =
rackD + "%";

if(ord < th){

inventoryHealth.textContent =
"Low Stock";

inventoryAlert.textContent =
"Reorder";

storageHealth.textContent =
"Critical";

}
else{

inventoryHealth.textContent =
"Healthy";

inventoryAlert.textContent =
"Normal";

storageHealth.textContent =
"Optimal";

}

if(utilization < 60){

congestionIndex.textContent =
"Low";

rackAlert.textContent =
"Normal";

riskStatus.textContent =
"Low";

warehouseState.textContent =
"Efficient";

updateHeatmap("low");

}
else if(utilization < 85){

congestionIndex.textContent =
"Medium";

rackAlert.textContent =
"Monitor";

riskStatus.textContent =
"Medium";

warehouseState.textContent =
"Busy";

updateHeatmap("medium");

}
else{

congestionIndex.textContent =
"High";

rackAlert.textContent =
"Capacity Risk";

riskStatus.textContent =
"High";

warehouseState.textContent =
"Congested";

updateHeatmap("high");

}

if(robotUse < 40){

agvStatus.textContent =
"Idle";

agvLive.textContent =
"IDLE";

}
else if(robotUse < 80){

agvStatus.textContent =
"Active";

agvLive.textContent =
"ACTIVE";

}
else{

agvStatus.textContent =
"Overloaded";

agvLive.textContent =
"OVERLOADED";

}

generateRecommendation(
utilization,
robotUse,
pending,
ord,
th
);

addLog(
cap,
ord,
utilization,
robotUse
);

}

function updateHeatmap(level){

if(level === "low"){

setHeatColor(
"#22c55e"
);

}
else if(level === "medium"){

setHeatColor(
"#f59e0b"
);

}
else{

setHeatColor(
"#ef4444"
);

}

}

function setHeatColor(color){

zone1.style.background =
color;

zone2.style.background =
color;

zone3.style.background =
color;

zone4.style.background =
color;

}
function generateRecommendation(
util,
robot,
pending,
orders,
threshold
){

let text = "";

if(util < 60){

text +=
"✓ Warehouse operating efficiently with low congestion. ";

}
else if(util < 85){

text +=
"✓ Storage utilization is increasing. Monitor warehouse capacity. ";

}
else{

text +=
"✓ High congestion detected. Consider increasing storage capacity. ";

}

if(robot > 80){

text +=
"✓ AGV utilization is very high. Increase AGV speed or deploy additional AGVs. ";

}

if(orders < threshold){

text +=
"✓ Inventory below threshold. Replenishment is recommended. ";

}

if(pending > 0){

text +=
"✓ Pending orders detected. Improve dispatch throughput. ";

}

if(
util < 60 &&
robot < 60 &&
pending === 0
){

text +=
"✓ Warehouse performance is optimal.";

}

observation.textContent =
text;

}



function addLog(
cap,
ord,
util,
robot
){

runCount++;

const row =
document.createElement("tr");

row.innerHTML = `
<td>#${runCount}</td>
<td>${cap}</td>
<td>${ord}</td>
<td>${util}%</td>
<td>${robot}%</td>
<td>${congestionIndex.textContent}</td>
`;

logTable.appendChild(row);

}



resetBtn.addEventListener(
"click",
resetSimulation
);

function resetSimulation(){

runCount = 0;

/* Sliders */

capacity.value = 500;
orders.value = 200;
speed.value = 5;
threshold.value = 100;

/* Slider Labels */

capacityValue.textContent = 500;
ordersValue.textContent = 200;
speedValue.textContent = 5;
thresholdValue.textContent = 100;

/* KPI */

storageUtilization.textContent =
"0%";

incomingOrdersValue.textContent =
"0";

robotUtilization.textContent =
"0%";

processingTime.textContent =
"0 min";

congestionIndex.textContent =
"Low";

inventoryHealth.textContent =
"Healthy";

/* Analytics */

efficiency.textContent =
"100%";

pendingOrders.textContent =
"0";

storageHealth.textContent =
"Optimal";



agvStatus.textContent =
"Idle";

rackAlert.textContent =
"Normal";

inventoryAlert.textContent =
"Healthy";

riskStatus.textContent =
"Low";

warehouseState.textContent =
"Ready";



rackAValue.textContent =
"0%";

rackBValue.textContent =
"0%";

rackCValue.textContent =
"0%";

rackDValue.textContent =
"0%";



agvLive.textContent =
"IDLE";


observation.textContent =
"Configure warehouse parameters and run the simulation to receive intelligent warehouse recommendations.";



setHeatColor("#22c55e");


logTable.innerHTML = "";

}

resetSimulation();
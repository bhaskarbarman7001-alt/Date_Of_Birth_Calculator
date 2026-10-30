
import * as THREE from
"https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

// =================================
// 1. THREE.JS 3D BACKGROUND
// =================================

const canvas = document.querySelector("#bg");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.z = 9;

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Floating 3D object
const geometry = new THREE.IcosahedronGeometry(2, 2);

const material = new THREE.MeshStandardMaterial({
    color: 0x00d9ff,
    wireframe: true,
    metalness: 0.8,
    roughness: 0.2
});

const sphere = new THREE.Mesh(geometry, material);
sphere.position.set(4, 0, -2);
scene.add(sphere);

// Lighting
const light = new THREE.PointLight(0x00d9ff, 100);
light.position.set(3, 3, 5);
scene.add(light);

scene.add(new THREE.AmbientLight(0xffffff, 1));

// Floating particles
const particleGeometry = new THREE.BufferGeometry();
const particleCount = 1500;

const positions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 25;
}

particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
);

const particleMaterial = new THREE.PointsMaterial({
    color: 0x00d9ff,
    size: 0.025
});

const particles = new THREE.Points(
    particleGeometry,
    particleMaterial
);

scene.add(particles);

// Animation
function animate() {
    requestAnimationFrame(animate);

    sphere.rotation.x += 0.002;
    sphere.rotation.y += 0.004;

    particles.rotation.y += 0.0005;

    renderer.render(scene, camera);
}

animate();

// Responsive 3D canvas
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// =================================
// 2. DATE OF BIRTH CALCULATOR
// =================================

const dobInput = document.getElementById("dob");
const calculateButton = document.getElementById("calculate");
const resetButton = document.getElementById("reset");

const today = new Date();

function localDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

dobInput.max = localDateString(today);

function makeDate(year, month, day) {
    return new Date(year, month, day);
}

// Add calendar months without overflowing month-end dates.
function addMonths(date, amount) {
    const total = date.getMonth() + amount;
    const year = date.getFullYear() + Math.floor(total / 12);
    const month = ((total % 12) + 12) % 12;

    const lastDay = new Date(year, month + 1, 0).getDate();

    return new Date(
        year,
        month,
        Math.min(date.getDate(), lastDay)
    );
}

function calculateAge() {
    const error = document.getElementById("error");
    const results = document.getElementById("results");

    error.textContent = "";
    results.style.display = "none";

    if (!dobInput.value) {
        error.textContent = "Please select your date of birth!";
        return;
    }

    const [year, month, day] = dobInput.value.split("-").map(Number);

    const birth = makeDate(year, month - 1, day);

    const now = new Date();

    const currentDay = makeDate(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    if (
        birth.getFullYear() !== year ||
        birth.getMonth() !== month - 1 ||
        birth.getDate() !== day
    ) {
        error.textContent = "Please select a valid date.";
        return;
    }

    if (birth > currentDay) {
        error.textContent = "Future dates are not allowed!";
        return;
    }

    // Calculate completed years and months.
    let years = now.getFullYear() - year;

    let anniversary = makeDate(year + years, month - 1, day);

    if (anniversary > currentDay) {
        years--;
        anniversary = makeDate(year + years, month - 1, day);
    }

    let months =
        (currentDay.getFullYear() - anniversary.getFullYear()) * 12 +
        currentDay.getMonth() - anniversary.getMonth();

    let monthDate = addMonths(anniversary, months);

    if (monthDate > currentDay) {
        months--;
        monthDate = addMonths(anniversary, months);
    }

    const days = Math.round(
        (currentDay - monthDate) / 86400000
    );

    // Display exact age.
    document.getElementById("years").textContent = years;
    document.getElementById("months").textContent = months;
    document.getElementById("days").textContent = days;

    document.getElementById("age").textContent =
        `${years} Years, ${months} Months, ${days} Days`;

    // Total age.
    const elapsed = now - birth;
    const totalDays = Math.floor(
        (currentDay - birth) / 86400000
    );

    document.getElementById("totalDays").textContent =
        totalDays.toLocaleString();

    document.getElementById("totalHours").textContent =
        Math.floor(elapsed / 3600000).toLocaleString();

    document.getElementById("totalMinutes").textContent =
        Math.floor(elapsed / 60000).toLocaleString();

    // Next birthday.
    let nextYear = now.getFullYear();

    let nextBirthday = makeDate(
        nextYear,
        month - 1,
        day
    );

    if (nextBirthday < currentDay) {
        nextYear++;
        nextBirthday = makeDate(
            nextYear,
            month - 1,
            day
        );
    }

    const remaining = Math.round(
        (nextBirthday - currentDay) / 86400000
    );

    document.getElementById("birthdayDate").textContent =
        nextBirthday.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });

    document.getElementById("countdown").textContent =
        remaining === 0
            ? "🎂 Happy Birthday!"
            : `${remaining} Days Left 🎉`;

    document.getElementById("weekday").textContent =
        nextBirthday.toLocaleDateString("en-IN", {
            weekday: "long"
        });

    results.style.display = "block";
}

calculateButton.addEventListener("click", calculateAge);

resetButton.addEventListener("click", () => {
    dobInput.value = "";
    document.getElementById("error").textContent = "";
    document.getElementById("results").style.display = "none";
});

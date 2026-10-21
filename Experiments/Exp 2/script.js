const $ = (id) => document.getElementById(id);
const read = (key, fallback) => {
    try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
        return fallback;
    }
};
const save = (key, value) =>
    localStorage.setItem(key, JSON.stringify(value));

const defaultRooms = [
    { id: 1, name: "Standard Room", price: 2000, quantity: 10,
      details: "Comfortable room with Wi-Fi and TV." },
    { id: 2, name: "Deluxe Room", price: 3500, quantity: 8,
      details: "Spacious room with city view." },
    { id: 3, name: "Suite Room", price: 6000, quantity: 5,
      details: "Luxury suite with separate living area." },
    { id: 4, name: "Family Room", price: 4500, quantity: 6,
      details: "Large room suitable for families." }
];

if (!localStorage.getItem("hotelRooms")) {
    save("hotelRooms", defaultRooms);
}

const rooms = () => read("hotelRooms", defaultRooms);
const users = () => read("hotelUsers", []);
const bookings = () => read("hotelBookings", []);
const currentUser = () => read("hotelCurrentUser", null);

function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;",
        '"': "&quot;", "'": "&#39;"
    })[char]);
}

function message(text) {
    alert(text);
}

function dateDays(from, to) {
    return Math.round(
        (new Date(to + "T00:00:00") -
         new Date(from + "T00:00:00")) / 86400000
    );
}

function available(roomId, start, end, excludeId = null) {
    if (!start || !end || dateDays(start, end) <= 0) return 0;

    const room = rooms().find(r => r.id === Number(roomId));
    if (!room) return 0;

    const occupied = bookings().filter(b =>
        b.roomId === Number(roomId) &&
        b.status === "Confirmed" &&
        b.id !== excludeId &&
        b.checkIn < end &&
        b.checkOut > start
    ).length;

    return Math.max(0, room.quantity - occupied);
}

function roomCards() {
    return rooms().map(r => `
        <div class="card">
            <h3>${esc(r.name)}</h3>
            <p>${esc(r.details)}</p>
            <p><b>Price:</b> ₹${r.price} per night</p>
            <p><b>Total rooms:</b> ${r.quantity}</p>
            <a class="btn" href="booking.html?room=${r.id}">Book Now</a>
        </div>
    `).join("");
}

function roomOptions(selected = "") {
    return rooms().map(r => `
        <option value="${r.id}" ${String(r.id) === String(selected) ? "selected" : ""}>
            ${esc(r.name)} — ₹${r.price}/night
        </option>
    `).join("");
}

function renderHome() {
    $("app").innerHTML = `
        <section class="hero">
            <h2>Find Your Perfect Stay</h2>
            <p>Comfort, convenience and memorable experiences.</p>
            <form id="searchForm">
                <label>Destination</label>
                <input name="destination" placeholder="Enter city or destination" required>
                <label>Check-in</label>
                <input type="date" name="checkIn" required>
                <label>Check-out</label>
                <input type="date" name="checkOut" required>
                <label>Guests</label>
                <input type="number" name="guests" min="1" max="10" value="1" required>
                <button>Search Rooms</button>
            </form>
            <p id="searchResult"></p>
        </section>
        <h2>Our Room Types</h2>
        <div class="grid">${roomCards()}</div>
        <p class="notice">Bookings on this demonstration website are stored in this browser.</p>
    `;

    $("searchForm").addEventListener("submit", e => {
        e.preventDefault();
        const f = e.target;
        const start = f.checkIn.value;
        const end = f.checkOut.value;

        if (dateDays(start, end) <= 0) {
            message("Check-out must be after check-in.");
            return;
        }

        const destination = f.destination.value.trim();
        if (!destination) return;

        location.href = "booking.html?destination=" +
            encodeURIComponent(destination) +
            "&checkIn=" + start +
            "&checkOut=" + end +
            "&guests=" + f.guests.value;
    });
}

function renderRooms() {
    $("app").innerHTML = `
        <h2>Explore Our Rooms</h2>
        <p>Choose a room that suits your needs and budget.</p>
        <div class="grid">${roomCards()}</div>
    `;
}

function renderRegister() {
    $("app").innerHTML = `
        <h2>Create an Account</h2>
        <form id="registerForm">
            <label>Full Name</label>
            <input name="name" required>
            <label>Email</label>
            <input name="email" type="email" required>
            <label>Phone</label>
            <input name="phone" type="tel" required>
            <label>Password</label>
            <input name="password" type="password" minlength="6" required>
            <button>Register</button>
        </form>
        <p style="text-align:center">Already registered?
            <a href="login.html">Login here</a>
        </p>
    `;

    $("registerForm").addEventListener("submit", e => {
        e.preventDefault();
        const f = e.target;
        const list = users();
        const email = f.email.value.trim().toLowerCase();

        if (list.some(u => u.email === email)) {
            message("This email is already registered.");
            return;
        }

        list.push({
            id: Date.now(),
            name: f.name.value.trim(),
            email,
            phone: f.phone.value.trim(),
            password: f.password.value
        });

        save("hotelUsers", list);
        message("Registration successful. Please log in.");
        location.href = "login.html";
    });
}

function renderLogin() {
    $("app").innerHTML = `
        <h2>User Login</h2>
        <form id="loginForm">
            <label>Email</label>
            <input type="email" name="email" required>
            <label>Password</label>
            <input type="password" name="password" required>
            <button>Login</button>
        </form>
        <p style="text-align:center">
            New user? <a href="register.html">Register</a>
        </p>
        <div class="panel">
            <h3>Admin Demo</h3>
            <p>Email: admin@stayease.com</p>
            <p>Password: admin123</p>
            <p>For demonstration only; do not use these credentials in production.</p>
        </div>
    `;

    $("loginForm").addEventListener("submit", e => {
        e.preventDefault();
        const f = e.target;
        const email = f.email.value.trim().toLowerCase();

        // Demo administrator credentials.
        if (email === "admin@stayease.com" &&
            f.password.value === "admin123") {
            save("hotelCurrentUser", {
                name: "Administrator",
                email,
                role: "admin"
            });
            location.href = "admin.html";
            return;
        }

        const user = users().find(u =>
            u.email === email && u.password === f.password.value
        );

        if (!user) {
            message("Invalid email or password.");
            return;
        }

        save("hotelCurrentUser", {
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: "user"
        });
        message("Login successful.");
        location.href = "dashboard.html";
    });
}

function renderBooking() {
    const params = new URLSearchParams(location.search);
    const selectedRoom = params.get("room") || "";
    const start = params.get("checkIn") || "";
    const end = params.get("checkOut") || "";
    const destination = params.get("destination") || "";
    const guests = params.get("guests") || "1";

    $("app").innerHTML = `
        <h2>Book Your Room</h2>
        <form id="bookingForm">
            <label>Destination</label>
            <input name="destination" value="${esc(destination)}" required>
            <label>Room Type</label>
            <select name="roomId" required>${roomOptions(selectedRoom)}</select>
            <label>Check-in Date</label>
            <input name="checkIn" type="date" value="${esc(start)}" required>
            <label>Check-out Date</label>
            <input name="checkOut" type="date" value="${esc(end)}" required>
            <label>Number of Guests</label>
            <input name="guests" type="number" min="1" max="10"
                value="${esc(guests)}" required>
            <label>Customer Name</label>
            <input name="customer" required>
            <label>Email</label>
            <input name="email" type="email" required>
            <button type="button" id="checkAvailability">Check Availability</button>
            <p id="availabilityResult"></p>
            <label>Payment Demo</label>
            <select name="payment" required>
                <option value="Demo payment">Demo payment (no real charge)</option>
            </select>
            <button type="submit">Confirm Booking</button>
        </form>
    `;

    const f = $("bookingForm");
    const availabilityText = $("availabilityResult");

    $("checkAvailability").addEventListener("click", () => {
        const count = available(
            f.roomId.value, f.checkIn.value, f.checkOut.value
        );

        if (dateDays(f.checkIn.value, f.checkOut.value) <= 0) {
            availabilityText.textContent =
                "Select a valid check-in and check-out date.";
        } else {
            availabilityText.textContent = count > 0
                ? count + " room(s) available."
                : "No rooms available for these dates.";
        }
    });

    f.addEventListener("submit", e => {
        e.preventDefault();

        const user = currentUser();
        if (!user || user.role !== "user") {
            message("Please register or log in before booking.");
            location.href = "login.html";
            return;
        }

        const count = available(
            f.roomId.value, f.checkIn.value, f.checkOut.value
        );

        if (dateDays(f.checkIn.value, f.checkOut.value) <= 0 ||
            f.checkIn.value < new Date().toLocaleDateString("en-CA") ||
            count < 1) {
            message("Invalid dates or no room availability.");
            return;
        }

        const room = rooms().find(r => r.id === Number(f.roomId.value));
        const nights = dateDays(f.checkIn.value, f.checkOut.value);
        const all = bookings();

        const booking = {
            id: Date.now(),
            email: user.email,
            customer: f.customer.value.trim(),
            destination: f.destination.value.trim(),
            roomId: room.id,
            roomName: room.name,
            checkIn: f.checkIn.value,
            checkOut: f.checkOut.value,
            guests: Number(f.guests.value),
            total: nights * room.price,
            status: "Confirmed",
            payment: "Demo only"
        };

        all.push(booking);
        save("hotelBookings", all);

        message("Booking confirmed! Reference: " + booking.id +
            ". Payment has NOT been collected.");
        location.href = "dashboard.html";
    });
}

function canChange(booking) {
    return dateDays(
        new Date().toLocaleDateString("en-CA"),
        booking.checkIn
    ) >= 3;
}

function renderDashboard() {
    const user = currentUser();

    if (!user || user.role !== "user") {
        $("app").innerHTML = `
            <h2>Please Log In</h2>
            <p>Log in to view your profile and booking history.</p>
            <a class="btn" href="login.html">Login</a>
        `;
        return;
    }

    const list = bookings().filter(b => b.email === user.email);

    $("app").innerHTML = `
        <h2>My Dashboard</h2>
        <div class="panel">
            <h3>My Profile</h3>
            <p>Name: ${esc(user.name)}</p>
            <p>Email: ${esc(user.email)}</p>
            <p>Phone: ${esc(user.phone || "")}</p>
            <button id="editProfile">Edit Profile</button>
            <button id="logout">Logout</button>
        </div>
        <h2 style="margin-top:25px">Booking History</h2>
        <div id="bookingList"></div>
    `;

    $("editProfile").onclick = () => {
        const name = prompt("Enter your name:", user.name);
        const phone = prompt("Enter your phone:", user.phone || "");
        if (!name || !name.trim()) return;

        const updated = { ...user, name: name.trim(), phone: phone || "" };
        save("hotelCurrentUser", updated);

        const list = users().map(u => u.email === user.email
            ? { ...u, name: updated.name, phone: updated.phone }
            : u);
        save("hotelUsers", list);
        renderDashboard();
    };

    $("logout").onclick = () => {
        localStorage.removeItem("hotelCurrentUser");
        location.href = "index.html";
    };

    $("bookingList").innerHTML = list.length ? list.map(b => `
        <div class="card" style="margin:15px 0">
            <h3>${esc(b.roomName)}</h3>
            <p>Booking ID: ${b.id}</p>
            <p>Destination: ${esc(b.destination)}</p>
            <p>Check-in: ${b.checkIn}</p>
            <p>Check-out: ${b.checkOut}</p>
            <p>Total: ₹${b.total}</p>
            <p>Status: ${esc(b.status)}</p>
            ${b.status === "Confirmed" && canChange(b) ? `
                <button data-edit="${b.id}">Change Dates</button>
                <button class="danger" data-cancel="${b.id}">Cancel Booking</button>
            ` : ""}
            ${b.status === "Confirmed" && !canChange(b)
                ? "<p>Changes and cancellations are closed within 3 days of arrival.</p>"
                : ""}
            <label>Rate your stay (demo)</label>
            <select data-rating="${b.id}">
                <option value="">Choose rating</option>
                <option>5 - Excellent</option>
                <option>4 - Very Good</option>
                <option>3 - Good</option>
                <option>2 - Fair</option>
                <option>1 - Poor</option>
            </select>
            <button data-review="${b.id}">Submit Rating</button>
        </div>
    `).join("") : "<p>No bookings found.</p>";

    $("bookingList").querySelectorAll("[data-cancel]").forEach(btn => {
        btn.onclick = () => {
            const all = bookings();
            const b = all.find(x => x.id === Number(btn.dataset.cancel));
            if (!b || !canChange(b)) {
                message("Cancellation is allowed only at least 3 days before arrival.");
                return;
            }
            if (confirm("Cancel this booking?")) {
                b.status = "Cancelled";
                save("hotelBookings", all);
                renderDashboard();
            }
        };
    });

    $("bookingList").querySelectorAll("[data-edit]").forEach(btn => {
        btn.onclick = () => {
            const all = bookings();
            const b = all.find(x => x.id === Number(btn.dataset.edit));
            if (!b || !canChange(b)) {
                message("Modification period has ended.");
                return;
            }

            const newStart = prompt("New check-in (YYYY-MM-DD):", b.checkIn);
            if (!newStart) return;
            const newEnd = prompt("New check-out (YYYY-MM-DD):", b.checkOut);
            if (!newEnd) return;

            if (dateDays(new Date().toLocaleDateString("en-CA"), newStart) < 3 ||
                dateDays(newStart, newEnd) <= 0 ||
                available(b.roomId, newStart, newEnd, b.id) < 1) {
                message("Invalid dates, less than 3 days before arrival, or room unavailable.");
                return;
            }

            const room = rooms().find(r => r.id === b.roomId);
            b.checkIn = newStart;
            b.checkOut = newEnd;
            b.total = dateDays(newStart, newEnd) * room.price;
            save("hotelBookings", all);
            renderDashboard();
        };
    });

    $("bookingList").querySelectorAll("[data-review]").forEach(btn => {
        btn.onclick = () => {
            const rating = document.querySelector(
                `[data-rating="${btn.dataset.review}"]`
            ).value;
            if (!rating) {
                message("Please select a rating.");
                return;
            }
            const reviews = read("hotelReviews", []);
            reviews.push({
                bookingId: Number(btn.dataset.review),
                email: user.email,
                rating
            });
            save("hotelReviews", reviews);
            message("Thank you for your feedback.");
        };
    });
}

function renderAdmin() {
    const user = currentUser();

    if (!user || user.role !== "admin") {
        $("app").innerHTML = `
            <h2>Administrator Login Required</h2>
            <p>Use the demo administrator account on the login page.</p>
            <a class="btn" href="login.html">Admin Login</a>
        `;
        return;
    }

    $("app").innerHTML = `
        <h2>Admin Dashboard</h2>
        <div class="panel">
            <h3>Update Room Details</h3>
            <form id="roomForm">
                <label>Room Type</label>
                <select name="roomId">${roomOptions()}</select>
                <label>Price per Night (₹)</label>
                <input name="price" type="number" min="1" required>
                <label>Room Quantity</label>
                <input name="quantity" type="number" min="0" required>
                <label>Room Description</label>
                <input name="details" required>
                <button>Update Room</button>
            </form>
        </div>
        <h2>Room Inventory</h2>
        <div id="inventory"></div>
        <h2>All Bookings</h2>
        <div id="adminBookings"></div>
        <h2>Static Page Content</h2>
        <form id="contentForm">
            <label>About Us</label>
            <textarea name="about" rows="3"></textarea>
            <label>Contact Information</label>
            <textarea name="contact" rows="3"></textarea>
            <label>Customer Service FAQ</label>
            <textarea name="faq" rows="3"></textarea>
            <label>Local Travel Guide</label>
            <textarea name="travel" rows="3"></textarea>
            <label>Privacy Policy</label>
            <textarea name="privacy" rows="3"></textarea>
            <button>Save Website Content</button>
        </form>
    `;

    const f = $("roomForm");

    function fillRoom() {
        const room = rooms().find(r => r.id === Number(f.roomId.value));
        f.price.value = room.price;
        f.quantity.value = room.quantity;
        f.details.value = room.details;
    }

    f.roomId.onchange = fillRoom;
    fillRoom();

    f.onsubmit = e => {
        e.preventDefault();
        const list = rooms();
        const room = list.find(r => r.id === Number(f.roomId.value));
        room.price = Number(f.price.value);
        room.quantity = Number(f.quantity.value);
        room.details = f.details.value.trim();
        save("hotelRooms", list);
        message("Room information updated.");
        renderAdmin();
    };

    $("inventory").innerHTML = `
        <table><tr><th>Room</th><th>Price</th><th>Quantity</th></tr>
        ${rooms().map(r => `
            <tr><td>${esc(r.name)}</td><td>₹${r.price}</td>
            <td>${r.quantity}</td></tr>
        `).join("")}</table>
    `;

    $("adminBookings").innerHTML = bookings().length ? bookings().map(b => `
        <div class="card" style="margin:12px 0">
            <p><b>ID:</b> ${b.id} | ${esc(b.customer)}</p>
            <p>${esc(b.roomName)} | ${b.checkIn} to ${b.checkOut}</p>
            <p>Status: ${esc(b.status)} | ₹${b.total}</p>
            <button data-admin-edit="${b.id}">Change Dates</button>
            <button class="danger" data-admin-cancel="${b.id}">Cancel Booking</button>
        </div>
    `).join("") : "<p>No bookings yet.</p>";

    $("adminBookings").querySelectorAll("[data-admin-cancel]").forEach(btn => {
        btn.onclick = () => {
            const all = bookings();
            const b = all.find(x => x.id === Number(btn.dataset.adminCancel));
            if (b && confirm("Cancel booking " + b.id + "?")) {
                b.status = "Cancelled";
                save("hotelBookings", all);
                renderAdmin();
            }
        };
    });

    $("adminBookings").querySelectorAll("[data-admin-edit]").forEach(btn => {
        btn.onclick = () => {
            const all = bookings();
            const b = all.find(x => x.id === Number(btn.dataset.adminEdit));
            if (!b || b.status !== "Confirmed") return;

            const start = prompt("New check-in date:", b.checkIn);
            if (!start) return;
            const end = prompt("New check-out date:", b.checkOut);
            if (!end) return;

            if (dateDays(start, end) <= 0 ||
                available(b.roomId, start, end, b.id) < 1) {
                message("Invalid dates or no room availability.");
                return;
            }

            b.checkIn = start;
            b.checkOut = end;
            const room = rooms().find(r => r.id === b.roomId);
            b.total = dateDays(start, end) * room.price;
            save("hotelBookings", all);
            renderAdmin();
        };
    });

    const content = read("hotelContent", {});
    const cf = $("contentForm");
    ["about", "contact", "faq", "travel", "privacy"].forEach(key => {
        cf[key].value = content[key] || "";
    });

    cf.onsubmit = e => {
        e.preventDefault();
        const result = {};
        ["about", "contact", "faq", "travel", "privacy"].forEach(key => {
            result[key] = cf[key].value;
        });
        save("hotelContent", result);
        message("Website information saved.");
    };
}

function renderInfo() {
    const c = read("hotelContent", {});
    $("app").innerHTML = `
        <h2>About StayEase</h2>
        <div class="panel"><p>${esc(c.about || "StayEase provides comfortable accommodation for business and leisure travellers.")}</p></div>
        <h2 style="margin-top:25px">Contact Us</h2>
        <div class="panel"><p>${esc(c.contact || "Email: support@stayease.example | Phone: +91 98765 43210")}</p></div>
        <h2 style="margin-top:25px">Customer Service FAQ</h2>
        <div class="panel"><p>${esc(c.faq || "Q: Can I cancel a booking? A: Yes, at least 3 days before arrival.")}</p></div>
        <h2 style="margin-top:25px">Local Travel Guide</h2>
        <div class="panel"><p>${esc(c.travel || "Ask the hotel team about local attractions and transportation options.")}</p></div>
        <h2 style="margin-top:25px">Privacy Policy</h2>
        <div class="panel"><p>${esc(c.privacy || "This demonstration stores sample information locally in your browser. Do not enter real passwords or payment information.")}</p></div>
    `;
}

const page = document.body.dataset.page;

const renderers = {
    home: renderHome,
    rooms: renderRooms,
    register: renderRegister,
    login: renderLogin,
    booking: renderBooking,
    dashboard: renderDashboard,
    admin: renderAdmin,
    info: renderInfo
};

if (renderers[page]) renderers[page]();
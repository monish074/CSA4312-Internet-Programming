const $ = (selector) => document.querySelector(selector);

const getData = (key, fallback = []) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

const saveData = (key, value) =>
  localStorage.setItem(key, JSON.stringify(value));

const money = value => "₹" + Number(value || 0).toLocaleString("en-IN");
const today = () => new Date().toISOString().slice(0, 10);

let buses = getData("rb_buses", [
  { id: 1, name: "Royal Maharaja", type: "Volvo AC Sleeper", from: "Chennai", to: "Bengaluru", departure: "21:00", arrival: "05:30", price: 1450, seats: 36, image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=900&q=80" },
  { id: 2, name: "Golden Express", type: "Luxury AC Seater", from: "Chennai", to: "Coimbatore", departure: "22:15", arrival: "06:00", price: 1100, seats: 32, image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=900&q=80" },
  { id: 3, name: "Imperial Travels", type: "AC Sleeper", from: "Bengaluru", to: "Hyderabad", departure: "20:30", arrival: "06:15", price: 1600, seats: 36, image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=900&q=80" },
  { id: 4, name: "Crown Roadlines", type: "Non AC Seater", from: "Chennai", to: "Madurai", departure: "19:45", arrival: "05:00", price: 750, seats: 40, image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=900&q=80" }
]);

saveData("rb_buses", buses);

let bookings = getData("rb_bookings");
let users = getData("rb_users");
let comments = getData("rb_comments");
let currentUser = getData("rb_currentUser", null);
let selectedSeats = new Set();

const page = document.body.dataset.page;

function header(admin = false) {
  return `
    <header class="topbar">
      <a class="brand" href="index.html">♛ <span>Royal</span>Bus</a>
      <nav>
        <a href="index.html">Home</a>
        <a href="buses.html">Explore Buses</a>
        <a href="dashboard.html">My Bookings</a>
        <a href="comments.html">Reviews</a>
        <a href="admin.html">Admin</a>
        <a href="login.html">${currentUser ? "Account" : "Login"}</a>
      </nav>
    </header>`;
}

function footer() {
  return `<footer class="footer">
    <div class="brand">♛ RoyalBus</div>
    <p>Travel beyond ordinary. Arrive in style.</p>
    <p>© 2026 <span>RoyalBus</span> · Luxury journeys, thoughtfully designed.</p>
  </footer>`;
}

function shell(content, admin = false) {
  $("#app").innerHTML = header(admin) + content + footer();
}

function pageHead(title, subtitle) {
  return `<section class="page-head"><h1>${title}</h1><p>${subtitle}</p></section>`;
}

function field(label, name, type = "text", extra = "") {
  return `<div class="field"><label for="${name}">${label}</label>
    <input id="${name}" name="${name}" type="${type}" ${extra} required></div>`;
}

function showMessage(message) {
  alert(message);
}

function renderHome() {
  shell(`
    <section class="hero">
      <div class="hero-content">
        <span class="eyebrow">The art of travelling well</span>
        <h1>Your Journey.<br>Our Royal Promise.</h1>
        <p>Discover premium bus journeys, carefully selected routes and a more elegant way to travel.</p>
        <a class="btn" href="#search">Plan Your Journey &nbsp; →</a>
      </div>
    </section>

    <section class="section">
      <div class="search-panel" id="search">
        <div class="section-heading"><span class="eyebrow">Make it memorable</span>
          <h2>Find Your Perfect Bus</h2></div>
        <form id="searchForm" class="form-grid">
          <div class="field"><label>From</label><input name="from" placeholder="e.g. Chennai" required></div>
          <div class="field"><label>To</label><input name="to" placeholder="e.g. Bengaluru" required></div>
          <div class="field"><label>Journey Date</label><input name="date" type="date" min="${today()}" value="${today()}" required></div>
          <div class="field"><label>Passengers</label><select name="passengers"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option></select></div>
          <div class="full"><button class="btn btn-dark" type="submit">Search Available Buses →</button></div>
        </form>
      </div>
    </section>

    <section class="section">
      <div class="section-heading"><span class="eyebrow">Curated journeys</span>
        <h2>Travel in Your Own Style</h2>
        <p>Choose comfort that matches your journey.</p></div>
      <div class="grid-3">
        ${[
          ["Volvo AC Sleeper","Premium overnight comfort"],
          ["Luxury AC Seater","Relaxed daytime travel"],
          ["Non AC Seater","Practical, budget-friendly journeys"]
        ].map((item, i) => `
          <article class="card">
            <img class="bus-image" src="${buses[i % buses.length].image}" alt="Bus travel">
            <div class="card-body"><span class="badge">ROYAL COLLECTION</span>
              <h3>${item[0]}</h3><p>${item[1]}</p>
              <a class="btn btn-outline" href="buses.html">Explore Buses</a></div>
          </article>`).join("")}
      </div>
    </section>
  `);
  $("#searchForm").addEventListener("submit", e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    sessionStorage.setItem("rb_search", JSON.stringify(data));
    location.href = "buses.html";
  });
}

function renderLogin() {
  shell(`${pageHead("Welcome Back", "Sign in to manage your journeys and bookings.")}
    <section class="section"><div class="panel form-wrap">
      <h2>Member Login</h2>
      <p class="muted">Your next journey is only a few steps away.</p>
      <form id="loginForm" class="form-stack">
        ${field("Email Address","email","email")}
        ${field("Password","password","password")}
        <button class="btn btn-dark">Sign In Securely</button>
      </form>
      <p><a href="#" id="forgotLink">Forgot password?</a> · <a href="register.html">Create account</a></p>
      <div class="notice">Demo admin: admin@royalbus.com / Royal123</div>
    </div></section>`);
  $("#loginForm").addEventListener("submit", e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    if (data.email === "admin@royalbus.com" && data.password === "Royal123") {
      saveData("rb_currentUser", { name: "Administrator", email: data.email, role: "admin" });
      location.href = "admin.html";
      return;
    }
    const user = users.find(u => u.email.toLowerCase() === data.email.toLowerCase() && u.password === data.password);
    if (!user) return showMessage("Invalid email or password.");
    saveData("rb_currentUser", { name: user.name, email: user.email, role: "user" });
    location.href = "dashboard.html";
  });
  $("#forgotLink").addEventListener("click", e => {
    e.preventDefault();
    const email = prompt("Enter your registered email address:");
    if (!email) return;
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    showMessage(user
      ? "Demo only: password recovery must be implemented securely on a server."
      : "No registered account was found for that email.");
  });
}

function renderRegister() {
  shell(`${pageHead("Join RoyalBus", "Create your account and make every journey count.")}
    <section class="section"><div class="panel form-wrap">
      <h2>Create Your Account</h2>
      <form id="registerForm" class="form-stack">
        ${field("Full Name","name")}
        ${field("Email Address","email","email")}
        ${field("Mobile Number","phone","tel",'pattern="[0-9]{10}"')}
        ${field("Create Password","password","password",'minlength="8"')}
        <button class="btn btn-dark">Register Now</button>
      </form>
      <p class="muted">Already registered? <a href="login.html">Sign in</a></p>
    </div></section>`);
  $("#registerForm").addEventListener("submit", e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return showMessage("An account with this email already exists.");
    }
    users.push(data);
    saveData("rb_users", users);
    showMessage("Registration successful. Please log in.");
    location.href = "login.html";
  });
}

function renderBuses() {
  const search = getData("unused", null) || JSON.parse(sessionStorage.getItem("rb_search") || "null");
  const from = search?.from?.trim().toLowerCase() || "";
  const to = search?.to?.trim().toLowerCase() || "";
  const date = search?.date || today();
  const results = buses.filter(b =>
    (!from || b.from.toLowerCase().includes(from)) &&
    (!to || b.to.toLowerCase().includes(to))
  );

  shell(`${pageHead("Discover Your Route", "Compare buses, choose your comfort and reserve your seat.")}
    <section class="section">
      <form id="searchForm" class="panel form-grid">
        <div class="field"><label>From</label><input name="from" value="${from}" placeholder="City"></div>
        <div class="field"><label>To</label><input name="to" value="${to}" placeholder="City"></div>
        <div class="field"><label>Journey Date</label><input name="date" type="date" min="${today()}" value="${date}" required></div>
        <div class="field"><label>Passengers</label><select name="passengers">${[1,2,3,4,5,6].map(n => `<option ${Number(search?.passengers || 1) === n ? "selected" : ""}>${n}</option>`).join("")}</select></div>
        <div class="full"><button class="btn btn-dark">Update Search</button></div>
      </form>
      <div class="section-heading" style="margin-top:35px">
        <span class="eyebrow">Available departures</span><h2>${results.length} Bus(es) Found</h2>
        <p>${date} · Prices shown per passenger</p>
      </div>
      <div class="grid-2">
        ${results.map(b => {
          const reserved = bookings.filter(x => x.busId === b.id && x.date === date && x.status === "Confirmed").flatMap(x => x.seats);
          return `<article class="card">
            <img class="bus-image" src="${b.image}" alt="${b.name}">
            <div class="card-body">
              <span class="badge">${b.type}</span><h3>${b.name}</h3>
              <div class="summary-row"><span>${b.from} → ${b.to}</span><strong>${b.departure}</strong></div>
              <div class="summary-row"><span>Arrival</span><strong>${b.arrival}</strong></div>
              <div class="summary-row"><span>Seats available</span><strong>${b.seats - reserved.length}</strong></div>
              <p class="price">${money(b.price)} <small>/ person</small></p>
              <button class="btn btn-dark chooseBus" data-id="${b.id}" data-date="${date}">Select Seats →</button>
            </div>
          </article>`;
        }).join("") || `<div class="panel empty full">No matching buses found. Try another route.</div>`}
      </div>
    </section>`);
  $("#searchForm").addEventListener("submit", e => {
    e.preventDefault();
    sessionStorage.setItem("rb_search", JSON.stringify(Object.fromEntries(new FormData(e.target))));
    renderBuses();
  });
  document.querySelectorAll(".chooseBus").forEach(button => button.addEventListener("click", () => {
    sessionStorage.setItem("rb_selectedBus", JSON.stringify({
      id: Number(button.dataset.id), date: button.dataset.date
    }));
    location.href = "booking.html";
  }));
}

function renderBooking() {
  const selection = JSON.parse(sessionStorage.getItem("rb_selectedBus") || "null");
  const bus = buses.find(b => b.id === selection?.id);
  if (!bus) {
    shell(`${pageHead("Reserve Your Seat", "Choose a bus before continuing.")}
      <section class="section"><div class="panel empty"><a class="btn" href="buses.html">Browse Buses</a></div></section>`);
    return;
  }

  if (selection.date < today()) {
    shell(`${pageHead("Journey Date Expired", "Please select a future journey date.")}
      <section class="section"><a class="btn" href="buses.html">Choose Another Date</a></section>`);
    return;
  }

  const reserved = bookings
    .filter(x => x.busId === bus.id && x.date === selection.date && x.status === "Confirmed")
    .flatMap(x => x.seats);

  selectedSeats = new Set();
  const seatButtons = Array.from({length: bus.seats}, (_, i) => {
    const seat = i + 1;
    const booked = reserved.includes(seat);
    return `<button type="button" class="seat ${booked ? "booked" : ""}" data-seat="${seat}" ${booked ? "disabled" : ""}>${seat}</button>`;
  });

  shell(`${pageHead("Complete Your Booking", "Select your seats and enter the passenger details.")}
    <section class="section">
      <div class="grid-2">
        <div class="panel">
          <span class="eyebrow">Seat selection</span><h2>${bus.name}</h2>
          <p>${bus.from} → ${bus.to} · ${selection.date}</p>
          <div class="seat-layout">${seatButtons.join("")}</div>
          <p class="muted">White: available · Gold: selected · Grey: booked</p>
          <div class="summary-row"><span>Selected seats</span><strong id="seatSummary">None</strong></div>
          <div class="summary-row"><span>Price per seat</span><strong>${money(bus.price)}</strong></div>
          <div class="summary-row"><span>Total</span><strong class="price" id="totalPrice">${money(0)}</strong></div>
        </div>
        <div class="panel">
          <span class="eyebrow">Passenger details</span><h2>Traveller Information</h2>
          <form id="bookingForm" class="form-stack">
            ${field("Passenger Name","passenger")}
            ${field("Email Address","email","email")}
            ${field("Mobile Number","phone","tel",'pattern="[0-9]{10}"')}
            <div class="field"><label>Payment Method</label>
              <select name="payment" required>
                <option value="Demo payment">Demo payment (no real charge)</option>
                <option value="Pay on arrival">Pay on arrival (demo)</option>
              </select>
            </div>
            <div class="notice">No real payment is collected by this demonstration website.</div>
            <button class="btn btn-dark">Confirm Booking</button>
          </form>
        </div>
      </div>
    </section>`);

  function updateSeats() {
    $("#seatSummary").textContent = [...selectedSeats].join(", ") || "None";
    $("#totalPrice").textContent = money(selectedSeats.size * bus.price);
  }

  document.querySelectorAll(".seat:not(.booked)").forEach(button => {
    button.addEventListener("click", () => {
      const seat = Number(button.dataset.seat);
      if (selectedSeats.has(seat)) {
        selectedSeats.delete(seat);
        button.classList.remove("selected");
      } else {
        if (selectedSeats.size >= 6) return showMessage("You can select up to 6 seats.");
        selectedSeats.add(seat);
        button.classList.add("selected");
      }
      updateSeats();
    });
  });

  $("#bookingForm").addEventListener("submit", e => {
    e.preventDefault();
    if (!currentUser) {
      showMessage("Please log in before confirming your booking.");
      sessionStorage.setItem("rb_returnAfterLogin", "booking");
      location.href = "login.html";
      return;
    }
    if (selectedSeats.size === 0) return showMessage("Please select at least one seat.");
    const data = Object.fromEntries(new FormData(e.target));
    const latestReserved = bookings
      .filter(x => x.busId === bus.id && x.date === selection.date && x.status === "Confirmed")
      .flatMap(x => x.seats);
    if ([...selectedSeats].some(s => latestReserved.includes(s))) {
      return showMessage("A selected seat has just been booked. Please reload and choose again.");
    }
    const booking = {
      id: "RB" + Date.now().toString().slice(-8),
      busId: bus.id, busName: bus.name, route: `${bus.from} → ${bus.to}`,
      date: selection.date, seats: [...selectedSeats],
      passenger: data.passenger, email: data.email, phone: data.phone,
      payment: data.payment, total: selectedSeats.size * bus.price,
      userEmail: currentUser.email, status: "Confirmed"
    };
    bookings.push(booking);
    saveData("rb_bookings", bookings);
    showMessage("Booking confirmed! Reference: " + booking.id + ". This is a demo confirmation; no email or payment was processed.");
    location.href = "dashboard.html";
  });
}

function renderDashboard() {
  const mine = currentUser
    ? bookings.filter(b => b.userEmail === currentUser.email)
    : [];

  shell(`${pageHead("Your Travel Journal", "View your bookings and manage your upcoming journeys.")}
    <section class="section">
      ${!currentUser ? `<div class="panel empty"><h2>Please log in</h2><a class="btn btn-dark" href="login.html">Login to Continue</a></div>` : `
      <div class="panel">
        <div class="section-heading"><span class="eyebrow">Welcome back</span><h2>${currentUser.name}</h2><p>${currentUser.email}</p></div>
        <div class="table-wrap"><table>
          <thead><tr><th>Reference</th><th>Bus / Route</th><th>Date</th><th>Seats</th><th>Total</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>${mine.map(b => `<tr>
            <td>${b.id}</td><td>${b.busName}<br>${b.route}</td><td>${b.date}</td>
            <td>${b.seats.join(", ")}</td><td>${money(b.total)}</td>
            <td><span class="badge ${b.status === "Confirmed" ? "badge-green" : "badge-red"}">${b.status}</span></td>
            <td>${b.status === "Confirmed" && b.date > today() ? `<button class="btn btn-danger btn-small cancelBooking" data-id="${b.id}">Cancel</button>` : "—"}</td>
          </tr>`).join("") || `<tr><td colspan="7">No bookings yet. <a href="buses.html">Explore buses</a>.</td></tr>`}</tbody>
        </table></div>
        <p class="muted">Cancellation is available before the journey date in this demo. Real cancellation and refunds require backend rules and payment gateway integration.</p>
        <a class="btn" href="buses.html">Book Another Journey</a>
      </div>`}
    </section>`);

  document.querySelectorAll(".cancelBooking").forEach(button => button.addEventListener("click", () => {
    if (!confirm("Cancel this booking?")) return;
    const item = bookings.find(b => b.id === button.dataset.id && b.userEmail === currentUser?.email);
    if (!item || item.date <= today()) return showMessage("This booking cannot be cancelled.");
    item.status = "Cancelled";
    saveData("rb_bookings", bookings);
    renderDashboard();
  }));
}

function renderComments() {
  shell(`${pageHead("The Royal Review", "Share your experience and help fellow travellers.")}
    <section class="section">
      <div class="grid-2">
        <div class="panel">
          <span class="eyebrow">Your voice matters</span><h2>Write a Review</h2>
          <form id="commentForm" class="form-stack">
            <div class="field"><label>Bus</label><select name="busId">${buses.map(b => `<option value="${b.id}">${b.name}</option>`).join("")}</select></div>
            <div class="field"><label>Rating</label><select name="rating"><option value="5">5 — Excellent</option><option value="4">4 — Very good</option><option value="3">3 — Good</option><option value="2">2 — Fair</option><option value="1">1 — Poor</option></select></div>
            <div class="field"><label>Your Comment</label><textarea name="message" maxlength="500" required placeholder="Tell us about your journey..."></textarea></div>
            <button class="btn btn-dark">Publish Review</button>
          </form>
        </div>
        <div><span class="eyebrow">Passenger stories</span><h2>Recent Reviews</h2>
          ${comments.map(c => `<article class="card card-body review"><span class="stars">${"★".repeat(c.rating)}${"☆".repeat(5-c.rating)}</span><h3>${c.busName}</h3><p>${escapeHTML(c.message)}</p><small>${escapeHTML(c.name)} · ${c.date}</small></article>`).join("<br>") || `<div class="panel empty">Be the first to share a review.</div>`}
        </div>
      </div>
    </section>`);

  $("#commentForm").addEventListener("submit", e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    const bus = buses.find(b => b.id === Number(data.busId));
    comments.unshift({
      ...data, rating: Number(data.rating), busName: bus.name,
      name: currentUser?.name || "Guest", date: today()
    });
    saveData("rb_comments", comments);
    renderComments();
    showMessage("Your review has been published.");
  });
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  }[c]));
}

function renderAdmin() {
  if (currentUser?.role !== "admin") {
    shell(`${pageHead("Administration", "Restricted access for authorised administrators.")}
      <section class="section"><div class="panel form-wrap"><h2>Admin Sign In</h2>
        <p>Please sign in using the demonstration admin account.</p>
        <a class="btn btn-dark" href="login.html">Go to Login</a>
      </div></section>`);
    return;
  }

  shell(`${pageHead("RoyalBus Control Room", "Manage bus inventory, categories, schedules and passenger bookings.")}
    <section class="section">
      <div class="stats">
        <div class="stat"><span>Total Buses</span><strong>${buses.length}</strong></div>
        <div class="stat"><span>Registered Users</span><strong>${users.length}</strong></div>
        <div class="stat"><span>Total Bookings</span><strong>${bookings.length}</strong></div>
        <div class="stat"><span>Confirmed Sales</span><strong>${money(bookings.filter(b => b.status === "Confirmed").reduce((sum,b) => sum + b.total, 0))}</strong></div>
      </div>
      <div class="grid-2" style="margin-top:25px">
        <div class="panel">
          <span class="eyebrow">Fleet management</span><h2>Add / Update Bus</h2>
          <form id="busForm" class="form-stack">
            <input type="hidden" name="id">
            <div class="field"><label>Bus Name</label><input name="name" required></div>
            <div class="field"><label>Bus Category</label><select name="type"><option>Volvo AC Sleeper</option><option>Luxury AC Seater</option><option>AC Sleeper</option><option>Non AC Seater</option><option>Sleeper Coach</option></select></div>
            <div class="grid-2">
              <div class="field"><label>From</label><input name="from" required></div>
              <div class="field"><label>To</label><input name="to" required></div>
              <div class="field"><label>Departure</label><input name="departure" type="time" required></div>
              <div class="field"><label>Arrival</label><input name="arrival" type="time" required></div>
              <div class="field"><label>Price (₹)</label><input name="price" type="number" min="1" required></div>
              <div class="field"><label>Seat Capacity</label><input name="seats" type="number" min="1" max="60" required></div>
            </div>
            <div class="field"><label>Bus Photo URL</label><input name="image" type="url" placeholder="https://..."></div>
            <button class="btn btn-dark">Save Bus Information</button>
            <button class="btn btn-outline" type="button" id="resetBus">Clear Form</button>
          </form>
        </div>
        <div class="panel">
          <span class="eyebrow">Registered passengers</span><h2>User Accounts</h2>
          <div class="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Action</th></tr></thead>
          <tbody>${users.map((u,i) => `<tr><td>${escapeHTML(u.name)}</td><td>${escapeHTML(u.email)}</td><td><button class="btn btn-danger btn-small deleteUser" data-index="${i}">Delete</button></td></tr>`).join("") || `<tr><td colspan="3">No users registered.</td></tr>`}</tbody></table></div>
          <p class="muted">For a real system, user administration must be protected by server-side permissions.</p>
        </div>
      </div>
      <div class="panel" style="margin-top:25px">
        <h2>Bus Inventory</h2><div class="table-wrap"><table>
          <thead><tr><th>Name</th><th>Category</th><th>Route</th><th>Departure</th><th>Price</th><th>Seats</th><th>Actions</th></tr></thead>
          <tbody>${buses.map(b => `<tr><td>${escapeHTML(b.name)}</td><td>${escapeHTML(b.type)}</td><td>${escapeHTML(b.from)} → ${escapeHTML(b.to)}</td><td>${b.departure}</td><td>${money(b.price)}</td><td>${b.seats}</td><td><button class="btn btn-small editBus" data-id="${b.id}">Edit</button> <button class="btn btn-danger btn-small deleteBus" data-id="${b.id}">Delete</button></td></tr>`).join("")}</tbody>
        </table></div>
      </div>
      <div class="panel" style="margin-top:25px">
        <h2>Manage Bookings</h2><div class="table-wrap"><table>
          <thead><tr><th>Reference</th><th>Passenger</th><th>Bus</th><th>Date</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>${bookings.map(b => `<tr><td>${b.id}</td><td>${escapeHTML(b.passenger)}</td><td>${escapeHTML(b.busName)}</td><td>${b.date}</td><td>${money(b.total)}</td><td>${b.status}</td><td>${b.status === "Confirmed" ? `<button class="btn btn-danger btn-small adminCancel" data-id="${b.id}">Cancel</button>` : "—"}</td></tr>`).join("") || `<tr><td colspan="7">No bookings.</td></tr>`}</tbody>
        </table></div>
        <p><a class="btn" href="reports.html">Open Reports →</a></p>
      </div>
    </section>`);

  const busForm = $("#busForm");

  busForm.addEventListener("submit", e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(busForm));
    const id = Number(data.id);
    const record = {
      id: id || Date.now(), name: data.name, type: data.type,
      from: data.from, to: data.to, departure: data.departure,
      arrival: data.arrival, price: Number(data.price),
      seats: Number(data.seats),
      image: data.image || "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=900&q=80"
    };
    if (id) {
      const index = buses.findIndex(b => b.id === id);
      if (index >= 0) buses[index] = record;
    } else buses.push(record);
    saveData("rb_buses", buses);
    showMessage("Bus information saved.");
    renderAdmin();
  });

  $("#resetBus").addEventListener("click", () => busForm.reset());

  document.querySelectorAll(".editBus").forEach(button => button.addEventListener("click", () => {
    const b = buses.find(item => item.id === Number(button.dataset.id));
    if (!b) return;
    Object.entries(b).forEach(([key, value]) => {
      if (busForm.elements[key]) busForm.elements[key].value = value;
    });
    busForm.scrollIntoView({ behavior: "smooth" });
  }));

  document.querySelectorAll(".deleteBus").forEach(button => button.addEventListener("click", () => {
    const id = Number(button.dataset.id);
    if (!confirm("Delete this bus from the inventory?")) return;
    buses = buses.filter(b => b.id !== id);
    saveData("rb_buses", buses);
    renderAdmin();
  }));

  document.querySelectorAll(".adminCancel").forEach(button => button.addEventListener("click", () => {
    const item = bookings.find(b => b.id === button.dataset.id);
    if (item && confirm("Cancel this booking?")) {
      item.status = "Cancelled";
      saveData("rb_bookings", bookings);
      renderAdmin();
    }
  }));

  document.querySelectorAll(".deleteUser").forEach(button => button.addEventListener("click", () => {
    const index = Number(button.dataset.index);
    if (!confirm("Delete this registered account?")) return;
    users.splice(index, 1);
    saveData("rb_users", users);
    renderAdmin();
  }));
}

function renderReports() {
  if (currentUser?.role !== "admin") {
    shell(`${pageHead("Reports & Analytics", "Admin access is required to view system reports.")}
      <section class="section"><a class="btn btn-dark" href="login.html">Admin Login</a></section>`);
    return;
  }

  const confirmed = bookings.filter(b => b.status === "Confirmed");
  const revenue = confirmed.reduce((sum, b) => sum + b.total, 0);
  shell(`${pageHead("Reports & Analytics", "A clear view of bookings, sales and passenger activity.")}
    <section class="section">
      <div class="stats">
        <div class="stat"><span>Total Bookings</span><strong>${bookings.length}</strong></div>
        <div class="stat"><span>Confirmed</span><strong>${confirmed.length}</strong></div>
        <div class="stat"><span>Cancelled</span><strong>${bookings.filter(b => b.status === "Cancelled").length}</strong></div>
        <div class="stat"><span>Confirmed Revenue</span><strong>${money(revenue)}</strong></div>
      </div>
      <div class="panel" style="margin-top:25px">
        <div class="section-heading"><h2>Booking Report</h2><p>Export the current report as a CSV file.</p></div>
        <button class="btn btn-dark" id="exportReport">Download CSV Report</button>
        <div class="table-wrap" style="margin-top:20px"><table>
          <thead><tr><th>Reference</th><th>Passenger</th><th>Route</th><th>Date</th><th>Seats</th><th>Total</th><th>Status</th></tr></thead>
          <tbody>${bookings.map(b => `<tr><td>${b.id}</td><td>${escapeHTML(b.passenger)}</td><td>${escapeHTML(b.route)}</td><td>${b.date}</td><td>${b.seats.join(", ")}</td><td>${money(b.total)}</td><td>${b.status}</td></tr>`).join("") || `<tr><td colspan="7">No report data yet.</td></tr>`}</tbody>
        </table></div>
      </div>
    </section>`);

  $("#exportReport").addEventListener("click", () => {
    const rows = [
      ["Reference","Passenger","Email","Route","Date","Seats","Total","Status"],
      ...bookings.map(b => [b.id,b.passenger,b.email,b.route,b.date,b.seats.join(" "),b.total,b.status])
    ];
    const csv = rows.map(row => row.map(value =>
      '"' + String(value ?? "").replace(/"/g, '""') + '"'
    ).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "royalbus-booking-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  });
}

switch (page) {
  case "home": renderHome(); break;
  case "login": renderLogin(); break;
  case "register": renderRegister(); break;
  case "buses": renderBuses(); break;
  case "booking": renderBooking(); break;
  case "dashboard": renderDashboard(); break;
  case "comments": renderComments(); break;
  case "admin": renderAdmin(); break;
  case "reports": renderReports(); break;
  default: renderHome();
}
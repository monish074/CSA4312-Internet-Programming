// Shared JavaScript for all TechVista pages. Each feature checks that its page elements exist.
document.addEventListener("DOMContentLoaded", () => {
  // Mobile navigation
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });
  }

  // Theme selection: saved choice wins; otherwise the CSS follows the system preference.
  const themeButtons = document.querySelectorAll(".theme-toggle");
  const savedTheme = localStorage.getItem("techvista-theme");
  if (savedTheme === "dark" || savedTheme === "light") {
    document.documentElement.dataset.theme = savedTheme;
  }
  themeButtons.forEach(button => {
    button.addEventListener("click", () => {
      const current = document.documentElement.dataset.theme ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      localStorage.setItem("techvista-theme", next);
    });
  });

  // Countdown to the event start date.
  const countdown = document.getElementById("countdown");
  if (countdown) {
    const eventDate = new Date("2026-12-10T09:00:00+05:30");
    const updateCountdown = () => {
      const diff = eventDate.getTime() - Date.now();
      if (diff <= 0) {
        countdown.textContent = "TechVista 2026 is here!";
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      countdown.textContent = `${days} days ${hours} hours ${minutes} minutes to go`;
    };
    updateCountdown();
    window.setInterval(updateCountdown, 60000);
  }

  // Registration form controls and client-side validation.
  const form = document.getElementById("registrationForm");
  if (form) {
    const eventBoxes = [...form.querySelectorAll('input[name="events"]')];
    const message = document.getElementById("formMessage");
    const slider = document.getElementById("teamSize");
    const output = document.getElementById("teamValue");
    const progress = document.getElementById("formProgress");
    const progressText = document.getElementById("progressText");

    eventBoxes.forEach(box => box.addEventListener("change", () => {
      const selected = eventBoxes.filter(item => item.checked);
      if (selected.length > 4) {
        box.checked = false;
        if (message) message.textContent = "You can select a maximum of four events.";
      } else if (message) {
        message.textContent = `${selected.length} event(s) selected.`;
      }
      updateProgress();
    }));

    if (slider && output) {
      slider.addEventListener("input", () => { output.value = slider.value; });
    }

    const updateProgress = () => {
      const required = [...form.querySelectorAll("[required]")];
      const complete = required.filter(el => {
        if (el.type === "checkbox" || el.type === "radio") return el.checked;
        if (el.type === "radio") return form.querySelector(`input[name="${el.name}"]:checked`);
        return el.value.trim() !== "";
      }).length;
      const percent = required.length ? Math.round(complete / required.length * 100) : 0;
      if (progress) progress.value = percent;
      if (progressText) progressText.textContent = `${percent}%`;
    };
    form.addEventListener("input", updateProgress);
    form.addEventListener("change", updateProgress);
    form.addEventListener("reset", () => window.setTimeout(() => {
      if (output) output.value = "1";
      if (message) message.textContent = "Form reset. This demo does not send data to a server.";
      updateProgress();
    }, 0));
    form.addEventListener("submit", event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      if (eventBoxes.filter(item => item.checked).length > 4) {
        if (message) message.textContent = "Select no more than four events.";
        return;
      }
      if (message) message.textContent = "Demo only: your details passed browser validation. Connect a secure server endpoint to complete registration.";
    });
    updateProgress();
  }

  // Video controls.
  const video = document.getElementById("promoVideo");
  if (video) {
    document.getElementById("videoPlay")?.addEventListener("click", () => video.play().catch(() => {}));
    document.getElementById("videoPause")?.addEventListener("click", () => video.pause());
    document.getElementById("videoMute")?.addEventListener("click", () => { video.muted = !video.muted; });
    document.getElementById("videoSkip")?.addEventListener("click", () => {
      if (Number.isFinite(video.duration)) video.currentTime = Math.min(video.currentTime + 10, video.duration);
    });
  }

  // Drag-and-drop agenda, with Add buttons as a touch and keyboard-friendly alternative.
  const allEvents = document.getElementById("allEvents");
  const myAgenda = document.getElementById("myAgenda");
  const agendaMessage = document.getElementById("agendaMessage");
  if (allEvents && myAgenda) {
    const cards = [...allEvents.querySelectorAll(".agenda-event")];
    const addToAgenda = card => {
      const conflict = [...myAgenda.querySelectorAll(".agenda-event")].some(
        item => item.dataset.time === card.dataset.time
      );
      if (conflict) {
        if (agendaMessage) agendaMessage.textContent = `Time conflict: another event is already scheduled at ${card.dataset.time}.`;
        return;
      }
      if (card.parentElement === myAgenda) return;
      const empty = myAgenda.querySelector(".empty-agenda");
      if (empty) empty.remove();
      const clone = card.cloneNode(true);
      clone.classList.add("in-agenda");
      clone.draggable = false;
      clone.querySelector(".add-event")?.remove();
      myAgenda.appendChild(clone);
      if (agendaMessage) agendaMessage.textContent = `${card.dataset.event} added to your agenda.`;
    };

    cards.forEach(card => {
      card.addEventListener("dragstart", event => {
        event.dataTransfer.setData("text/plain", card.dataset.event);
        event.dataTransfer.setData("text/time", card.dataset.time);
      });
      card.querySelector(".add-event")?.addEventListener("click", () => addToAgenda(card));
    });

    myAgenda.addEventListener("dragover", event => {
      event.preventDefault();
      myAgenda.classList.add("highlight");
    });
    myAgenda.addEventListener("dragleave", event => {
      if (!myAgenda.contains(event.relatedTarget)) myAgenda.classList.remove("highlight");
    });
    myAgenda.addEventListener("drop", event => {
      event.preventDefault();
      myAgenda.classList.remove("highlight");
      const name = event.dataTransfer.getData("text/plain");
      const time = event.dataTransfer.getData("text/time");
      const card = cards.find(item => item.dataset.event === name && item.dataset.time === time);
      if (card) addToAgenda(card);
    });

    document.getElementById("clearAgenda")?.addEventListener("click", () => {
      myAgenda.querySelectorAll(".agenda-event").forEach(item => item.remove());
      if (!myAgenda.querySelector(".empty-agenda")) {
        const empty = document.createElement("p");
        empty.className = "empty-agenda";
        empty.textContent = "Drop events here or press Add.";
        myAgenda.appendChild(empty);
      }
      if (agendaMessage) agendaMessage.textContent = "Your agenda has been cleared.";
    });
  }

  // Register the service worker only on localhost or HTTPS.
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
    navigator.serviceWorker.register("sw.js").catch(error => console.error("Service worker registration failed:", error));
  }
});

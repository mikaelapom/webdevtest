(function () {
  window.PurpleCouch = window.PurpleCouch || {};

  function formatDateKey(d) {
    return d.toISOString().slice(0, 10);
  }

  function buildEventsForMonth(year, month) {
    // returns map dateKey -> [events]
    const events = {};
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    for (let day = 1; day <= last.getDate(); day++) {
      const dt = new Date(year, month, day);
      const weekday = dt.getDay(); // 0 Sun .. 6 Sat
      const key = formatDateKey(dt);
      events[key] = events[key] || [];

      // Book club happens Wednesdays at 7:00 PM
      if (weekday === 3) {
        events[key].push({
          title: "Book Club",
          time: "7:00 PM",
          type: "club",
          description:
            "Join us for our weekly book club discussion. All are welcome!",
        });
      }

      // Read with Finley (therapy dog) on alternating Mondays at 4:00 PM
      if (weekday === 1) {
        // Get the week number of the month (1-based)
        const weekOfMonth = Math.ceil(dt.getDate() / 7);
        // Schedule for 1st and 3rd Mondays
        if (weekOfMonth === 1 || weekOfMonth === 3) {
          events[key].push({
            title: "Read with Finley",
            time: "4:00 PM",
            type: "kids",
            description:
              "Join Finley, our friendly therapy dog, for a comfortable and fun reading session! Perfect for young readers who want to practice reading in a supportive environment.",
          });
        }
      }

      // Moody Monster Storytime every Saturday
      if (weekday === 6) {
        events[key].push({
          title: "Moody Monster Storytime",
          time: "11:00 AM",
          type: "workshop",
          description:
            "Join Jen and Moody to hear stories about big feelings! Created by Jen, My Moody Monster helps children understand and cope with their emotions in a fun and supportive environment.",
        });
      }

      // Guest author on first Sunday of each month at 2:00 PM
      if (weekday === 0 && dt.getDate() <= 7) {
        events[key].push({
          title: "Guest Author",
          time: "2:00 PM",
          type: "author",
          description:
            "Join us for a special reading and book signing with our monthly guest author!",
        });
      }
    }
    return events;
  }

  function createModal(contentHtml) {
    const backdrop = document.createElement("div");
    backdrop.className = "pc-modal-backdrop";
    const modal = document.createElement("div");
    modal.className = "pc-modal w3-card";
    modal.innerHTML =
      '<button class="close-btn" aria-label="Close">✕</button>' + contentHtml;
    backdrop.appendChild(modal);
    backdrop
      .querySelector(".close-btn")
      .addEventListener("click", () => backdrop.remove());
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) backdrop.remove();
    });
    document.body.appendChild(backdrop);
  }

  function renderDayCell(dt, isOutside, eventsForDay) {
    const cell = document.createElement("div");
    cell.className = "day-cell" + (isOutside ? " outside" : "");
    const dnum = document.createElement("div");
    dnum.className = "date-num";
    dnum.textContent = dt.getDate();
    cell.appendChild(dnum);
    if (eventsForDay && eventsForDay.length) {
      const list = document.createElement("div");
      eventsForDay.forEach((ev) => {
        const row = document.createElement("div");
        row.className = "event-summary";
        const dot = document.createElement("span");
        dot.className = `event-dot dot-${ev.type}`;
        row.appendChild(dot);
        const txt = document.createElement("span");
        txt.textContent = ev.title + " — " + ev.time;
        row.appendChild(txt);
        list.appendChild(row);
      });
      cell.appendChild(list);
      cell.addEventListener("click", () => {
        const html =
          "<h4>" +
          dt.toDateString() +
          "</h4>" +
          eventsForDay
            .map(
              (ev) =>
                "<div><strong>" +
                ev.title +
                "</strong> <div>" +
                ev.time +
                '</div><div style="margin-top:6px;">' +
                ev.description +
                "</div></div>"
            )
            .join("<hr/>");
        createModal(html);
      });
    } else {
      // no event; clicking can show a small message
      cell.addEventListener("click", () => {
        createModal(
          "<h4>" +
            dt.toDateString() +
            "</h4><p>No events scheduled for this day.</p>"
        );
      });
    }
    return cell;
  }

  function getUpcomingFromToday(limit) {
    const out = [];
    const now = new Date();
    // look ahead 90 days
    const end = new Date();
    end.setDate(end.getDate() + 90);
    const cur = new Date(now);
    while (cur <= end && out.length < limit) {
      const day = cur.getDay();
      // Book club on Wednesdays
      if (day === 3) {
        out.push({ date: new Date(cur), title: "Book Club", time: "7:00 PM" });
      }
      // Read with Finley on 1st and 3rd Mondays
      if (day === 1) {
        const weekOfMonth = Math.ceil(cur.getDate() / 7);
        if (weekOfMonth === 1 || weekOfMonth === 3) {
          out.push({
            date: new Date(cur),
            title: "Read with Finley",
            time: "4:00 PM",
          });
        }
      }
      // Moody Monster Storytime on Saturdays
      if (day === 6) {
        out.push({
          date: new Date(cur),
          title: "Moody Monster Storytime",
          time: "11:00 AM",
          type: "workshop",
        });
      }
      // Guest author on first Sunday
      if (day === 0 && cur.getDate() <= 7) {
        out.push({
          date: new Date(cur),
          title: "Guest Author",
          time: "2:00 PM",
        });
      }
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  }

  function renderUpcomingList(container) {
    const items = getUpcomingFromToday(6);
    container.innerHTML = "";
    items.forEach((it) => {
      const div = document.createElement("div");
      div.className = "upcoming-item";
      div.textContent =
        it.date.toDateString() + " — " + it.title + " @ " + it.time;
      container.appendChild(div);
    });
  }

  function renderListView(container) {
    container.innerHTML = "";

    // Regular recurring events
    const recurring = [
      { title: "Book Club", schedule: "Every Wednesday", time: "7:00 PM" },
      {
        title: "Read with Finley",
        schedule: "1st and 3rd Monday",
        time: "4:00 PM",
      },
      {
        title: "Moody Monster Storytime",
        schedule: "Every Saturday",
        time: "11:00 AM",
      },
    ];

    recurring.forEach((event) => {
      const el = document.createElement("div");
      el.className = "list-row recurring";
      el.innerHTML = `<strong>${event.title}</strong><div>${event.schedule} at ${event.time}</div>`;
      container.appendChild(el);
    });

    // Separate monthly events (Guest Author)
    const monthlyEl = document.createElement("div");
    monthlyEl.className = "list-row recurring";
    monthlyEl.innerHTML =
      "<strong>Guest Author</strong><div>First Sunday of each month at 2:00 PM</div>";
    container.appendChild(monthlyEl);
  }

  function initCalendar() {
    const grid = document.getElementById("calendarGrid");
    const title = document.getElementById("calendarTitle");
    const prevBtn = document.getElementById("prevMonthBtn");
    const nextBtn = document.getElementById("nextMonthBtn");
    const upcoming = document.getElementById("upcomingList");
    const listToggle = document.getElementById("listViewToggle");
    const listView = document.getElementById("listView");

    if (!grid || !title) return;

    let viewDate = new Date();

    function doRender() {
      grid.innerHTML = "";
      // day names
      const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      names.forEach((n) => {
        const d = document.createElement("div");
        d.className = "day-name";
        d.textContent = n;
        grid.appendChild(d);
      });

      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();
      title.textContent = viewDate.toLocaleString(undefined, {
        month: "long",
        year: "numeric",
      });

      const monthEvents = buildEventsForMonth(year, month);

      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      // previous month's tail
      const prevLast = new Date(year, month, 0).getDate();
      for (let i = 0; i < firstDay; i++) {
        const dnum = prevLast - firstDay + 1 + i;
        const dt = new Date(year, month - 1, dnum);
        const key = dt.toISOString().slice(0, 10);
        const cell = renderDayCell(dt, true, monthEvents[key]);
        grid.appendChild(cell);
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const dt = new Date(year, month, d);
        const key = dt.toISOString().slice(0, 10);
        const cell = renderDayCell(dt, false, monthEvents[key]);
        grid.appendChild(cell);
      }

      // fill rest to complete last week
      const totalCells = firstDay + daysInMonth;
      const remaining = (7 - (totalCells % 7)) % 7;
      for (let r = 1; r <= remaining; r++) {
        const dt = new Date(year, month + 1, r);
        const key = dt.toISOString().slice(0, 10);
        const cell = renderDayCell(dt, true, monthEvents[key]);
        grid.appendChild(cell);
      }

      // update upcoming sidebar
      if (upcoming) renderUpcomingList(upcoming);
      if (listView) renderListView(listView);
    }

    prevBtn &&
      prevBtn.addEventListener("click", () => {
        viewDate.setMonth(viewDate.getMonth() - 1);
        doRender();
      });
    nextBtn &&
      nextBtn.addEventListener("click", () => {
        viewDate.setMonth(viewDate.getMonth() + 1);
        doRender();
      });
    if (listToggle) {
      listToggle.addEventListener("change", () => {
        if (listToggle.checked) {
          listView.hidden = false;
        } else {
          listView.hidden = true;
        }
      });
    }

    doRender();
  }

  // export
  window.PurpleCouch.initCalendar = initCalendar;
})();

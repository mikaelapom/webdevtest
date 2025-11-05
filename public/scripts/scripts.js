// submit form
function handleAuthorsFormSubmit(event) {
  event.preventDefault(); // Prevent page refresh

  const form = event.target;
  const messageDiv = document.getElementById("formMessage");

  const name = form.elements["name"].value.trim();
  const email = form.elements["email"].value.trim();
  const phone = form.elements["phone_number"].value.trim();
  const location = form.elements["location"].value.trim();
  const work = form.elements["work"].value.trim();
  const marketingIdeas = form.elements["marketing_ideas"].value.trim();

  if (!name || !email) {
    messageDiv.textContent = "Please fill in your name and email.";
    messageDiv.style.color = "purple";
    return;
  }

  console.log({ name, email, phone, location, work, marketingIdeas });

  messageDiv.textContent = "Thank you for submitting!";
  messageDiv.style.color = "purple";

  form.reset();
}

// get form
const form = document.getElementById("authorsForm");
if (form) {
  form.addEventListener("submit", handleAuthorsFormSubmit);
}


//PDF HANDLING
//full screen
function viewPDFFullscreen(pdfPath) {
  window.open(pdfPath, "_blank");
}

//download
function downloadPDF(pdfPath, filename) {
  const link = document.createElement("a");
  link.href = pdfPath;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

//hamburger menu js
function toggleMenu() {
  const menu = document.getElementById("smallMenu");
  const btn = document.querySelector('[aria-controls="smallMenu"]');
  const isShown = menu.classList.contains("w3-show");

  menu.classList.toggle("w3-show");
  menu.setAttribute("aria-hidden", isShown ? "true" : "false");
  btn.setAttribute("aria-expanded", isShown ? "false" : "true");
}

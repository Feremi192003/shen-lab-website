const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('.main-navigation');

function closeMenu() {
  if (!menuButton || !navigation) return;
  navigation.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation menu');
}

if (menuButton && navigation) {
  menuButton.addEventListener('click', () => {
    const open = navigation.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  });

  navigation.addEventListener('click', (event) => {
    if (event.target.matches('a')) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  document.addEventListener('click', (event) => {
    if (!navigation.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
  });
}

document.querySelectorAll('[data-current-year]').forEach((element) => {
  element.textContent = new Date().getFullYear();
});

const contactForm = document.getElementById("contact-form");

if (contactForm) {
  const submitButton = document.getElementById("contact-submit");
  const statusMessage = document.getElementById("contact-status");

  const contactEndpoint =
    "https://shenlab-contact.feremi192003.workers.dev";

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    statusMessage.textContent = "";
    statusMessage.className = "contact-status";

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    const formData = new FormData(contactForm);

    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      topic: formData.get("topic"),
      message: formData.get("message"),
      website: formData.get("website"),
    };

    try {
      const response = await fetch(contactEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Message could not be sent.");
      }

      contactForm.reset();

      statusMessage.textContent = "Thank you! Your message has been sent.";
      statusMessage.classList.add("is-success");
    } catch (error) {
      console.error(error);

      statusMessage.textContent =
        error.message ||
        "Something went wrong. Please try again later.";

      statusMessage.classList.add("is-error");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Send message";
    }
  });
}

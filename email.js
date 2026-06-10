document
  .getElementById("contactForm")
  .addEventListener("submit", async function (e) {

    e.preventDefault();

    const formStatus =
      document.getElementById("formStatus");

    formStatus.textContent = "Sending...";
    formStatus.className = "form-status";

    try {
      const response = await fetch("/", {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams(
          new FormData(e.target)
        ).toString()
      });

      if (response.ok) {
        formStatus.textContent =
          "Message sent! We'll get back to you soon.";
        formStatus.className = "form-status success";
        e.target.reset();
      } else {
        formStatus.textContent =
          "Something went wrong. Please try again.";
        formStatus.className = "form-status error";
      }

    } catch (error) {
      formStatus.textContent =
        "Something went wrong. Please try again.";
      formStatus.className = "form-status error";
      console.error(error);
    }
});

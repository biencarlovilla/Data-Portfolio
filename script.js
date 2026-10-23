
/* Automatically update copyright year */
function updateCopyrightYear() {
    const currentYear = new Date().getFullYear();
    document.getElementById("current-year").textContent = currentYear;
}

updateCopyrightYear();

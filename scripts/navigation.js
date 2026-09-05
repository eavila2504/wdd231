//////////////////////////media selector//////////////////////////////
const navButton = document.querySelector('#ham-btn');
const navLinks = document.querySelector('#nav-bar');
const getDates = document.querySelector('#currentyear');
const lastModified = document.querySelector('#lastModified');

// Set the current year
const currentYear = new Date().getFullYear();
getDates.textContent = currentYear;

// Set the last modified date
lastModified.textContent = `Last Modified: ${document.lastModified}`;
 

//////////////////////toggle the show class off and on ///////////////////////
navButton.addEventListener('click', () => {
  navButton.classList.toggle('show');
  navLinks.classList.toggle('show');
});





//////////////////////////media selector//////////////////////////////
const navButton = document.querySelector('#ham-btn');
const navLinks = document.querySelector('#nav-bar');


//////////////////////toggle the show class off and on ///////////////////////

navButton.addEventListener('click', () => {
  navButton.classList.toggle('show');
  navLinks.classList.toggle('show');

});





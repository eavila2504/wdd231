//set media selector//
document.getElementById("currentyear").textContent = new Date().getFullYear();
const navButton = document.querySelector('ham-but');
const navLinks = document.querySelector('nav-bar');
//set dates///
document.getElementById("lastModified").textContent =
`Last Modified ${document.lastModified}`
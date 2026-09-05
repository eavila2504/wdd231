//////////////////////////media selector//////////////////////////////
const navButton = document.querySelector('#ham-btn');
const navLinks = document.querySelector('#nav-bar');
const STORAGE_KEY = 'index:courses';
document.getElementById("currentyear").textContent = new Date().getFullYear();
 
//set dates 
 
document.getElementById("lastModified").textContent =
  `Last Modified: ${document.lastModified}`;
 
 
//////////////////////toggle the show class off and on ///////////////////////
navButton.addEventListener('click', () => {
  navButton.classList.toggle('show');
  navLinks.classList.toggle('show');
});
 
 
//////////////////////////List of courses//////////////////////////////////////
 
 
const courses = [
    {
        subject: 'CSE',
        number: 110,
        title: 'Introduction to Programming',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'This course will introduce students to programming. It will introduce the building blocks of programming languages (variables, decisions, calculations, loops, array, and input/output) and use them to solve problems.',
        technology: [
            'Python'
        ],
        completed: true
    },
    {
        subject: 'WDD',
        number: 130,
        title: 'Web Fundamentals',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'This course introduces students to the World Wide Web and to careers in web site design and development. The course is hands on with students actually participating in simple web designs and programming. It is anticipated that students who complete this course will understand the fields of web design and development and will have a good idea if they want to pursue this degree as a major.',
        technology: [
            'HTML',
            'CSS'
        ],
        completed: true
    },
    {
        subject: 'CSE',
        number: 111,
        title: 'Programming with Functions',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'CSE 111 students become more organized, efficient, and powerful computer programmers by learning to research and call functions written by others; to write, call , debug, and test their own functions; and to handle errors within functions. CSE 111 students write programs with functions to solve problems in many disciplines, including business, physical science, human performance, and humanities.',
        technology: [
            'Python'
        ],
        completed: true
    },
    {
        subject: 'CSE',
        number: 210,
        title: 'Programming with Classes',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'This course will introduce the notion of classes and objects. It will present encapsulation at a conceptual level. It will also work with inheritance and polymorphism.',
        technology: [
            'C#'
        ],
        completed: true
    },
    {
        subject: 'WDD',
        number: 131,
        title: 'Dynamic Web Fundamentals',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'This course builds on prior experience in Web Fundamentals and programming. Students will learn to create dynamic websites that use JavaScript to respond to events, update content, and create responsive user experiences.',
        technology: [
            'HTML',
            'CSS',
            'JavaScript'
        ],
        completed: true
    },
    {
        subject: 'WDD',
        number: 231,
        title: 'Frontend Web Development I',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'This course builds on prior experience with Dynamic Web Fundamentals and programming. Students will focus on user experience, accessibility, compliance, performance optimization, and basic API usage.',
        technology: [
            'HTML',
            'CSS',
            'JavaScript'
        ],
        completed: false
    }
]
 
 
//////////////////////////Render + filter courses//////////////////////////////
 
const courseList = document.querySelector('.course-list');
const filterLinks = document.querySelectorAll('.course-filter a');
const creditTotal = document.getElementById('creditTotal');
 
function renderCourses(filter) {
  const filtered = filter === 'ALL'
    ? courses
    : courses.filter(course => course.subject === filter);
 
  courseList.innerHTML = '';
 
  filtered.forEach(course => {
    const li = document.createElement('li');
    li.className = 'course-item';
    li.dataset.category = course.subject;
    li.textContent = `${course.subject} ${course.number}`;
    if (course.completed) {
      li.classList.add('completed');
    }
    courseList.appendChild(li);
  });
 
  const totalCredits = filtered.reduce((sum, course) => sum + course.credits, 0);
  creditTotal.textContent = totalCredits;
}
 
filterLinks.forEach(link => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
 
    filterLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
 
    const filter = link.dataset.filter;
    renderCourses(filter);
 
    try {
      localStorage.setItem(STORAGE_KEY, filter);
    } catch (e) {
      // localStorage unavailable (e.g. private browsing) - safe to ignore
    }
  });
});
 
// Restore the last selected filter on page load, defaulting to ALL
let savedFilter = 'ALL';
try {
  savedFilter = localStorage.getItem(STORAGE_KEY) || 'ALL';
} catch (e) {
  savedFilter = 'ALL';
}
 
filterLinks.forEach(link => {
  link.classList.toggle('active', link.dataset.filter === savedFilter);
});
 
renderCourses(savedFilter);
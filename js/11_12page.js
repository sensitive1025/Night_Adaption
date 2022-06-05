import { getCookie } from "./main.js";

var noYouCant = document.getElementById('accessfail');

if (getCookie('4stage') != 'clear') {
    noYouCant.style.display = 'block';
    setTimeout(() => { history.back(); }, 800);
}
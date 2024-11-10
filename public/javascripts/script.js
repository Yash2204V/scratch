let menuBar = document.querySelector('#menuBar')
let mobileMenu = document.querySelector('#mobileMenu')
let closeMenu = document.querySelector('#closeMenu')
let closeIcon = document.querySelector('.close-icon');

menuBar.addEventListener('click', function(){
    mobileMenu.classList.remove('hidden')
})

closeMenu.addEventListener('click', function(){
    mobileMenu.classList.add('hidden')
})

let categoryBar = document.querySelector('#categoryBar')
let mobileCategory = document.querySelector('#mobileCategory')
let closeCategory = document.querySelector('#closeCategory')

categoryBar.addEventListener('click', function(){
    mobileCategory.classList.remove('hidden')
})

closeCategory.addEventListener('click', function(){
    mobileCategory.classList.add('hidden')
})
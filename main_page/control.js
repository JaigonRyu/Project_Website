

let astronaut = document.querySelector('.astronaut');
let moveBy = 20;


window.addEventListener('load', () => {
    astronaut.style.position = 'absolute';
    astronaut.style.left = 0;
    astronaut.style.top = 0;
});


window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowLeft':
            astronaut.style.left = parseInt(astronaut.style.left) - moveBy + 'px';
            break;
        case 'ArrowRight':
            astronaut.style.left = parseInt(astronaut.style.left) + moveBy + 'px';
            break;
        case 'ArrowUp':
            astronaut.style.top = parseInt(astronaut.style.top) - moveBy + 'px';
            break;
        case 'ArrowDown':
            astronaut.style.top = parseInt(astronaut.style.top) + moveBy + 'px';
            break;
    }


});

const openModalButtons = document.querySelectorAll('[data-modal-target]')
const closeModalButtons = document.querySelectorAll('[data-close-button]')
const overlay = document.getElementById('overlay')

openModalButtons.forEach(button => {
  button.addEventListener('click', () => {
    const modal = document.querySelector(button.dataset.modalTarget)
    openModal(modal)
  })
})

overlay.addEventListener('click', () => {
  const modals = document.querySelectorAll('.modal.active')
  modals.forEach(modal => {
    closeModal(modal)
  })
})

closeModalButtons.forEach(button => {
  button.addEventListener('click', () => {
    const modal = button.closest('.modal')
    closeModal(modal)
  })
})

function openModal(modal) {
  if (modal == null) return
  modal.classList.add('active')
  overlay.classList.add('active')
}

function closeModal(modal) {
  if (modal == null) return
  modal.classList.remove('active')
  overlay.classList.remove('active')
}

// import $ from 'jquery';

document.addEventListener('DOMContentLoaded', () => {
    //pop-up
    const popUp = document.querySelector('.pop-up');
    const cross = document.querySelector('.pop-up__cross');
    const edit = document.querySelector('.profile__info-text__link');

    //name and description
    const name = document.querySelector('#name');
    const description = document.querySelector('#description');

    //pop-up elements
    const inputName = document.querySelector('#nameInput');
    const inputDesc = document.querySelector('#descInput');
    const saveButton = document.querySelector('#save');

    inputName.value = name.innerHTML;
    inputDesc.value = description.innerHTML;

    edit.addEventListener('click', (e) => {
        e.preventDefault();
        popUp.classList.add('pop-up--active');
    });

    cross.addEventListener('click', (e) => {
        e.preventDefault();

        if(popUp.classList.contains('pop-up--active')) {
            popUp.classList.remove('pop-up--active');
            inputName.value = name.innerHTML;
            inputDesc.value = description.innerHTML;
        }
    });

    saveButton.addEventListener('click', (e) => {
        e.preventDefault();
        name.innerHTML = inputName.value;
        description.innerHTML = inputDesc.value;
        popUp.classList.remove('pop-up--active');
    });
});

// import $ from 'jquery';

$(() => {
  console.log('test');
  // SVGInject(document.querySelector("img.injectable"));

  const authBox = $('.auth-box');
  const loginForm = $('#loginForm');
  const buttonSend = $('.button--send');

  loginForm.on('submit', function(e) {
    e.preventDefault();

    var inputs = $($(this).find('.login-form__input'));
    var error = false;

    inputs.removeClass('error');
    buttonSend.removeClass('success');
    buttonSend.addClass('loading');

    setTimeout(function() {
      buttonSend.removeClass('loading');

      inputs.each(function() {
        if (! $(this).val()) {
          $(this).addClass('error');
          error = true;
        }
      });

      if (error) {
        authBox.addClass('error');

        setTimeout(function() {
          authBox.removeClass('error');
        }, 500);
      } else {
        buttonSend.addClass('success');
        buttonSend.find('.button__text').text('signed in...');
      }
    }, 1000);
  });

})

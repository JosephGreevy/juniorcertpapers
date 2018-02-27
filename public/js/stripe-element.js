(function() {
	'use strict';
	var elements = stripe.elements({
	fonts: [
	  {
	    cssSrc: 'https://fonts.googleapis.com/css?family=Source+Code+Pro',
	  },
	],
	locale: window.__exampleLocale
	});

  	// Floating Label Effect and Styling
	var inputs = document.querySelectorAll('.billing .input');
	Array.prototype.forEach.call(inputs, function(input) {
		input.addEventListener('focus', function() {
		  input.classList.add('focused');
		});
		input.addEventListener('blur', function() {
		  input.classList.remove('focused');
		});
		input.addEventListener('keyup', function() {
		  if (input.value.length === 0) {
		    input.classList.add('empty');
		  } else {
		    input.classList.remove('empty');
		  }
		});
	});
	var elementStyles = {
		base: {
		  color: '#32325D',
		  fontWeight: 500,
		  fontFamily: 'Source Code Pro, Consolas, Menlo, monospace',
		  fontSize: '16px',
		  fontSmoothing: 'antialiased',

		  '::placeholder': {
		    color: '#CFD7DF',
		  },
		  ':-webkit-autofill': {
		    color: '#e39f48',
		  },
		},
		invalid: {
		  color: '#E25950',

		  '::placeholder': {
		    color: '#FFCCA5',
		  },
		},
	};

	var elementClasses = {
		focus: 'focused',
		empty: 'empty',
		invalid: 'invalid'
	};

	// Actual Elements
	var cardNumber = elements.create('cardNumber', {
	    style: elementStyles,
	    classes: elementClasses,
	});
	cardNumber.mount('#card-number');

	var cardExpiry = elements.create('cardExpiry', {
	    style: elementStyles,
	    classes: elementClasses,
	});
	cardExpiry.mount('#card-expiry');

  var cardCvc = elements.create('cardCvc', {
    style: elementStyles,
    classes: elementClasses,
  });
  cardCvc.mount('#card-cvc');

  registerElement([cardNumber, cardExpiry, cardCvc]);
}) ();
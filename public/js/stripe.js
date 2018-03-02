var stripe = Stripe('pk_live_6WIWTGsC6tZbUNLB0lx8dGtK');
function registerElement(elements){
	console.log(elements);
	var mainElement = document.querySelector(".billing-element");
	var form = mainElement.querySelector('form');
	var error = form.querySelector('.bill-error');
  	var errorMessage = error.querySelector('.message');

  	// Error Messages
  	var savedErrors = {};
	elements.forEach(function(element, idx) {
		element.on('change', function(event) {
		  if (event.error) {
		    error.classList.add('visible');
		    savedErrors[idx] = event.error.message;
		    errorMessage.innerText = event.error.message;
		  } else {
		    savedErrors[idx] = null;

		    // Loop over the saved errors and find the first one, if any.
		    var nextError = Object.keys(savedErrors)
		      .sort()
		      .reduce(function(maybeFoundError, key) {
		        return maybeFoundError || savedErrors[key];
		      }, null);

		    if (nextError) {
		      // Now that they've fixed the current error, show another one.
		      errorMessage.innerText = nextError;
		    } else {
		      // The user fixed the last error; no more errors.
		      error.classList.remove('visible');
		    }
		  }
		});
	});
	form.addEventListener('submit', function(event) {
	  event.preventDefault();

	  stripe.createToken(elements[0]).then(function(result) {
	    if (result.error) {
	      // Inform the customer that there was an error.
	      error.textContent = result.error.message;
	    } else {
	      // Send the token to your server.
	      stripeTokenHandler(result.token);
	    }
	  });
	});
	function stripeTokenHandler(token) {
	  // Insert the token ID into the form so it gets submitted to the server
	  var hiddenInput = document.createElement('input');
	  hiddenInput.setAttribute('type', 'hidden');
	  hiddenInput.setAttribute('name', 'stripeToken');
	  hiddenInput.setAttribute('value', token.id);
	  form.appendChild(hiddenInput);

	  // Submit the form
	  form.submit();
	}
}
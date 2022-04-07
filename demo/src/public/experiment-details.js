(function () {
    'use strict';

    if (Mozilla.Cookies) {
        // store the experiment id (stored in a data-* attribute)
        const pageExperimentId =
            document.getElementById('content').dataset.experimentId;
        // get the currently chosen variation
        const variation = Mozilla.Cookies.getItem(pageExperimentId);
        // reference the element where we'll display the current variation
        const variationElement = document.getElementById('variation');
        // reference the button to clear the cookie for the current page's experiment
        const clearVariation = document.getElementById('clear-variation');

        // display the current variation
        variationElement.textContent = variation;

        // add an event listener to the button to clear the current experiment's cookie
        clearVariation.addEventListener('click', function () {
            // remove the cookie for this experiment
            Mozilla.Cookies.removeItem(pageExperimentId);

            // hack for page 3 (which has two experiments)
            if (pageExperimentId === 'experiment-page-3') {
                Mozilla.Cookies.removeItem('experiment-page-3-customcallback');
            }

            // redirect back to the home page
            window.location = '/';
        });
    }
})();

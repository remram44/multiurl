const TIMEOUT = 10000; // ms

// Parse a list of URLs from the current URL
let urls = [];
{
  let query = window.location.search;

  if(query.length > 0 && query[0] === '?') {
    query = query.substring(1);
  }

  if(query.length > 0) {
    for(let q of query.split(',')) {
      if(q.length > 0) {
        urls.push(q);
      }
    }
  }
}

let targetFound = false;

async function attempt(url) {
  let response;
  try {
    response = await fetch(
      url,
      {
        mode: 'no-cors',
        method: 'HEAD'
      }
    );
  } catch(e) {
    console.log('failed:', url, e);
    return;
  }
  if(response.status >= 400) {
    console.log('failed:', url, 'status', response.status);
    return;
  }
  if(targetFound) {
    return;
  }
  targetFound = true;

  // Start redirect
  console.log('redirecting to', url);
  document.getElementById('redirect-testing').style.display = 'none';
  document.getElementById('redirect-found').style.display = '';
  let link = document.getElementById('redirect-found').querySelector('a');
  link.setAttribute('href', url);
  link.innerText = url;
  setTimeout(() => { window.location.href = url; }, 1000);
}

function timeoutReached() {
  if(targetFound) {
    return;
  }
  targetFound = true;

  // Show error
  console.log('timeout reached');
  document.getElementById('redirect-testing').style.display = 'none';
  document.getElementById('redirect-none').style.display = '';
}

if(urls.length > 0) {
  // There are URLs present, redirect
  console.log('urls:', urls);

  // Show message
  document.getElementById('placeholder').style.display = 'none';
  document.getElementById('redirect').style.display = '';

  Promise.all(
    urls.map(attempt)
  ).then(() => {
    if(targetFound) {
      return;
    }
    targetFound = true;

    // Show error
    console.log('all failed');
    document.getElementById('redirect-testing').style.display = 'none';
    document.getElementById('redirect-none').style.display = '';
  });

  setTimeout(timeoutReached, 10000);
} else {
  // No URLs present, show multi URL creation form
  console.log('no urls');

  document.getElementById('placeholder').style.display = 'none';
  document.getElementById('new').style.display = '';

  let createButton = document.getElementById('create-button');

  let inputs = [];
  function onChange(e) {
    // If an input changes to be empty
    if(e.target.value !== '') {
      return;
    }

    // Find the last of the empty inputs
    let lastEmptyInput = null;
    for(let idx = 0; idx < inputs.length; ++idx) {
      if(inputs[idx].value === '') {
        lastEmptyInput = idx;
      }
    }

    // Remove all empty inputs except the last one
    inputs = inputs.filter((input, idx) => {
      if(idx != lastEmptyInput && input.value === '') {
        input.removeEventListener('change', onChange);
        input.removeEventListener('input', onInput);
        input.parentNode.parentNode.removeChild(input.parentNode);
        return false;
      }
      return true;
    });
  }
  function onInput(e) {
    // Update the result
    let createUrls = [];
    for(let input of inputs) {
      if(input.value !== '') {
        createUrls.push(input.value);
      }
    }
    let resultUrl = 'https://m.remram.fr/?' + createUrls.join(',');
    let result = document.getElementById('create-result');
    result.innerText = resultUrl;
    result.setAttribute('href', resultUrl);

    // If an input becomes not empty
    if(e.target.value !== '') {
      // Check whether there is an empty input
      let hasEmptyInput = false;
      for(let idx = 0; idx < inputs.length; ++idx) {
        if(inputs[idx].value === '') {
          hasEmptyInput = true;
        }
      }
      // If none, add one
      if(!hasEmptyInput) {
        let randId = Math.floor(Math.random() * 100000000);
        let newP = document.createElement('p');
        newP.innerHTML = `<label for="url${randId}">URL:</label> <input type="text" id="url${randId}" class="url-input"></p>`;
        document.getElementById('create').insertBefore(newP, createButton);
        let newInput = newP.querySelector('input.url-input');
        inputs.push(newInput);
        newInput.addEventListener('change', onChange);
        newInput.addEventListener('input', onInput);
      }
    }
  }
  document.getElementById('create').querySelectorAll('input.url-input').forEach(input => {
    inputs.push(input);
    input.addEventListener('change', onChange);
    input.addEventListener('input', onInput);
  });
}

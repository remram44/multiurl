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

  // TODO: creation form
}

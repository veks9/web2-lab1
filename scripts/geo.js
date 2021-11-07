function geoFindMe(loggedUsers) {
  const status = document.querySelector('#status');
  const mapLink = document.querySelector('#map-link');
  const osmmap = document.querySelector('#osm-map');

  var map = L.map(osmmap)
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  mapLink.textContent = '';

  function success(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const mapZoom = 14

    status.textContent = 'Your location:';
    mapLink.textContent = `Latitude: ${latitude}°, Longitude: ${longitude}°`;
    var target = L.latLng(latitude, longitude);
    if(user.isAuthenticated){
      postData('/refreshUsers', { latitude, longitude, user }).then(() => {
        getData('/loggedUsers').then(data => {
          loggedUsers = data.loggedUsers
          for(const user of loggedUsers){
            const marker = L.marker([user.location.latitude, user.location.longitude]).addTo(map);
            marker.bindPopup(`Name: ${user.name}<br>Email: ${user.email}<br>Timestamp: ${user.timestamp}`);
          }
          map.setView(target, mapZoom);    
        });
      });
      
      
    } else {
      L.marker(target).addTo(map);
      map.setView(target, mapZoom);    
    }
  }

  function error() {
    status.textContent = 'Unable to retrieve your location';
  }

  if (!navigator.geolocation) {
      status.textContent = 'Geolocation is not supported by your browser';
  } else {
  status.textContent = 'Locating…';
      navigator.geolocation.getCurrentPosition(success, error);
  }

}

if(user.isAuthenticated) {
  getData('/loggedUsers').then(data => {
    geoFindMe(data.loggedUsers)
  });
} else {
  geoFindMe([])
}

async function getData(url = '') {
  const response = await fetch(url, {
      method: 'GET'
  });

  return response.json();
}

async function postData(url = '', data = {}) {
  await fetch(url, {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json'
      },
      body: JSON.stringify(data) 
  });
}


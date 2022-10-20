const BASE_URL = 'https://pixabay.com/api';

function fetchApiGallery() {
  const params = new URLSearchParams({
    key: '30609342-292210cfdd781fb5e072ce5d7',

    page: 1,
    _limit: 40,
    q: `${inputUser}`,
    image_type: photo,
    orientation: horizontal,
    safesearch: true,
  });

  return fetch(`${BASE_URL}?${params}`).then(response => {
    if (!response.ok) {
      throw new Error(response.status);
    }
    return response.json();
  });
}

import { Notify } from 'notiflix/build/notiflix-notify-aio';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { refs } from './js/refs.js';

const BASE_URL = 'https://pixabay.com/api';
const API = '30609342-292210cfdd781fb5e072ce5d7';

let pageToFetch = 1;
let countPhoto = 40;
let keyword = '';

refs.moreBtnEl.classList.add('unvisible');

/////ЗАПРОС ДАННЫХ СЕРВЕР////////////////////////////

function fetchApiGallery() {
  const params = new URLSearchParams({
    key: API,
    page: `${pageToFetch}`,
    per_page: 40,
    _limit: 40,
    q: ` ${keyword}`,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
  });

  return fetch(`${BASE_URL}?${params}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(response.status);
      }
      return response.json();
    })
    .catch(error => console.log(error));
}

////ДЕЙСТВИЯ УСЛОВИЯ КАРТИНОК//////////////////////////

function onSearch(page, keyword) {
  fetchApiGallery(page, keyword)
    .then(galleryPhoto => {
      if (galleryPhoto.totalHits === 0) {
        refs.moreBtnEl.classList.add('unvisible');
        refs.galleryContainerEl.innerHTML = '';
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return;
      }

      if (countPhoto >= galleryPhoto.totalHits) {
        refs.moreBtnEl.classList.add('unvisible');
        Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
        return;
      }

      renderGallery(galleryPhoto);
      pageToFetch += 1;
      countPhoto += galleryPhoto.hits.length;

      if (galleryPhoto.totalHits >= 500) {
        refs.moreBtnEl.classList.remove('unvisible');
        Notify.success(`Hooray! We found ${galleryPhoto.totalHits} images`);
      }
    })
    .catch(error => console.log(error));
}

////Копка больше///////////////////////////////////////////////////
refs.moreBtnEl.addEventListener('click', addMorePhoto);

function addMorePhoto() {
  onSearch(pageToFetch, countPhoto, keyword);
  console.log(pageToFetch);
  console.log(countPhoto);
}
/////Операция Сабмит/////////////////
refs.formSearchEl.addEventListener('submit', event => {
  event.preventDefault();
  const searchQuery = event.target.elements.searchQuery.value;
  if (!searchQuery) {
    Notify.warning('Please, enter your request');
    return;
  }
  pageToFetch = 1;
  // console.log(galleryPhoto.hits.length);
  keyword = searchQuery.trim();
  refs.galleryContainerEl.innerHTML = '';
  onSearch(pageToFetch, countPhoto, keyword);
  // refs.formSearchEl.reset();
});

///КЛИК по ПОИСКУ////////////////////

refs.submitBtn.addEventListener('click', () => {
  if (keyword === '') {
    return;
  }
  onSearch(pageToFetch, countPhoto, keyword);
});

///РЕНДЕР КАРТИНОК/////////////////////////////////////
function renderGallery(galleryPhoto) {
  const markup = Object.values(galleryPhoto.hits)
    .map(photo => {
      return `<div class="photo-card"> <a href="${photo.largeImageURL}">
    <img src="${photo.webformatURL}" alt="${photo.tags}" loading="lazy" width='300' height='200'/> </a>
    <div class="info">
      <p class="info-item">
        <b>Likes</b> ${photo.likes}
      </p>
      <p class="info-item">
        <b>Views</b> ${photo.views}
      </p>
      <p class="info-item">
        <b>Comments</b> ${photo.comments}
      </p>
      <p class="info-item">
        <b>Downloads</b> ${photo.downloads}
      </p>
    </div>
  </div>`;
    })
    .join('');
  refs.galleryContainerEl.insertAdjacentHTML('beforeend', markup);

  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * -500,
    behavior: 'smooth',
  });

  const lightbox = new SimpleLightbox('.gallery a');

  lightbox.refresh();
}

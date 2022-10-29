import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '30693529-0739abc7bb5433c19d02cabbb';

let pageToFetch = 1;
let query = '';
let perPage = 40;

const refs = {
  form: document.querySelector('.search-form'),
  galleryItems: document.querySelector('.gallery'),
};

function fetchImages() {
  const params = new URLSearchParams({
    key: API_KEY,
    q: query,
    page: pageToFetch,
    per_page: 40,
    image_type: 'photo',
    orientation: 'orientation',
    safesearch: true,
  });

  return fetch(`${BASE_URL}?${params}`).then(response => {
    if (!response.ok) {
      throw new Error(response.status);
    }
    return response.json();
  });
}

function getImages() {
  fetchImages()
    .then(events => {
      handleSuccess(events);
      pageToFetch += 1;
      observer.observe(document.querySelector('.photo-card:last-child'));
    })
    .catch(handleError);
}

refs.form.addEventListener('submit', onFormSubmit);

function onFormSubmit(event) {
  event.preventDefault();
  query = event.target.elements.searchQuery.value.trim();

  pageToFetch = 1;
  refs.galleryItems.innerHTML = '';
  if (!query) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }
  getImages();
}

const observer = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        observer.unobserve(entry.target);
      }
      getImages();
    });
  },
  { threshold: 0.5 }
);

function handleSuccess(data) {
  const hits = data.hits;
  const totalPages = Math.ceil(data.totalHits / perPage);

  if (data.total === 0) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }

  createGalleryMarkup(hits);

  if (pageToFetch === totalPages) {
    Notify.warning(
      "We're sorry, but you've reached the end of search results."
    );
    return;
  }

  if (data.totalHits !== 0 && pageToFetch < 2) {
    Notify.success(`Hooray! We found ${data.totalHits} images.`);
  }

  new SimpleLightbox('.photo-link', {
    overlay: true,
    nav: true,
    docClose: true,
    animationSlide: true,
    close: true,
    enableKeyboard: true,
    overlayOpacity: 0.8,
  });
}

function handleError(error) {
  console.log(error);
}

function createGalleryMarkup(events) {
  const markup = events
    .map(
      ({
        largeImageURL,
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<a class='photo-link link' href="${largeImageURL}"><div class="photo-card">
  <img src="${webformatURL}" alt="${tags}" loading="lazy"/>
  <div class="info">
    <p class="info-item">
      <b><span class='text'>Likes</span> ${likes}</b>
    </p>
    <p class="info-item">
      <b><span class='text'>Views</span> ${views}</b>
    </p>
    <p class="info-item">
      <b><span class='text'>Comments</span> ${comments}</b>
    </p>
    <p class="info-item">
      <b><span class='text'>Downloads</span> ${downloads}</b>
    </p>
  </div>
</div>
</a>`;
      }
    )
    .join('');

  refs.galleryItems.insertAdjacentHTML('beforeend', markup);
}

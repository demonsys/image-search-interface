import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import OnlyScroll from 'only-scrollbar';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import ImagesApi from './fetchImages.js';
const refs = {
  searchForm: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  searchQuery: document.querySelector('input[name="searchQuery"]'),
  loadMore: document.querySelector('.load-more'),
};
const imagesApi = new ImagesApi();
refs.searchForm.addEventListener('submit', onSearch);
const renderPage = async () => {
  try {
    const images = await imagesApi.fetchImages();
    if (imagesApi.totalHits === 0) {
      return Notify.info(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
    if (imagesApi.totalHits > 0 && imagesApi.page === 1) {
      Notify.info(`Hooray! We found ${imagesApi.totalHits} images.`);
    }
    if (imagesApi.totalHits > imagesApi.imagesPerPage) {
      refs.loadMore.classList.remove('hidden');
      refs.loadMore.addEventListener('click', renderMore);
    }
    if (
      imagesApi.totalHits <= imagesApi.page * imagesApi.imagesPerPage &&
      imagesApi.page !== 1
    ) {
      refs.loadMore.classList.add('hidden');
      refs.loadMore.removeEventListener('click', renderMore);
      Notify.info("We're sorry, but you've reached the end of search results.");
    }
    images.hits.map(renderCard);
    const scroll = new OnlyScroll(document.scrollingElement);
    return imagesApi.totalHits;
  } catch (error) {
    Notify.failure(error.message);
    console.log(error);
  }
};
function onSearch(e) {
  e.preventDefault();
  refs.gallery.innerHTML = '';
  imagesApi.resetPage();
  refs.loadMore.classList.add('hidden');
  imagesApi.searchQuery = e.target.elements.searchQuery.value.trim();
  if (imagesApi.searchQuery === '') {
    return Notify.info('Please enter a search query');
  }
  renderPage();
}
async function renderMore() {
  refs.loadMore.classList.add('hidden');
  await renderPage();
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
function renderCard(card) {
  const {
    webformatURL,
    tags,
    likes,
    views,
    comments,
    downloads,
    largeImageURL,
  } = card;
  const markup = `
  <div class="photo-card">
  <a href='${largeImageURL}' class='photo-link'>
    <img src="${webformatURL}$" alt="${tags}" loading="lazy"/>
    </a>
      <div class="info">
      <p class="info-item">
        <b>Likes</b>
        ${likes}
      </p>
      <p class="info-item">
        <b>Views</b>
        ${views}
      </p>
      <p class="info-item">
        <b>Comments</b>
        ${comments}
      </p>
      <p class="info-item">
        <b>Downloads</b>
       ${downloads}
      </p>
    </div>
  </div>`;
  refs.gallery.insertAdjacentHTML('beforeend', markup);
  gallery.refresh();
}
let gallery = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import ImagesApi from './fetchImages.js';
const refs = {
  searchForm: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  searchQuery: document.querySelector('input[name="searchQuery"]'),
  endOfPage: document.querySelector('.endOfPage'),
  searchBtn: document.querySelector('.searchBtn'),
};
const imagesApi = new ImagesApi();
// Создаю элементы бесконечного скролла
const observerCallback = entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && imagesApi.searchQuery !== '') renderPage();
  });
};
const observer = new IntersectionObserver(observerCallback, {
  rootMargin: '250px',
});
refs.searchForm.addEventListener('submit', onSearch);
// делаю запрос на сервер и прогоняю полученные элементы через функцию вывода на html страницу
const renderPage = async () => {
  observer.unobserve(refs.endOfPage);
  try {
    const cards = await imagesApi.fetchImages();
    if (imagesApi.totalHits === 0) {
      return Notify.info(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
    renderAllCards(cards);
    if (imagesApi.totalHits > 0 && imagesApi.page === 1)
      Notify.info(`Hooray! We found ${imagesApi.totalHits} images.`);
    if (
      imagesApi.totalHits <= imagesApi.page * imagesApi.imagesPerPage &&
      imagesApi.page !== 1
    ) {
      return Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }
    // Если результатов запроса больше, чем 1 страница, то включаем автоскролл
    if (imagesApi.totalHits > imagesApi.imagesPerPage)
      observer.observe(refs.endOfPage);
  } catch (error) {
    Notify.failure(error.message);
    console.log(error);
  } finally {
    if (imagesApi.page === 1) refs.searchBtn.classList.remove('spinner');
  }
};
//При нажатии кнопки поиска сбрасываем все предыдущие результаты и, если запрос не пустой, запускаем вывод новых рез-тов
function onSearch(e) {
  e.preventDefault();
  imagesApi.resetPage();
  refs.gallery.innerHTML = '';
  imagesApi.searchQuery = e.target.elements.searchQuery.value.trim();
  if (imagesApi.searchQuery === '') {
    return Notify.info('Please enter a search query');
  }
  refs.searchBtn.classList.add('spinner');
  renderPage();
}
// Добавление на страницу одной карточки
function markupCard(card) {
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
  return markup;
}
function renderAllCards(cards) {
  const markup = cards.map(markupCard).join('');
  refs.gallery.insertAdjacentHTML('beforeend', markup);
  gallery.refresh();
}
//Добавляю плагин для просмотра увеличенных изображений
let gallery = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

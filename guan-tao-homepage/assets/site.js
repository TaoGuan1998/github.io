(() => {
  const search = document.getElementById('paper-search');
  const year = document.getElementById('paper-year');
  if (!search || !year) return;
  const papers = [...document.querySelectorAll('.paper')];
  const count = document.getElementById('result-count');
  const empty = document.getElementById('no-results');
  const filter = () => {
    const words = search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    let visible = 0;
    for (const paper of papers) {
      const match = (year.value === 'all' || paper.dataset.year === year.value) && words.every(word => paper.dataset.search.includes(word));
      paper.hidden = !match;
      if (match) visible++;
    }
    count.textContent = `${visible} ${count.dataset.suffix}`;
    empty.hidden = visible !== 0;
  };
  search.addEventListener('input', filter);
  year.addEventListener('change', filter);
})();

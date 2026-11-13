
const form = document.querySelector('#create-form');
const input = document.querySelector('#url');
const list = document.querySelector('#links');
const status = document.querySelector('#status');

async function loadLinks() {
  const res = await fetch('/api/links');
  const { links } = await res.json();
  list.innerHTML = '';
  for (const link of links) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `/${link.code}`;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = link.code;
    const span = document.createElement('span');
    span.className = 'url';
    span.textContent = link.url;
    li.append(a, span);
    list.appendChild(li);
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  status.textContent = '';
  const res = await fetch('/api/links', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url: input.value })
  });
  if (!res.ok) {
    status.style.color = '#ff9c9c';
    status.textContent = 'Некорректная ссылка';
    return;
  }
  const { shortUrl } = await res.json();
  status.style.color = '#9fe1a1';
  status.textContent = `Готово: ${shortUrl}`;
  input.value = '';
  loadLinks();
});

loadLinks();
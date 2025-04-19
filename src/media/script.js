function toggleCard(card) {
	const isExpanded = card.getAttribute('data-expanded') === 'true';
	card.setAttribute('data-expanded', !isExpanded);
	const content = card.querySelector('.summary-content');
	content.style.display = isExpanded ? 'none' : 'block';
}

function handleSearch(event) {
	const query = event.target.value.toLowerCase();
	const cards = document.querySelectorAll('.file-card');

	cards.forEach((card) => {
		const fileName = card.querySelector('.file-name').textContent.toLowerCase();
		const path = card.querySelector('.file-path').textContent.toLowerCase();
		const matches = fileName.includes(query) || path.includes(query);
		card.style.display = matches ? 'block' : 'none';
	});
}

document.addEventListener('DOMContentLoaded', () => {
	document.querySelectorAll('.file-header').forEach((header) => {
		header.addEventListener('click', () => {
			toggleCard(header.parentElement);
		});
	});
});

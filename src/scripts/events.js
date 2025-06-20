const dropdown = document.querySelector('#city-select')
const selected = dropdown.querySelector('#city-select__selected')
const options = dropdown.querySelector('#city-select__options')

selected.addEventListener('click', () => {
  options.classList.toggle('hidden')
})

options.querySelectorAll('.city-select__option').forEach(option => {
  option.addEventListener('click', () => {
    selected.textContent = option.textContent
    options.classList.add('hidden')
    console.log(option.dataset.value)
  })
})

document.addEventListener('click', (e) => {
  if (!dropdown.contains(e.target)) {
    options.classList.add('hidden')
  }
})
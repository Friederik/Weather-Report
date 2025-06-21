// API -----------------------------------------------

function postData(data) {
    const current = {
        temp: data.current.temp_c,
        tempFeels: data.current.feelslike_c,
        wind: (data.current.wind_kph / 3.6).toFixed(0),
        condition: data.current.condition.text,
        icon: 'https:' + data.current.condition.icon
    }

    document.querySelector('#current-temp').textContent = current.temp
    document.querySelector('#current-temp-feels').textContent = current.tempFeels
    document.querySelector('#current-wind').textContent = current.wind
    document.querySelector('#current-condition').textContent = current.condition
    document.querySelector('#current-icon').src = current.icon  
}


function request() {
    const requestData = {
        city: 'Ekaterinburg',
    }    
    return {
        async getData() {
            const api = `http://api.weatherapi.com/v1/` +
                        `forecast.json?key=7b7ba9234b984c6eba9115539251906` +
                        `&q=${requestData.city}` +
                        `&lang=ru` +
                        `&days=3&aqi=no&alerts=no`
            fetch(api)
                .then((res) => {
                    if (!res.ok) throw new Error('Ошбика загрузки')
                    return res.json()
                })
                .then((data) => {
                    postData(data)
                })
                .catch((err) => {
                    console.log(err)
                })
        },
        changeCity(cityName) {
            requestData.city = cityName
            console.log(`Выбран город: ${requestData.city}`)
        }
    }  
}

const requestConfig = request()
requestConfig.getData()



// EVENTS --------------------------------------------------------------------

const dropdown = document.querySelector('#city-select')
const selected = dropdown.querySelector('#city-select__selected')
const options = dropdown.querySelector('#city-select__options')

selected.addEventListener('click', () => {
  options.classList.toggle('hidden')
})

options.querySelectorAll('.city-select__option').forEach(option => {
  option.addEventListener('click', async () => {
    selected.textContent = option.textContent
    options.classList.add('hidden')
    requestConfig.changeCity(option.dataset.value)
    await requestConfig.getData()
  })
})

document.addEventListener('click', (e) => {
  if (!dropdown.contains(e.target)) {
    options.classList.add('hidden')
  }
})

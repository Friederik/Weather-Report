// API -----------------------------------------------

function convertData(data) {
    const current = {
        temp: data.current.temp_c.toFixed(0),
        tempFeels: data.current.feelslike_c.toFixed(0),
        wind: (data.current.wind_kph / 3.6).toFixed(0),
        condition: data.current.condition.text,
        icon: 'https:' + data.current.condition.icon
    }

    const forecast = data.forecast.forecastday.map((date) => {
        return {
            time: new Date(date.date),
            temp: date.day.avgtemp_c.toFixed(0),
            tempFeels: date.day.avgtemp_c.toFixed(0),
            wind: (date.day.maxwind_kph / 3.6).toFixed(0),
            condition: date.day.condition.text,
            icon: 'https:' + date.day.condition.icon,
            hours: date.hour.map((oneHour) => {
                return {
                    time: new Date(oneHour.time),
                    temp_c: (oneHour.temp_c).toFixed(0),
                    icon: 'https:' + oneHour.condition.icon,
                    rain: oneHour.chance_of_rain
                }
            })
        }
    })

    return {
        current: current,
        forecast: forecast
    }
}

function renderPreviews(data) {
    console.log('w',data.current)
    renderCurrent(data.current)

    const days = [
        document.querySelector('#now'),
        document.querySelector('#tomorrow'),
        document.querySelector('#after-tomorrow'),
    ]

    days.forEach((day, index) => {
        const thisDayData = data.forecast[index]
        day.querySelector('.weather-data__date-number').textContent = thisDayData.time
        day.querySelector('.weather-data__temp-text').textContent = thisDayData.temp
        day.querySelector('.condition-icon').src = thisDayData.icon
    })
}

function renderCurrent(data) {
    document.querySelector('#current-temp').textContent = data.temp
    document.querySelector('#current-temp-feels').textContent = data.tempFeels
    document.querySelector('#current-wind').textContent = data.wind
    document.querySelector('#current-condition').textContent = data.condition
    document.querySelector('#current-icon').src = data.icon 
}

function request() {
    const requestData = {
        city: 'Ekaterinburg',
        current: {},
        forecast: {}
    }    
    return {
        async getData() {
            const api = `https://api.weatherapi.com/v1/` +
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
                    const normalizedData = convertData(data)
                    requestData.current = normalizedData.current
                    requestData.forecast = normalizedData.forecast
                    console.log(requestData)
                    
                    renderPreviews(requestData)
                })
                .catch((err) => {
                    console.log(err)
                })
        },
        changeCity(cityName) {
            requestData.city = cityName
            console.log(`Выбран город: ${requestData.city}`)
        },
        getDownloadedData() {
            return {...requestData}
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


const buttons = [
    document.querySelector('#current-time'),
    document.querySelector('#now'),
    document.querySelector('#tomorrow'),
    document.querySelector('#after-tomorrow')
]


buttons.forEach((butt) => {
    butt.addEventListener('click', () => {
        buttons.forEach((b) => {
            b.classList.remove('button--selected')
        })
        butt.classList.add('button--selected')

        const data = requestConfig.getDownloadedData()
        switch (butt.id) {
            case 'current-time':
                console.log(data.current)
                renderCurrent(data.current)
                break
            case 'now':
                console.log(data.forecast[0])
                renderCurrent(data.forecast[0])
                break
            case 'tomorrow':
                console.log(data.forecast[1])
                renderCurrent(data.forecast[1])
                break
            case 'after-tomorrow':
                console.log(data.forecast[2])
                renderCurrent(data.forecast[2])
                break     
        }
    })
})


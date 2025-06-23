// API -----------------------------------------------------------------------

function convertData(data) {
    const current = {
        time: new Date(data.location.localtime),
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
                    wind: (oneHour.wind_kph / 3.6).toFixed(0),
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

function request() {
    const requestData = {
        city: 'Ekaterinburg',
        current: {},
        forecast: {}
    }    
    return {
        async getData() {
            renderLoading()
            await new Promise(res => setTimeout(res, 1000))
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
                    renderError()
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


// RENDER -----------------------------------------------------------------------

function renderLoading() {
    renderCurrent({
        temp: '-',
        tempFeels: '-',
        wind: '-',
        condition: 'Загрузка...',
        icon: 'src/assets/rain.gif'
    })

    document.querySelector('.weather-forecast__hours').innerHTML = `
        <article class="weather-forecast__hour">
            <div class="temp-status temp-status--loading">
                <div class="temp-status__good temp-status__good--loading"></div>
            </div>
        </article>
    `
}

function renderError() {
    document.querySelector('#current-icon').src = 'src/assets/error.png'
    document.querySelector('.temp-status__good').classList.remove('temp-status__good--loading')
    document.querySelector('.temp-status__good').classList.add('temp-status__good--error')
}

function renderForecastHour(hourData, goodData) {
    const hour = document.createElement('div')
   
    const time = hourData.time.getHours() + ':' + String(hourData.time.getMinutes()).padStart(2, '0')
    const goodK = (hourData.temp_c - goodData.min) / goodData.oneT
    const rainAsset = Math.floor(hourData.rain / 25)

    hour.innerHTML = `
        <article class="weather-forecast__hour">
            <h3 class="weather-forecast__time">${time}</h3>
            <img src="${hourData.icon}" alt="" class="condition-icon condition-icon--mini">
            <p class="weather-forecast__temp">${hourData.temp_c} °C</p>
            <div class="temp-status">
                <div style="width: ${goodK}%" class="temp-status__good"></div>
            </div>
            <div class="weather-forecast__second-data">
                <img src="src/assets/wind.png" alt="" class="condition-icon condition-icon--xmini">
                <p class="weather-forecast__wind">${hourData.wind} м/с</p>
            </div>
            <div class="weather-forecast__second-data">
                <img src="src/assets/rain-${rainAsset}.png" alt="" class="condition-icon condition-icon--xmini">
                <p class="weather-forecast__rain">${hourData.rain}%</p>
            </div>
        </article>
    `

    return hour
}

function renderPreviews(data) {
    console.log(data.current)
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

    renderForecastHours(data.forecast[0].hours)
}

function renderForecastHours(hoursData) {
    console.log(hoursData)
    const hours = document.querySelector('#forecast-block')
    const tempMinMax = hoursData.reduce((acc, hour) => {
        hour.temp_c = Number(hour.temp_c)
        return [acc[0] < hour.temp_c ? acc[0] : hour.temp_c, acc[1] > hour.temp_c ? acc[1] : hour.temp_c]
    }, [100, -100]) 
    console.log(tempMinMax)

    hours.innerHTML = ''
    hoursData.forEach((hour) => {
        hours.appendChild(renderForecastHour(hour, {
            min: tempMinMax[0],
            oneT: (tempMinMax[1] - tempMinMax[0]) / 100
        }))
    })
    
}

function renderCurrent(data) {
    document.querySelector('#current-temp').textContent = data.temp
    document.querySelector('#current-temp-feels').textContent = data.tempFeels
    document.querySelector('#current-wind').textContent = data.wind
    document.querySelector('#current-condition').textContent = data.condition
    document.querySelector('#current-icon').src = data.icon 
}

// EVENTS --------------------------------------------------------------------

const dropdown = document.querySelector('#city-select')
const selected = dropdown.querySelector('#city-select__selected')
const options = dropdown.querySelector('#city-select__options')

const buttons = [
    document.querySelector('#current-time'),
    document.querySelector('#now'),
    document.querySelector('#tomorrow'),
    document.querySelector('#after-tomorrow')
]

selected.addEventListener('click', () => {
  options.classList.toggle('hidden')
})

options.querySelectorAll('.city-select__option').forEach(option => {
  option.addEventListener('click', async () => {
    selected.textContent = option.textContent
    options.classList.add('hidden')
    requestConfig.changeCity(option.dataset.value)
    buttons.forEach((butt) => {
        butt.classList.remove('button--selected')
    })
    buttons[0].classList.add('button--selected')
    await requestConfig.getData()
  })
})

document.addEventListener('click', (e) => {
  if (!dropdown.contains(e.target)) {
    options.classList.add('hidden')
  }
})

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



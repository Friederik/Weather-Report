fetch('http://api.weatherapi.com/v1/forecast.json?key=7b7ba9234b984c6eba9115539251906&q=Ekaterinburg&days=1&aqi=no&alerts=no')
    .then((res) => {
        if (!res.ok) throw new Error('Ошбика загрузки')
        return res.json()
    })
    .then((data) => {
        console.log(data)
    })
    .catch((err) => {
        console.log(err)
    })

function log(arg) {
    console.log(arg)
}

export { log }
const dinner = {
    meal: 'tacos'
}

const handler = {
    get (target, key, instance) {
        console.log('meal被获取')
        console.log(instance)
        return target[key]
    },
    set (target, key, value, instance) {
        if (value !== target[key]) {
            console.log('meal被重新赋值')
            target[key] = value
        }
    }
}

const proxy = new Proxy(dinner, handler)


console.log('dinner.meal before set: ' + proxy.meal)

// 重新赋相同的值
proxy.meal = 'tacos'

// 重新赋新的值
// proxy.meal = 'pizza'

console.log('dinner.meal after set: ' + proxy.meal)
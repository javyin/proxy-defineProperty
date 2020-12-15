const dinner = {
    meal: 'tacos'
}

function defineReactive (target, key, value) {
    // observer -> if(value == 'object') -> defineReactive
    // array -> Object.setPrototypeof
    Object.defineProperty(target, key, {
        get () {
            console.log('meal被获取')
            return value
        },
        set (newValue) {
            if (newValue !== value) {
                console.log('meal被重新赋值')
                //  updateView()  更新视图
                value = newValue
            }
        }
    })
}

for (let key in dinner) {
    defineReactive(dinner, key, dinner[key])
}

console.log('dinner.meal before set: ' + dinner.meal)

// 重新赋相同的值
dinner.meal = 'tacos'

// 重新赋新的值
// dinner.meal = 'pizza'

console.log('dinner.meal after set: ' + dinner.meal)
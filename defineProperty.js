//  视图渲染函数
function render () {
    console.log('视图更新模拟')
}

// 需要侦测的对象
const data = {
    name: 'javyin',
    age: 18
}

// 数据劫持
observer(data)

function observer (target) {
    if (target == null || typeof target !== 'object') {
        return target
    }
    for (let key in target) {
        defineReactive(target, key, target[key])
    }
}

function defineReactive (target, key, value) {
    observer(value)     // 递归子属性
    Object.defineProperty(target, key, {
        enumerable: true,   // 可枚举（可遍历）
        configurable: true,     // 可配置（比如可以删除）
        get () {
            console.log('get ' + value)
            return value
        },
        set (newValue) {
            if (newValue !== value) {
                observer(newValue)  //  如果赋值的是一个对象，也需要递归子属性
                console.log('set ', newValue)
                render()
                value = newValue
            }
        }
    })
}

// 重新赋相同的值
// data.age = 18

// 重新赋新的值
data.age = 20

// 获取属性
data.name
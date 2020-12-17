// vue2 如何实现响应式原理
// 数据变化，视图更新
//  视图渲染函数
function render () {
    console.log('视图更新模拟')
}

// 需要侦测的对象
const data = {
    name: 'javyin',
    age: 18,
    hobby: ['running', 'cycling']
}


let oldArrayPrototype = Array.prototype		// 获取数组原来的原型
let proto = Object.create(oldArrayPrototype)  // 创建继承一个自己的原型
let methods = ['pop', 'push', 'shift', 'unshift', 'sort', 'reverse', 'splice']

//  重写methods方法
methods.forEach(method => {
    proto[method] = function () {
        // 函数劫持，把函数进行重写，内部继续调用老方法
        oldArrayPrototype[method].call(this, ...arguments)
        console.log('监听到数组变化')
        console.log(this)
        render() // 更新视图
    }
})

// 数据劫持
observer(data)

function observer (target) {
    if (target == null || typeof target !== 'object') {
        return target
    }
    if (Array.isArray(target)) {
        // 拦截数组，给数组的方法进行重写
        Object.setPrototypeOf(target, proto)
        for (let i = 0; i < target.length; i++) {
            observer(target[i])
        }
    } else {
        for (let key in target) {
            defineReactive(target, key, target[key])
        }
    }
}

function defineReactive (target, key, value) {
    observer(value)
    Object.defineProperty(target, key, {
        get () {
            return value
        },
        set (newValue) {
            if (value !== newValue) {
                observer(newValue)
                render()
                value = newValue
            }
        }
    })
}

data.hobby.push('games')	// 监听到数组变化 ['running', 'cycling', 'games'] 视图更新模拟
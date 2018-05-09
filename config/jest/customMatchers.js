expect.extend({
    toHaveStyle(reactWrapper, props) {
        if (!reactWrapper || !('getDOMNode' in reactWrapper)) {
            return {
                message: () => this.utils.printWithType('以下没有getDOMNode()方法', reactWrapper, value => value),
                pass: false,
            };
        }
        const elm = reactWrapper.getDOMNode();
        if (props.style) {
            const pass = Object.entries(props.style).every(([key, value]) => elm.style[key] === value);
            const expected = this.utils.printReceived(elm.style);
            const received = this.utils.printExpected(props.style);
            if (pass) {
                return {
                    message: () => `预期 ${expected} 支持样式 ${received}`,
                    pass: true,
                };

            } else {
                return {
                    message: () => `预期 ${expected} 不支持样式 ${received}`,
                    pass: false,
                };
            }
        }
        if (props.className) {
            const pass = props.className.split(' ').filter(Boolean).every(cls => elm.classList.contains(cls));
            const expected = this.utils.printReceived(elm.className);
            const received = this.utils.printExpected(props.className);
            if (pass) {
                return {
                    message: () =>
                        `预期 ${expected} 支持样式类 ${received}`,
                    pass: true,
                };
            } else {
                return {
                    message: () => `预期 ${expected} 不支持样式类 ${received}`,
                    pass: false,
                };
            }
        }
    },
})
class ClampCalculator {
	constructor() {
		this.inputs = {
			"font-size-min": null,
			"font-size-max": null,
			"viewport-width-min": null,
			"viewport-width-max": null,
			"root-font-size": null
		}

		this.init()
	}

	limitDecimals(value, decimals = 3) {
		return parseFloat(value.toFixed(decimals))
	}

	toRem(px, base = 16) {
		return this.limitDecimals(px / base)
	}

	calculate() {
		const change = (this.inputs["font-size-max"].value - this.inputs["font-size-min"].value) / (this.inputs["viewport-width-max"].value - this.inputs["viewport-width-min"].value)

		const startingFontSize = this.toRem(this.inputs["font-size-max"].value - this.inputs["viewport-width-max"].value * change, this.inputs["root-font-size"].value)
		const variableFontSize = this.limitDecimals(change * 100)

		this.output.value = `clamp(${this.toRem(this.inputs["font-size-min"].value, this.inputs["root-font-size"].value)}rem, ${startingFontSize}rem + ${variableFontSize}vw, ${this.toRem(this.inputs["font-size-max"].value, this.inputs["root-font-size"].value)}rem)`

		this.howBase.innerHTML = `${this.inputs["root-font-size"].value}px`

		this.howX.innerHTML = `Change = (fontSizeMax - fontSizeMin) / (viewportWidthMax - viewportWidthMin)
Change = (${this.inputs["font-size-max"].value}px - ${this.inputs["font-size-min"].value}px) / (${this.inputs["viewport-width-max"].value}px - ${this.inputs["viewport-width-min"].value}px)
Change = ${this.limitDecimals(change, 5)}`

		this.howA.innerHTML = `A = fontSizeMax - viewportWidthMax * X
A = ${this.inputs["font-size-max"].value}px - ${this.inputs["viewport-width-max"].value}px * ${this.limitDecimals(change, 5)}
A = ${this.limitDecimals(this.inputs["font-size-max"].value - this.inputs["viewport-width-max"].value * change)}px = ${startingFontSize}rem`

		this.howB.innerHTML = `B = X * 100vw
B = ${this.limitDecimals(change, 5)} * 100vw
B = ${variableFontSize}vw`

		this.howResult.innerHTML = `Result = clamp(fontSizeMin, A + B, fontSizeMax)
Result = clamp(${this.toRem(this.inputs["font-size-min"].value, this.inputs["root-font-size"].value)}rem, ${startingFontSize}rem + ${variableFontSize}vw, ${this.toRem(this.inputs["font-size-max"].value, this.inputs["root-font-size"].value)}rem)`
	}

	init() {
		const params = new URLSearchParams(window.location.search)

		Object.keys(this.inputs).forEach((id) => {
			this.inputs[id] = document.getElementById(id)
			if (params.get(id)) {
				this.inputs[id].value = params.get(id)
			}
		})

		this.form = document.getElementById("clamp-calculator")
		this.form.addEventListener("submit", (event) => {
			event.preventDefault()
			this.calculate()
			this.output.focus()
		})
		this.form.addEventListener("reset", (event) => {
			event.preventDefault()
			Object.values(this.inputs).forEach((element) => {
				element.value = element.dataset.default
			})
			this.calculate()
		})

		this.output = document.getElementById("output")
		this.howBase = document.getElementById("how-base")
		this.howX = document.getElementById("how-x")
		this.howA = document.getElementById("how-a")
		this.howB = document.getElementById("how-b")
		this.howResult = document.getElementById("how-result")

		this.calculate()
	}
}

if ("HTMLElement" in window) {
	window.ClampCalculator = new ClampCalculator()
}

export default ClampCalculator

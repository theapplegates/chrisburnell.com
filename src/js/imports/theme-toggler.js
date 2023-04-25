class ThemeToggler {
	constructor() {
		this.STORAGE_KEY = "theme"
		this.theme = localStorage.getItem(this.STORAGE_KEY)

		this.select = document.getElementById("theme-toggler")
		this.options = this.select.querySelectorAll("option")

		this.init()
	}

	get prefersDark() {
		return window.matchMedia("(prefers-color-scheme: dark)").matches
	}

	setTheme(id) {
		document.documentElement.setAttribute(`data-${this.STORAGE_KEY}`, id)
	}

	setSelected(id) {
		this.options.forEach((option) => {
			if (option.value === id) {
				option.setAttribute("selected", "selected")
			}
		})
	}

	init() {
		this.select.addEventListener("change", this.onChange.bind(this))

		if (this.theme) {
			this.setTheme(this.theme)
			this.setSelected(this.theme)
		} else if (this.prefersDark) {
			this.setTheme("dark")
			this.setSelected("dark")
		}
	}

	onChange() {
		this.theme = [...this.options].filter((option) => option.selected).map((option) => option.getAttribute("value"))[0]

		this.setTheme(this.theme)
		localStorage.setItem(this.STORAGE_KEY, this.theme)
	}
}

if ("HTMLElement" in window) {
	window.ThemeToggler = new ThemeToggler()
}

export default ThemeToggler

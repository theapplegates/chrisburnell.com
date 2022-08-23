const site = require("#data/site")
const webmentionsConfig = require("../data/webmentionsConfig.js")

const dateFilters = require("#filters/dates")

const Webmentions = require("@chrisburnell/eleventy-cache-webmentions")(null, webmentionsConfig)

module.exports = async () => {
	const webmentionsByUrl = await Webmentions()

	return {
		layout: "post",
		tags: ["post"],
		list: "deck",
		mf_root: "entry",
		show_webmentions: true,
		eleventyComputed: {
			webmentions: (data) => {
				const webmentionsForUrl = webmentionsByUrl[site.url + data.page.url] || []

				if (webmentionsForUrl.length) {
					return webmentionsForUrl.sort((a, b) => dateFilters.epoch(a.data.published || a.verified_date) - dateFilters.epoch(b.data.published || b.verified_date))
				}
				return []
			},
		},
	}
}

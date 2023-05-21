const { codepen } = require("#data/author")

module.exports = {
	list: "deck",
	permalink: "code/{{ page.fileSlug }}/",
	category: "code",
	categoryProper: "code snippet",
	categoryProperPlural: "code snippets",
	categoryCode: "c",
	tags: ["code", "blog"],
	on_this_day: true,
	eleventyComputed: {
		syndicate_to: (data) => {
			if (data.codepen_slug) {
				return [`https://codepen.io/${codepen}/pen/${data.codepen_slug}`, ...data.syndicate_to]
			}
			return data.syndicate_to
		},
	},
}

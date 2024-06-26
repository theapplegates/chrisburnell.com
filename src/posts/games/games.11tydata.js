import emojis from "../../eleventy/data/emojis.js"

export default {
	permalink: "game/{{ page.fileSlug }}/",
	list: "shelf",
	wide: true,
	shelfAlignment: "square",
	mf_root: "review",
	mf_property: "play-of",
	category: "game",
	categoryProper: "game review",
	categoryPlural: "games",
	categoryProperPlural: "game reviews",
	categoryCode: "g",
	tags: ["game", "review"],
	emoji: emojis.game,
}

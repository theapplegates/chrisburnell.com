const EleventyFetch = require("@11ty/eleventy-fetch")
const { getWebmentions } = require("@chrisburnell/eleventy-cache-webmentions")()

const { cacheDurations, favicon, title, url } = require("#data/site")
const { untappd } = require("#data/author")
const configWebmentions = require("#datajs/config/webmentions")
const people = require("#datajs/people")

const { friendlyDateLong } = require("#filters/dates")
const { getHost, getPerson } = require("#filters/queries")
const { markdownFormat } = require("#filters/strings")

const getType = (data) => {
	const type = data?.bookmark_of || data?.drink_of || data?.like_of || data?.listen_of || data?.play_of || data?.read_of || data?.watch_of || data?.link
	return {
		url: type?.url || type || false,
		title: type?.title || type?.url || type || false,
	}
}

const getExternalLikes = async (syndicationLinks) => {
	if (syndicationLinks) {
		const matchingLinks = syndicationLinks.filter((link) => {
			return link.includes("https://dev.to")
		})

		if (matchingLinks.length) {
			const articles = await EleventyFetch(`https://dev.to/api/articles?username=${author["dev_to"]}`, {
				duration: cacheDurations.weekly,
				type: "json",
				fetchOptions: {
					method: "GET",
				},
			})

			const matchingArticles = articles.filter((article) => {
				return matchingLinks[0] === article["url"]
			})

			if (matchingArticles.length) {
				return matchingArticles[0]["positive_reactions_count"] || 0
			}
		}
	}
	return 0
}

module.exports = {
	layout: "post",
	tags: ["post"],
	list: "deck",
	mf_root: "entry",
	show_responses: true,
	eleventyComputed: {
		canonical: (data) => url + data.page.url,
		of_url: (data) => getType(data).url,
		of_title: (data) => getType(data).title,
		meta_title: (data) => {
			let category
			if (data.category) {
				category = (data.categoryProper || data.category).charAt(0).toUpperCase() + (data.categoryProper || data.category).substring(1)
			}
			if (data.category && getType(data).title) {
				return `${category} of “${(data.title || getType(data).title).replace(/(<([^>]+)>)/gi, "")}”`
			} else if (data.title) {
				return data.title.replace(/(<([^>]+)>)/gi, "")
			} else if (data.category) {
				return `${category} from ${friendlyDateLong(data.page.date)}`
			}
			return title.replace(/(<([^>]+)>)/gi, "")
		},
		meta_description: (data) => {
			if (data.description) {
				return markdownFormat(data.description)
					.replace("\n", " ")
					.replace(/(<([^>]+)>)/gi, "")
			} else if (data.category) {
				const category = (data.categoryProper || data.category).charAt(0).toUpperCase() + (data.categoryProper || data.category).substring(1)
				return `A ${category} on ${getHost(url)}`
			}
			return `A page on ${getHost(url)}`
		},
		meta_image: (data) => {
			if (data.banner || data.cover) {
				return `${url}/images/built/${(data.banner || data.cover).replace("jpg", "jpeg")}`
			} else if (data.photo) {
				const photo = Array.isArray(data.photo) ? data.photo[0] : data.photo
				return `${url}/images/built/${(photo.url || photo).replace("jpg", "jpeg")}`
			}
			return url + favicon
		},
		authors: async (data) => {
			if (data.authors) {
				return data.authors
			} else if (getType(data).url) {
				let typeAuthors = getPerson(await people(), getType(data).url, "object")
				if (typeAuthors != getType(data).url) {
					return typeAuthors
				}
			}
			return []
		},
		in_reply_to_url: (data) => data?.in_reply_to?.url || data?.in_reply_to || false,
		in_reply_to_title: (data) => data?.in_reply_to?.title || data?.in_reply_to?.url || data?.in_reply_to || false,
		syndicate_to: (data) => {
			if (data.drink_of) {
				return [`https://untappd.com/user/${untappd}/checkin/${data.page.fileSlug}`]
			} else if (data.listen_of) {
				return [`https://album.link/s/${data.listen_of}`]
			} else if (data.read_of) {
				return [`https://openlibrary.org/isbn/${data.read_of}`]
			}
			return data.syndicate_to || []
		},
		webmentions: (data) => {
			return data.show_responses ? getWebmentions(configWebmentions, configWebmentions.domain + data.page.url) : []
		},
		externalLikes: async (data) => {
			if (data.show_responses && data.syndicate_to) {
				const externalLikes = await getExternalLikes(data.syndicate_to)
					.then((externalLikes) => externalLikes)
					.catch(() => 0)

				return externalLikes
			}
			return 0
		},
		// <head> links currently broken because this logic lives in browse.njk
		// previous_post: collections[category] | arrayKeyIncludes('data.tags', 'post') | arePublished | getPreviousCollectionItem(page),
		// next_post: collections[category] | arrayKeyIncludes('data.tags', 'post') | arePublished | getNextCollectionItem(page),
	},
}

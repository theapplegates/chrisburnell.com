const cheerio = require("cheerio")
const slugify = require("@sindresorhus/slugify")

const minify = (input) => {
	return input.replace(/\s{2,}/g, "").replace(/\'/g, '"')
}

module.exports = async (value, outputPath) => {
	if (outputPath && outputPath.endsWith(".html")) {
		const $ = cheerio.load(value)

		// We have to process headings from table of contents before adding
		// the permalink to them later, or the links will include the text of
		// the permalink.
		const tocHeadings = $(".generate-toc h2")
		if (tocHeadings.length) {
			let tocHtml = `
				<aside class=" [ meta ] " role="complementary">
					<is-land class=" [ table-of-contents ] " on:visible>
						<details-utils force-close="(max-width: 850px)" force-restore>
							<details open>
								<summary>Table of Contents</summary>
								<div class=" [ box ] ">
									<ol>`
			tocHeadings.each((i, element) => {
				const headingText = $(element)
					.html()
					.replace(/\s+<small>.*<\/small>$/g, "")
				const headingID = $(element).attr("id") || slugify(headingText.toLowerCase())
				tocHtml += `<li><a href="#${headingID}">${headingText}</a></li>`
			})
			tocHtml += `			</ol>
								</div>
							</details>
						</details-utils>
						<template data-island="once">
							<script src="/js/components/details-utils.js"></script>
						</template>
					</is-land>
				</aside>`
			$(tocHtml).insertBefore(".content")
			$(".generate-toc").removeClass("generate-toc")
		}

		// Process and generate fragment anchors for content headings
		const articleHeadings = $(".content h2:not(.no-fragment)")
		articleHeadings.each((i, element) => {
			const headingID =
				$(element).attr("id") ||
				slugify(
					$(element)
						.text()
						.toLowerCase()
						.replace(/([.‘’“”])/g, "")
				)
			$(element).html(
				minify(`
				${$(element).html()}
				<a class=" [ fragment-anchor ] " href="#${headingID}" title="Permalink for ${$(element).text().trim()}">
					<span class="hidden"> permalink</span>
					¶
				</a>
			`)
			)
			$(element).attr("id", headingID)
		})

		// Make sure <ul> elements are accessible even with `list-style: none` in Safari
		const unordered = $("ul")
		unordered.each((i, element) => {
			$(element).attr("role", "list")
		})

		// Make <pre> code blocks keyboard-accessible by adding `tabindex="0"`
		const preformatted = $("pre > code")
		preformatted.each((i, element) => {
			$(element).attr("tabindex", 0)
		})

		return $.root().html()
	}

	return value
}

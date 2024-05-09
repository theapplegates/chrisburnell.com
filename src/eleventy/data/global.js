import dotenv from "dotenv"
dotenv.config()

export const personalApiKey = process.env.PERSONAL_API_KEY || ""

export const nowEpoch = Date.now()
export const nowISO = new Date().toISOString()

export const currentYear = new Date().getFullYear()

const cssNakedDayStart = `${currentYear}-04-09T00:00:00+1400`
const cssNakedDayEnd = `${currentYear}-04-09T23:59:59-1200`
const cssNakedDayStartEpoch = new Date(cssNakedDayStart).getTime()
const cssNakedDayEndEpoch = new Date(cssNakedDayEnd).getTime()
export const isCSSNakedDay = cssNakedDayStartEpoch <= nowEpoch && nowEpoch <= cssNakedDayEndEpoch

const jsNakedDayStart = `${currentYear}-04-24T00:00:00+1400`
const jsNakedDayEnd = `${currentYear}-04-24T23:59:59-1200`
const jsNakedDayStartEpoch = new Date(jsNakedDayStart).getTime()
const jsNakedDayEndEpoch = new Date(jsNakedDayEnd).getTime()
export const isJSNakedDay = jsNakedDayStartEpoch <= nowEpoch && nowEpoch <= jsNakedDayEndEpoch

const segment = () => {
	return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
}
export const random = `${segment()}-${segment()}-${segment()}`

export default {
	personalApiKey,
	currentYear,
	nowEpoch,
	nowISO,
	isCSSNakedDay,
	isJSNakedDay,
	random,
}

import React, { useContext } from 'react'
import ReactDOMServer from 'react-dom/server'
// @ts-ignore
import DOMPurify from 'dompurify'
import { get } from './utils'

const regex = /{{([\s\S]+?)}}/g

type MessageID = string
type MessageValues = {
	[key: string]: any
}

export interface TranslateProps {
	id: MessageID
	values?: MessageValues
}

type TranslateLocale = Record<MessageID, string>

export interface TranslateMessages {
	[locale: string]: TranslateLocale
}

export interface TranslateProviderProps {
	messages: TranslateMessages
	locale: string
	defaultLocale?: string
}

export interface WithTranslateProps {
	translate: string
}

const TranslateContext = React.createContext<TranslateProviderProps>({
	messages: {},
	locale: 'en'
})

const getReplacements = (message: MessageID): { key: string; replace: string }[] => {
	const keys = []

	let m
	while ((m = regex.exec(message)) !== null) {
		if (m.index === regex.lastIndex) {
			regex.lastIndex++
		}

		const replace = m[0]
		const key = m[1]

		keys.push({
			key,
			replace
		})
	}

	return keys
}

export const TranslateProvider: React.FC<TranslateProviderProps> = ({ children, ...props }) => {
	return <TranslateContext.Provider value={props} children={children} />
}

export const Translate = ({ id, values = {} }: TranslateProps) => {
	const translate = useTranslate()

	return <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(translate(id, values), { USE_PROFILES: { html: true }, ADD_ATTR: ['target'] }) }} />
}

export const useTranslate = () => {
	const { messages, locale, defaultLocale } = useContext(TranslateContext)

	return (id: MessageID, values: MessageValues = {}) => {
		let message = messages[locale][id] || (defaultLocale ? messages[defaultLocale][id] || id : id)

		if (message) {
			const keys = getReplacements(message)

			keys.forEach(({ key, replace }) => {
				let value = get(values, key) || ''

				if (React.isValidElement(value)) value = ReactDOMServer.renderToStaticMarkup(<TranslateContext.Provider value={{ messages, locale, defaultLocale }}>{value}</TranslateContext.Provider>)

				message = message.replace(new RegExp(replace, 'g'), value)
			})
		}

		return message
	}
}

export const withTranslate = <T extends WithTranslateProps>(WrappedComponent: React.ComponentType<T>) => {
	return (props: Omit<T, keyof WithTranslateProps>) => {
		const translate = useTranslate()

		return <WrappedComponent {...(props as T)} translate={translate} />
	}
}

export const formatMessage = (message: MessageID, values: MessageValues) => {
	if (message) {
		const keys = getReplacements(message)

		keys.forEach(({ key, replace }) => {
			const value = get(values, key) || ''

			message = message.replace(new RegExp(replace, 'g'), value)
		})
	}

	return message
}

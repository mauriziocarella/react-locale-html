import React, { useContext } from 'react'
import ReactDOMServer from 'react-dom/server'
// @ts-ignore
import DOMPurify from 'dompurify'

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

export const TranslateProvider: React.FC<TranslateProviderProps> = ({ children, ...props }) => {
	return <TranslateContext.Provider value={props} children={children} />
}

export const Translate = ({ id, values = {} }: TranslateProps) => {
	const translate = useTranslate()

	return <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(translate(id, values)) }} />
}

export const useTranslate = () => {
	const { messages, locale, defaultLocale } = useContext(TranslateContext)

	return (id: MessageID, values: MessageValues = {}) => {
		let message = messages[locale][id] || (defaultLocale ? messages[defaultLocale][id] || id : id)

		if (message) {
			let m
			while ((m = regex.exec(message)) !== null) {
				const replace = m[0]
				const key = m[1]
				let value = values[key] || ''

				if (React.isValidElement(value)) value = ReactDOMServer.renderToStaticMarkup(<TranslateContext.Provider
					value={{ messages, locale, defaultLocale }}>{value}</TranslateContext.Provider>)

				message = message.replaceAll(replace, value)
			}
		}

		return message
	}
}

export const withTranslate = <T extends WithTranslateProps>(WrappedComponent: React.ComponentType<T>) => {
	const ComponentWithExtraInfo = (props: Omit<T, keyof WithTranslateProps>) => {
		const translate = useTranslate()

		// At this point, the props being passed in are the original props the component expects.
		return <WrappedComponent {...(props as T)} translate={translate} />
	}
	return ComponentWithExtraInfo
}

export const formatMessage = (message: MessageID, values: MessageValues) => {
	if (message) {
		let m
		while ((m = regex.exec(message)) !== null) {
			const replace = m[0]
			const key = m[1]
			const value = values[key] || ''

			message = message.replaceAll(replace, value)
		}
	}

	return message
}

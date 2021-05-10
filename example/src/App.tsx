import React, { useState } from 'react'
import classNames from 'classnames'

import { TranslateMessages, TranslateProvider, Translate, useTranslate } from 'react-locale-html'

import './App.scss'

const Icon = () => <span role="img" aria-label="smile">😃</span>

const messages: TranslateMessages = {
	en: {
		hello: 'Hello <b>{{name}}</b>!',
		notFound: 'Sorry cant find this page 😔',
		nested: 'Click this button {{button}}',
		placeholder: 'Username placeholder',
		'actions.submit': 'Submit',
	},
	it: {
		hello: 'Ciao <b>{{name}}</b>!',
		placeholder: 'Nome utente placeholder',
		'actions.submit': 'Invia',
	}
}

interface ExampleProps {
	locale: string,
	setLocale: (locale: string) => void,
}

const Example = ({locale, setLocale}: ExampleProps) => {
	const translate = useTranslate();

	return (
		<div className="container">
			<div className="btn-group mb-2">
				<button type="button" className={classNames("btn btn-outline-primary", {active: locale === 'en'})} onClick={() => setLocale('en')}>EN</button>
				<button type="button" className={classNames("btn btn-outline-primary", {active: locale === 'it'})} onClick={() => setLocale('it')}>IT</button>
			</div>

			<h1><Translate id="hello" values={{name: <span>Maurizio <Icon/></span>}} /></h1>
			<h1><Translate id="nested" values={{button: <button type="button" className="btn btn-sm btn-secondary"><Translate id="actions.submit"/></button>}} /></h1>
			<h3><Translate id="notFound"/></h3>


			<input className="form-control" placeholder={translate('placeholder')}/>

		</div>
	)
};

const App = () => {
	const [locale, setLocale] = useState('en')

	return (
		<TranslateProvider messages={messages} locale={locale} defaultLocale="en">
			<Example locale={locale} setLocale={setLocale} />
		</TranslateProvider>
	)
}

export default App

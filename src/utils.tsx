export const get = (obj: Object, path: string, defaultValue = undefined) => {
	const travel = (regexp: RegExp) =>
		String.prototype.split
			.call(path, regexp)
			.filter(Boolean)
			.reduce((res: Object, key: string) => (res !== null && res !== undefined ? res[key] : res), obj)
	const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/)
	return result === undefined || result === obj ? defaultValue : result
}

import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @route '/.well-known/passkey-endpoints'
*/
export const passkeys = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: passkeys.url(options),
    method: 'get',
})

passkeys.definition = {
    methods: ["get","head"],
    url: '/.well-known/passkey-endpoints',
} satisfies RouteDefinition<["get","head"]>

/**
* @route '/.well-known/passkey-endpoints'
*/
passkeys.url = (options?: RouteQueryOptions) => {
    return passkeys.definition.url + queryParams(options)
}

/**
* @route '/.well-known/passkey-endpoints'
*/
passkeys.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: passkeys.url(options),
    method: 'get',
})

/**
* @route '/.well-known/passkey-endpoints'
*/
passkeys.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: passkeys.url(options),
    method: 'head',
})

/**
* @route '/.well-known/passkey-endpoints'
*/
const passkeysForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: passkeys.url(options),
    method: 'get',
})

/**
* @route '/.well-known/passkey-endpoints'
*/
passkeysForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: passkeys.url(options),
    method: 'get',
})

/**
* @route '/.well-known/passkey-endpoints'
*/
passkeysForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: passkeys.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

passkeys.form = passkeysForm

const wellKnown = {
    passkeys: Object.assign(passkeys, passkeys),
}

export default wellKnown
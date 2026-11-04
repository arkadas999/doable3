import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\TimezoneController::timezone
* @route '/preferences/timezone'
*/
export const timezone = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: timezone.url(options),
    method: 'patch',
})

timezone.definition = {
    methods: ["patch"],
    url: '/preferences/timezone',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\TimezoneController::timezone
* @route '/preferences/timezone'
*/
timezone.url = (options?: RouteQueryOptions) => {
    return timezone.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TimezoneController::timezone
* @route '/preferences/timezone'
*/
timezone.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: timezone.url(options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\TimezoneController::timezone
* @route '/preferences/timezone'
*/
const timezoneForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: timezone.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TimezoneController::timezone
* @route '/preferences/timezone'
*/
timezoneForm.patch = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: timezone.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

timezone.form = timezoneForm

/**
* @see \App\Http\Controllers\AccentController::accent
* @route '/preferences/accent'
*/
export const accent = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: accent.url(options),
    method: 'patch',
})

accent.definition = {
    methods: ["patch"],
    url: '/preferences/accent',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\AccentController::accent
* @route '/preferences/accent'
*/
accent.url = (options?: RouteQueryOptions) => {
    return accent.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AccentController::accent
* @route '/preferences/accent'
*/
accent.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: accent.url(options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\AccentController::accent
* @route '/preferences/accent'
*/
const accentForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: accent.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AccentController::accent
* @route '/preferences/accent'
*/
accentForm.patch = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: accent.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

accent.form = accentForm

const preferences = {
    timezone: Object.assign(timezone, timezone),
    accent: Object.assign(accent, accent),
}

export default preferences